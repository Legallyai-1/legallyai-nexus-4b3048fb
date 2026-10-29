import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CONTENTION_RETRY_MESSAGE,
  DOCUMENT_EXPORT_CHECKOUT_MODE,
  DOCUMENT_EXPORT_PRICE_ID,
  canExportHubDocument,
  invokeWithContentionRetry,
  parseGenerateDocumentResponse,
  shouldOfferDocumentPurchase,
  type GenerateInvokeOutcome,
} from "../src/lib/document-export-entitlement.ts";

test("AI response unlocks export for that document", () => {
  const r = parseGenerateDocumentResponse({ document: " Draft ", success: true, mode: "ai", exportUnlocked: true, purchaseRequired: false, documentsRemaining: 0 });
  assert.deepEqual(r, { document: "Draft", mode: "ai", exportUnlocked: true, purchaseRequired: false, paidAiAvailable: true, documentsRemaining: 0, reason: null });
  assert.equal(shouldOfferDocumentPurchase(r, true), false);
});

test("purchase-required worksheet stays locked and offers the $5 purchase", () => {
  const r = parseGenerateDocumentResponse({ document: "Worksheet", mode: "template", exportUnlocked: false, purchaseRequired: true, reason: "exhausted" });
  assert.equal(r?.mode, "template");
  assert.equal(r?.exportUnlocked, false);
  assert.equal(r?.reason, "exhausted");
  assert.equal(shouldOfferDocumentPurchase(r, true), true);
  assert.equal(shouldOfferDocumentPurchase(r, false), false, "no offer when client payments are disabled");
});

test("paid AI unavailable hides any purchase offer", () => {
  const r = parseGenerateDocumentResponse({ document: "Worksheet", mode: "template", exportUnlocked: false, purchaseRequired: false, paidAiAvailable: false });
  assert.equal(r?.paidAiAvailable, false);
  assert.equal(shouldOfferDocumentPurchase(r, true), false);
  assert.equal(shouldOfferDocumentPurchase({ ...r!, purchaseRequired: true }, true), false);
});

test("fails closed: missing fields never unlock export or claim AI", () => {
  const r = parseGenerateDocumentResponse({ document: "x" });
  assert.equal(r?.exportUnlocked, false);
  assert.equal(r?.mode, "template");
  assert.equal(parseGenerateDocumentResponse({ document: "" }), null);
  assert.equal(parseGenerateDocumentResponse(null), null);
});

test("export gate matches /generate: server unlock, or payments disabled", () => {
  const locked = parseGenerateDocumentResponse({ document: "w", mode: "template", exportUnlocked: false, purchaseRequired: true });
  const unlocked = parseGenerateDocumentResponse({ document: "d", mode: "ai", exportUnlocked: true });
  assert.equal(canExportHubDocument(locked, true), false);
  assert.equal(canExportHubDocument(unlocked, true), true);
  assert.equal(canExportHubDocument(locked, false), true, "nothing to buy when payments are disabled");
  assert.equal(canExportHubDocument(null, false), false);
});

const ok: GenerateInvokeOutcome = { data: { document: "d" }, status: 200, errorMessage: null };
const busy: GenerateInvokeOutcome = { data: null, status: 409, errorMessage: "busy" };
const noWait = async () => {};

test("409 retries exactly once, then returns the retry message", async () => {
  let calls = 0;
  const recovered = await invokeWithContentionRetry(async () => (++calls === 1 ? busy : ok), noWait);
  assert.equal(calls, 2);
  assert.equal(recovered.status, 200);

  calls = 0;
  const still = await invokeWithContentionRetry(async () => { calls++; return busy; }, noWait);
  assert.equal(calls, 2);
  assert.equal(still.errorMessage, CONTENTION_RETRY_MESSAGE);

  calls = 0;
  await invokeWithContentionRetry(async () => { calls++; return { data: null, status: 500, errorMessage: "x" }; }, noWait);
  assert.equal(calls, 1, "non-409 errors are not retried");
});

test("hub checkout uses the same one-time price as /generate", () => {
  assert.equal(DOCUMENT_EXPORT_CHECKOUT_MODE, "payment");
  const generatePage = readFileSync(new URL("../src/pages/GeneratePage.tsx", import.meta.url), "utf8");
  assert.ok(generatePage.includes(DOCUMENT_EXPORT_PRICE_ID));
});

test("hub generators gate exports on the server's exportUnlocked", () => {
  for (const file of ["DocumentGenerator.tsx", "DocuAI.tsx"]) {
    const src = readFileSync(new URL(`../src/components/hub/${file}`, import.meta.url), "utf8");
    assert.ok(src.includes("requestHubDocument"), `${file} uses the shared generate-document call`);
    assert.ok(src.includes("canExportHubDocument"), `${file} gates on the server unlock`);
    assert.ok(!src.includes("functions.invoke('generate-document'") && !src.includes('functions.invoke("generate-document"'), `${file} has no ungated direct call`);
  }
});
