// Tests for on-device Private AI helpers (no model download needed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const src = readFileSync(new URL("../src/lib/privateAI.ts", import.meta.url), "utf8");
const { code } = transformSync(src, { loader: "ts", format: "esm" });
const p = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const guide = "Here is general legal information.\n\n## Eviction\nSteps.\n- [HUD: tenant rights](https://www.hud.gov/x)\n- [LSC](https://www.lsc.gov/find-legal-aid)\n- [HUD again](https://www.hud.gov/x)\n\n---\n\nThis is general legal information from LegallyAI's built-in legal guide, not legal advice.";

test("prompt contains the guide notes but not the footer", () => {
  const { system, user } = p.buildPrivatePrompt("Can my landlord evict me?", guide);
  assert.match(system, /VERIFIED GUIDE:/);
  assert.match(system, /## Eviction/);
  assert.doesNotMatch(system, /not legal advice\.$/);
  assert.equal(user, "Can my landlord evict me?");
});

test("final answer re-attaches unique official links and an on-device disclaimer", () => {
  const out = p.finalizePrivateAnswer("You have rights.", guide);
  assert.equal((out.match(/hud\.gov/g) || []).length, 1);
  assert.match(out, /lsc\.gov/);
  assert.match(out, /Written on your device/);
});

test("crisis and no-match answers are never rewritten", async () => {
  const engine = { chat: { completions: { create: () => { throw new Error("should not run"); } } } };
  assert.equal(await p.generatePrivateAnswer(engine, "q", "If you or someone else is in immediate danger, call 911 now.", () => {}), null);
  assert.equal(await p.generatePrivateAnswer(engine, "q", "I could not match your question to a topic", () => {}), null);
});

test("streams model output then finalizes", async () => {
  const engine = { chat: { completions: { create: async () => (async function* () {
    yield { choices: [{ delta: { content: "Part one. " } }] };
    yield { choices: [{ delta: { content: "Part two." } }] };
  })() } }, interruptGenerate: async () => {} };
  const seen = [];
  const out = await p.generatePrivateAnswer(engine, "q", guide, (t) => seen.push(t));
  assert.deepEqual(seen, ["Part one. ", "Part one. Part two."]);
  assert.match(out, /^Part one\. Part two\./);
});

test("WebGPU detection is false outside a browser", async () => {
  assert.deepEqual(await p.detectWebGPU(), { supported: false, f16: false });
});
