// Regression tests for the in-house legal guide (no network, no AI model).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const source = readFileSync(new URL("../supabase/functions/_shared/legal-knowledge.ts", import.meta.url), "utf8");
const { code } = transformSync(source, { loader: "ts", format: "esm" });
const kb = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

const ask = (content, hub = "general") => kb.answerFromKnowledge([{ role: "user", content }], hub);

test("eviction question in Sacramento routes to eviction with California resources", () => {
  const a = ask("My landlord gave me a 3-day notice in Sacramento");
  assert.equal(a.topics[0], "eviction");
  assert.equal(a.state, "CA");
  assert.match(a.text, /selfhelp\.courts\.ca\.gov\/eviction/);
  assert.match(a.text, /not legal advice/);
});

test("non-California state hides California-only links", () => {
  const a = ask("I got a speeding ticket in Texas", "defense");
  assert.equal(a.topics[0], "traffic");
  assert.equal(a.state, "TX");
  assert.doesNotMatch(a.text, /courts\.ca\.gov/);
  assert.match(a.text, /Texas courts: self-help and forms\]\(https:\/\/www\.texaslawhelp\.org\)/);
  assert.match(a.text, /lsc\.gov\/find-legal-aid/);
});

test("lowercase ambiguous words are not treated as state codes", () => {
  assert.equal(kb.detectState("I am in trouble or me"), null);
  assert.equal(kb.detectState("Moving to OR next month")?.code, "OR");
  assert.equal(kb.detectState("west virginia custody")?.code, "WV");
});

test("emergency language returns crisis resources first", () => {
  const a = ask("he has a gun and I am scared");
  assert.equal(a.emergency, true);
  assert.match(a.text, /911/);
  assert.match(a.text, /988/);
});

test("workplace topics", () => {
  assert.equal(ask("My boss won't pay my overtime", "workplace").topics[0], "wages");
  assert.equal(ask("I was fired after reporting harassment", "workplace").topics[0], "discrimination");
});

test("follow-up without keywords uses earlier conversation", () => {
  const a = kb.answerFromKnowledge([
    { role: "user", content: "Question about child custody in Florida" },
    { role: "assistant", content: "..." },
    { role: "user", content: "what should I do first?" },
  ], "custody");
  assert.equal(a.topics[0], "custody");
  assert.equal(a.state, "FL");
});

test("unknown question returns topic menu and legal aid link", () => {
  const a = ask("hello there");
  assert.deepEqual(a.topics, []);
  assert.match(a.text, /lsc\.gov\/find-legal-aid/);
});

test("'will' only matches estate context", () => {
  assert.notEqual(ask("Will the landlord evict me?").topics[0], "estate");
  assert.equal(ask("I need to write my will").topics[0], "estate");
});

test("site suggested questions all match a topic", () => {
  assert.equal(ask("What are my rights as a tenant in California?").topics[0], "eviction");
  assert.equal(ask("How do I form an LLC in Texas?").topics[0], "business-formation");
  assert.equal(ask("What should be included in a freelance contract?").topics[0], "contracts");
  assert.equal(ask("How does child custody work in New York?").topics[0], "custody");
  assert.equal(ask("What is the difference between a will and a trust?").topics[0], "estate");
});

test("state directory covers all 50 states and DC with https links", () => {
  assert.equal(Object.keys(kb.STATE_COURT_HELP).length, 51);
  assert.ok(Object.values(kb.STATE_COURT_HELP).every((u) => u.startsWith("https://")));
});

test("every topic has steps, resources with https links, and attorney guidance", () => {
  for (const t of kb.LEGAL_TOPICS) {
    assert.ok(t.steps.length >= 3, t.id);
    assert.ok(t.resources.length >= 1 && t.resources.every((r) => r.url.startsWith("https://")), t.id);
    assert.ok(t.attorneyWhen.length > 0, t.id);
  }
});
