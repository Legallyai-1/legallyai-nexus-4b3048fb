import test from "node:test";
import assert from "node:assert/strict";
import { canShowAdOn } from "../src/lib/adRoutes.ts";
import {
  getAdEligibility,
  isAdFreeTier,
  resolveAdEligibility,
  setAdEligibility,
  shouldShowAds,
  subscribeToAdEligibility,
} from "../src/lib/subscription.ts";

test("only the free tier sees ads; every other tier is ad-free", () => {
  for (const tier of ["free", "FREE", " free ", null, undefined, ""]) assert.equal(isAdFreeTier(tier), false, String(tier));
  for (const tier of ["premium", "document", "pro", "solo", "firm", "large_firm", "enterprise", "Firm"]) {
    assert.equal(isAdFreeTier(tier), true, tier);
  }
});

test("active or trialing subscriptions are ad-free even if the tier reads free", () => {
  assert.equal(isAdFreeTier("free", "trialing"), true);
  assert.equal(isAdFreeTier("free", "active"), true);
  assert.equal(isAdFreeTier("free", "canceled"), false);
});

test("eligibility resolves to free only when the plan is known to be free", () => {
  assert.equal(resolveAdEligibility({ signedIn: false }), "free");
  assert.equal(resolveAdEligibility({ signedIn: true, tier: "free" }), "free");
  assert.equal(resolveAdEligibility({ signedIn: true, tier: "solo" }), "paid");
  assert.equal(resolveAdEligibility({ signedIn: true, tier: "free", status: "trialing" }), "paid");
  assert.equal(resolveAdEligibility({ signedIn: true, failed: true }), "unknown");
});

test("no ads until the tier has resolved, and none for paid users", () => {
  assert.equal(getAdEligibility(), "unknown");
  assert.equal(shouldShowAds(), false);
  assert.equal(canShowAdOn("/", "unknown"), false);
  assert.equal(canShowAdOn("/", "paid"), false);
  assert.equal(canShowAdOn("/", "free"), true);
});

test("free visitors only get ads on the allowlisted pages", () => {
  for (const path of ["/", "/ai-assistants", "/templates", "/legal-academy", "/pro-bono", "/jobs"]) {
    assert.equal(canShowAdOn(path, "free"), true, path);
  }
  for (const path of ["/chat", "/pricing", "/custody", "/dashboard", "/business-hub", "/generate", "/login", "/terms", "/invoices"]) {
    assert.equal(canShowAdOn(path, "free"), false, path);
  }
});

test("eligibility store notifies subscribers on change", () => {
  let calls = 0;
  const unsubscribe = subscribeToAdEligibility(() => { calls += 1; });
  setAdEligibility("free");
  assert.equal(shouldShowAds(), true);
  setAdEligibility("free");
  setAdEligibility("paid");
  assert.equal(shouldShowAds(), false);
  unsubscribe();
  setAdEligibility("unknown");
  assert.equal(calls, 2);
});
