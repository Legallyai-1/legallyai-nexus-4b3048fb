// Tests for the free AI engine: provider fallback chain and embedding-based matching.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const load = async (rel, replace = (s) => s) => {
  const src = replace(readFileSync(new URL(rel, import.meta.url), "utf8"));
  const { code } = transformSync(src, { loader: "ts", format: "esm" });
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
};
const ai = await load("../supabase/functions/_shared/free-ai.ts");
const kb = await load("../supabase/functions/_shared/legal-knowledge.ts");
const { TOPIC_EMBEDDINGS } = await load("../supabase/functions/_shared/legal-topic-embeddings.ts", (s) => s.replace(/^import type.*$/m, ""));
const env = (o) => ({ get: (k) => o[k] });

test("no keys means no providers (in-house guide only)", () => {
  assert.deepEqual(ai.getFreeProviders(env({})), []);
});

test("provider order: Groq, OpenRouter, custom, then paid xAI Grok last; https only", () => {
  const p = ai.getFreeProviders(env({ GROQ_API_KEY: "g", OPENROUTER_API_KEY: "o", OPENROUTER_MODEL: "x:free", FREE_AI_API_KEY: "c", FREE_AI_BASE_URL: "https://ex.com/v1/", FREE_AI_MODEL: "m" }));
  assert.deepEqual(p.map((x) => x.name), ["groq", "openrouter", "custom"]);
  assert.equal(p[0].model, "openai/gpt-oss-120b");
  assert.equal(p[2].baseUrl, "https://ex.com/v1");
  const withXai = ai.getFreeProviders(env({ GROK_API_KEY: "xai-key", GROQ_API_KEY: "g" }));
  assert.deepEqual(withXai.map((x) => x.name), ["groq", "xai"]);
  assert.equal(withXai[1].baseUrl, "https://api.x.ai/v1");
  assert.equal(withXai[1].model, "grok-3-mini");
  assert.deepEqual(ai.getFreeProviders(env({ XAI_API_KEY: "xai-key" })).map((x) => x.name), ["xai"]);
  assert.equal(ai.getFreeProviders(env({ FREE_AI_API_KEY: "c", FREE_AI_BASE_URL: "http://insecure", FREE_AI_MODEL: "m" })).length, 0);
  assert.equal(ai.getFreeProviders(env({ OPENROUTER_API_KEY: "o" })).length, 0);
});

test("falls through a rate-limited provider to the next one", async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push(url);
    if (url.includes("groq")) return new Response("{}", { status: 429 });
    assert.match(JSON.parse(init.body).messages[0].content, /VERIFIED LEGALLYAI GUIDE NOTES/);
    return new Response(JSON.stringify({ choices: [{ message: { content: "Answer" } }] }), { status: 200 });
  };
  const providers = ai.getFreeProviders(env({ GROQ_API_KEY: "g", OPENROUTER_API_KEY: "o", OPENROUTER_MODEL: "x:free" }));
  const system = ai.buildGroundedSystem("base", kb.groundingNotes(["eviction"]), "California");
  const r = await ai.callFreeModel(providers, system, [{ role: "user", content: "hi" }], fakeFetch);
  assert.deepEqual(r, { text: "Answer", provider: "openrouter" });
  assert.equal(calls.length, 2);
});

test("returns null when every provider fails, so the guide is used", async () => {
  const r = await ai.callFreeModel(ai.getFreeProviders(env({ GROQ_API_KEY: "g" })), "s", [{ role: "user", content: "q" }], async () => { throw new Error("network"); });
  assert.equal(r, null);
});

test("embedding table covers every topic with 384-dim vectors", () => {
  const ids = new Set(TOPIC_EMBEDDINGS.map((e) => e.id));
  for (const t of kb.LEGAL_TOPICS) assert.ok(ids.has(t.id), `missing ${t.id}`);
  assert.ok(TOPIC_EMBEDDINGS.every((e) => e.vector.length === 384));
});

test("semantic match picks a topic when keywords do not", () => {
  const q = TOPIC_EMBEDDINGS.find((e) => e.id === "custody").vector;
  const msgs = [{ role: "user", content: "my ex won't let me see my kids" }];
  assert.equal(kb.needsSemanticMatch(msgs, "general"), true);
  const a = kb.answerFromKnowledge(msgs, "general", { queryEmbedding: q, topicEmbeddings: TOPIC_EMBEDDINGS });
  assert.equal(a.topics[0], "custody");
});

test("weak semantic similarity is ignored", () => {
  const far = new Array(384).fill(0); far[0] = 1;
  const a = kb.answerFromKnowledge([{ role: "user", content: "hello there" }], "general", { queryEmbedding: far, topicEmbeddings: TOPIC_EMBEDDINGS });
  assert.deepEqual(a.topics, []);
});

test("grounding notes contain only verified official links", () => {
  const n = kb.groundingNotes(["business-formation"]);
  assert.match(n, /sba\.gov/);
  assert.doesNotMatch(n, /http:\/\//);
});

test("total budget stops a slow provider chain so the in-house answer can be used", async () => {
  const providers = [{ name: "a", baseUrl: "https://a", apiKey: "k", model: "m" }, { name: "b", baseUrl: "https://b", apiKey: "k", model: "m" }];
  const calls = [];
  const slow = (url, init) => { calls.push(url); return new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(new Error("aborted")))); };
  const started = Date.now();
  const result = await ai.callFreeModel(providers, "sys", [{ role: "user", content: "hi" }], slow, 5000, 1200);
  assert.equal(result, null);
  assert.ok(Date.now() - started < 3000);
  assert.deepEqual(calls, ["https://a/chat/completions"]);
});

test("malformed JSON from one provider fails over to the next", async () => {
  const providers = [{ name: "a", baseUrl: "https://a", apiKey: "k", model: "m" }, { name: "b", baseUrl: "https://b", apiKey: "k", model: "m" }];
  const fetchImpl = async (url) => url.startsWith("https://a")
    ? new Response("not json", { status: 200 })
    : new Response(JSON.stringify({ choices: [{ message: { content: " ok " } }] }), { status: 200 });
  assert.deepEqual(await ai.callFreeModel(providers, "sys", [{ role: "user", content: "hi" }], fetchImpl), { text: "ok", provider: "b" });
});
