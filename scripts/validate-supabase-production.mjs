import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const migration = readFileSync(new URL("./supabase/migrations/20260924034737_restore_core_app_schema_and_stripe_billing.sql", root), "utf8");
const webhookHandler = readFileSync(new URL("./supabase/functions/webhook-handler/index.ts", root), "utf8");
const verifyPayment = readFileSync(new URL("./supabase/functions/verify-payment/index.ts", root), "utf8");
const checkSubscription = readFileSync(new URL("./supabase/functions/check-subscription/index.ts", root), "utf8");
const onboardingPage = readFileSync(new URL("./src/pages/OnboardingPage.tsx", root), "utf8");
const configToml = readFileSync(new URL("./supabase/config.toml", root), "utf8");

assert.match(migration, /create table if not exists public\.organization_members/i, "migration should restore organization_members");
assert.match(migration, /create table if not exists public\.user_roles/i, "migration should restore user_roles");
assert.match(migration, /create table if not exists public\.clients/i, "migration should restore clients");
assert.match(migration, /alter column session_id type text/i, "ai_chat_history.session_id must be text");
assert.match(migration, /users may only deduct their own credits/i, "deduct_ai_credits must forbid cross-user deductions");
assert.match(migration, /credit cost must be a positive integer/i, "deduct_ai_credits must validate positive costs");
assert.match(migration, /owner_id = auth\.uid\(\)/i, "organization ownership policy must rely on owner_id");
assert.match(migration, /webhook_logs_source_event_id_key/i, "webhook event idempotency index must exist");
assert.doesNotMatch(migration, /drop table\s+public\.org_members/i, "legacy public.org_members must not be dropped");
assert.doesNotMatch(migration, /alter table\s+public\.org_members\s+rename/i, "legacy public.org_members must not be renamed");

assert.match(configToml, /\[functions\.webhook-handler\]\s*verify_jwt = false/i, "webhook-handler must skip JWT verification");
assert.match(webhookHandler, /await req\.text\(\)/i, "webhook handler must verify against the raw request body");
assert.match(webhookHandler, /stripe\.webhooks\.constructEvent/i, "webhook handler must verify the Stripe signature");
assert.match(webhookHandler, /source", "stripe"/i, "webhook handler must persist Stripe events to webhook_logs");
assert.match(webhookHandler, /processing_status: "processed"/i, "webhook handler must mark processed events");
assert.match(webhookHandler, /duplicate: true/i, "webhook handler must return idempotent duplicate responses");

assert.match(verifyPayment, /from\("subscriptions"\)/i, "verify-payment should read canonical subscription state");
assert.match(checkSubscription, /from\("subscriptions"\)/i, "check-subscription should read canonical subscription state");
assert.match(onboardingPage, /owner_id: user\.id/i, "onboarding must set owner_id for bootstrap membership");

console.log("Supabase production validation checks passed.");
