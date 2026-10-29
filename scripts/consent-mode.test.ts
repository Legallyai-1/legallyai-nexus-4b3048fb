import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONSENT_DEFAULT_REGIONS, isGoogleCmpActive, showGooglePrivacyChoices } from "../src/lib/consent.ts";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("Consent Mode defaults are the first script in <head>", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  const firstScript = head.indexOf("<script");
  assert.ok(firstScript > -1, "head has a script");
  assert.equal(firstScript, head.indexOf('<script id="consent-mode-defaults">'), "consent defaults must run before any other script");
  assert.ok(!/googlesyndication|googletagmanager/.test(head.slice(0, firstScript)), "no Google tag before the defaults");
});

test("ads, ad user data, personalization and analytics default to denied", () => {
  for (const key of ["ad_storage", "ad_user_data", "ad_personalization", "analytics_storage"]) {
    assert.match(html, new RegExp(`${key}: 'denied'`), key);
  }
});

test("index.html default regions match CONSENT_DEFAULT_REGIONS (EEA + UK + CH)", () => {
  const match = html.match(/region: \[([^\]]+)\]/);
  assert.ok(match);
  const regions = match[1].split(",").map((r) => r.trim().replace(/'/g, ""));
  assert.deepEqual(regions, [...CONSENT_DEFAULT_REGIONS]);
  for (const r of ["DE", "FR", "IE", "IS", "LI", "NO", "GB", "CH"]) assert.ok(regions.includes(r), r);
  assert.equal(regions.length, 32);
});

test("Google CMP detection and privacy-choices helper", () => {
  assert.equal(isGoogleCmpActive({}), false);
  assert.equal(isGoogleCmpActive({ __tcfapi: () => {} } as never), true);
  assert.equal(showGooglePrivacyChoices({}), false);
  let shown = 0;
  assert.equal(showGooglePrivacyChoices({ googlefc: { showRevocationMessage: () => { shown += 1; } } } as never), true);
  assert.equal(shown, 1);
  const queued = { googlefc: { callbackQueue: [] as unknown[] } };
  assert.equal(showGooglePrivacyChoices(queued as never), true);
  assert.equal(queued.googlefc.callbackQueue.length, 1);
});
