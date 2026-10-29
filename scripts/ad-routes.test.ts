import test from "node:test";
import assert from "node:assert/strict";
import { areAdsAllowedOnPath } from "../src/lib/adRoutes.ts";

test("ads are limited to public content pages", () => {
  for (const path of ["/", "/ai-assistants", "/templates/", "/legal-academy", "/guides", "/guides/how-to-fight-a-traffic-ticket", "/about", "/contact"]) assert.equal(areAdsAllowedOnPath(path), true, path);
});

test("no ads on chat, hubs, docs, pricing, auth, checkout or legal pages", () => {
  for (const path of ["/chat", "/pricing", "/login", "/signup", "/terms", "/privacy", "/disclaimer", "/generate", "/documents",
    "/dashboard", "/business-hub", "/lawyers", "/custody", "/dui-hub", "/payment-success", "/checkout", "/contract-review", "/settlement-estimator", "/nope", "/guides/a/b", "/guides/not-a-real-guide", "/settings", "/client-portal", "/auth", "/accept-invite"]) {
    assert.equal(areAdsAllowedOnPath(path), false, path);
  }
});
