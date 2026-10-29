import test from "node:test";
import assert from "node:assert/strict";
import {
  DOCUMENT_EXPORT_PRICE_ID,
  canExportDocument,
} from "../src/lib/document-export-entitlement.ts";

test("exports are blocked when payments are enabled and the user has not paid", () => {
  assert.equal(canExportDocument({ paymentsEnabled: true, hasPaid: false }), false);
});

test("exports are allowed once verify-payment reports hasPaid", () => {
  assert.equal(canExportDocument({ paymentsEnabled: true, hasPaid: true }), true);
});

test("exports are allowed when payments are disabled for the deployment (same as /generate)", () => {
  assert.equal(canExportDocument({ paymentsEnabled: false, hasPaid: false }), true);
});

test("hub exports use the same one-time price as /generate", async () => {
  const { readFile } = await import("node:fs/promises");
  const generatePage = await readFile(new URL("../src/pages/GeneratePage.tsx", import.meta.url), "utf8");
  assert.ok(generatePage.includes(DOCUMENT_EXPORT_PRICE_ID));
});
