import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTRACT_EXCERPT_LIMIT, prepareContractExcerpt } from "../src/lib/contract-review-input.ts";

test("contract handoff rejects empty input", () => {
  assert.equal(prepareContractExcerpt(" \n ").ok, false);
});

test("contract handoff preserves complete excerpt including final clause", () => {
  const ending = " CRITICAL_FINAL_CLAUSE";
  const text = "A".repeat(CONTRACT_EXCERPT_LIMIT - ending.length) + ending;
  const result = prepareContractExcerpt(text);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.prompt.endsWith(text));
    assert.ok(result.prompt.length <= 2000);
  }
});

test("oversized contract is rejected, never silently truncated", () => {
  const text = "A".repeat(CONTRACT_EXCERPT_LIMIT) + " CRITICAL_FINAL_CLAUSE";
  const result = prepareContractExcerpt(text);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /not been shortened or sent/);
});
