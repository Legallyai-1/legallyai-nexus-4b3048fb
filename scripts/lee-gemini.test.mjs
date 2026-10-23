// Tests for the Gemini web-search connector, Lee personas, and answer composition.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
const load = async (rel) => {
  const { code } = transformSync(readFileSync(new URL(rel, import.meta.url), "utf8"), { loader: "ts", format: "esm" });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
};
const g = await load("../supabase/functions/_shared/gemini.ts");
const lee = await load("../supabase/functions/_shared/lee-personas.ts");
const env = (o) => ({ get: (k) => o[k] });

test("no Gemini key means Gemini is skipped", () => assert.equal(g.getGeminiConfig(env({})), null));

test("models: preferred first, no duplicates", () => {
  assert.deepEqual(g.getGeminiConfig(env({ GEMINI_API_KEY: "a-key-long-enough", GEMINI_MODEL: "gemini-3.8-flash" })).models, ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"]);
});

test("accepts a key saved under the dashboard spelling 'Gemini API Key'", () => {
  assert.equal(g.getGeminiConfig(env({ "Gemini API Key": "a-key-long-enough" }))?.models[0], "gemini-3.5-flash-lite");
});

test("parses text and unique https grounding sources", () => {
  const r = g.parseGeminiResponse({ candidates: [{ content: { parts: [{ text: "Hello " }, { text: "world" }] }, groundingMetadata: { groundingChunks: [
    { web: { uri: "https://courts.ca.gov/a", title: "CA Courts" } }, { web: { uri: "https://courts.ca.gov/a", title: "dup" } }, { web: { uri: "http://bad" } } ] } }] });
  assert.equal(r.text, "Hello world");
  assert.deepEqual(r.sources, [{ title: "CA Courts", url: "https://courts.ca.gov/a" }]);
});

test("retries without search when search is not allowed, then succeeds", async () => {
  const bodies = [];
  const fake = async (url, init) => { const b = JSON.parse(init.body); bodies.push(!!b.tools);
    return b.tools ? new Response("{}", { status: 400 }) : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }), { status: 200 }); };
  const r = await g.callGemini({ apiKey: "k", models: ["m1"] }, "sys", [{ role: "user", content: "q" }], fake);
  assert.deepEqual(bodies, [true, false]);
  assert.equal(r.searched, false); assert.equal(r.text, "ok");
});

test("skips a missing model and returns null when all fail", async () => {
  const calls = [];
  const r = await g.callGemini({ apiKey: "k", models: ["gone", "down"] }, "s", [{ role: "user", content: "q" }], async (url) => { calls.push(url); return new Response("{}", { status: url.includes("gone") ? 404 : 500 }); });
  assert.equal(r, null); assert.equal(calls.length, 3);
});

test("answer includes sources, Google and YouTube research links, and disclaimer", () => {
  const out = g.composeAnswer("Answer.", [{ title: "A [x]", url: "https://a.gov" }], "custody forms california", "Not legal advice.");
  assert.match(out, /### Sources\n\n- \[A x\]\(https:\/\/a\.gov\)/);
  assert.match(out, /youtube\.com\/results\?search_query=custody%20forms%20california/);
  assert.match(out, /google\.com\/search\?q=/);
  assert.ok(out.endsWith("Not legal advice."));
});

test("every hub is Lee with its own name", () => {
  assert.equal(lee.personaFor("custody").name, "CustodiAI");
  assert.equal(lee.personaFor("unknown").name, "Lee");
  const p = lee.leeSystemPrompt("marriage", "California", "NOTES");
  assert.match(p, /You are MaryAI, a specialist version of Lee/);
  assert.match(p, /California official sources/);
  assert.match(p, /VERIFIED LEGALLYAI GUIDE NOTES:\nNOTES/);
});
