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
  assert.match(system, /GUIDE:/);
  assert.match(system, /Never mention statute numbers/);
  assert.match(system, /## Eviction/);
  assert.doesNotMatch(system, /not legal advice\.$/);
  assert.equal(user, "Can my landlord evict me?");
});

test("final answer keeps the full verified guide and labels the short answer", () => {
  const out = p.finalizePrivateAnswer("You have rights as a tenant.", guide);
  assert.match(out, /^### Short answer\n\nYou have rights as a tenant\./);
  assert.ok(out.endsWith(guide));
  assert.match(out, /may contain mistakes/);
});

test("invented statute sections, links, and numbers are filtered out", () => {
  const model = "Your landlord usually needs a court order. California Civil Code Section 1034 lets you sue. You have 3 days to respond. See https://fake.example. Contact legal aid.";
  const out = p.filterUnverified(model, guide);
  assert.equal(out, "Your landlord usually needs a court order. Contact legal aid.");
});

test("if everything is filtered, the plain guide answer is returned", () => {
  assert.equal(p.finalizePrivateAnswer("See Section 12 of the code.", guide), guide);
});

test("crisis and no-match answers are never rewritten", async () => {
  const engine = { chat: { completions: { create: () => { throw new Error("should not run"); } } } };
  assert.equal(await p.generatePrivateAnswer(engine, "q", "If you or someone else is in immediate danger, call 911 now.", () => {}), null);
  assert.equal(await p.generatePrivateAnswer(engine, "q", "I could not match your question to a topic", () => {}), null);
});

test("shows the guide while generating, then finalizes", async () => {
  const engine = { chat: { completions: { create: async () => (async function* () {
    yield { choices: [{ delta: { content: "Part one. " } }] };
    yield { choices: [{ delta: { content: "Part two." } }] };
  })() } }, interruptGenerate: async () => {} };
  const seen = [];
  const out = await p.generatePrivateAnswer(engine, "q", guide, (t) => seen.push(t));
  assert.equal(seen.length, 1);
  assert.match(seen[0], /^Writing a short answer on your device/);
  assert.match(out, /### Short answer\n\nPart one\. Part two\./);
});

test("WebGPU detection is false outside a browser", async () => {
  assert.deepEqual(await p.detectWebGPU(), { supported: false, f16: false });
});
