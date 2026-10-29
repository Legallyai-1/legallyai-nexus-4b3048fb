import test from 'node:test';
import assert from 'node:assert/strict';
import { createCheckoutHandler } from '../supabase/functions/_shared/create-checkout-handler.ts';
import { customerPortalHandler } from '../supabase/functions/_shared/customer-portal-handler.ts';

const PREMIUM = 'price_1Sdfqp0QhWGUtGKvcQuWONuB';
const DOCUMENT = 'price_1SckVt0QhWGUtGKvl9YdmQqk';
const env = (name: string) => ({ STRIPE_SECRET_KEY: 'sk_test_x', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service' } as Record<string, string>)[name];
const confirmedUser = { id: 'user-a', email: 'a@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' };

function checkoutSetup(opts: { user?: unknown; customers?: unknown[]; subscriptions?: unknown[] } = {}) {
  const created: { params: Record<string, unknown>; options: Record<string, unknown> }[] = [];
  const stripe = {
    prices: { retrieve: async (id: string) => id === DOCUMENT
      ? { active: true, currency: 'usd', unit_amount: 500, recurring: null, product: 'prod_doc' }
      : { active: true, currency: 'usd', unit_amount: 999, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_prem' } },
    customers: { list: async () => ({ has_more: false, data: opts.customers ?? [] }) },
    subscriptions: { list: async () => ({ has_more: false, data: opts.subscriptions ?? [] }) },
    checkout: { sessions: { create: async (params: Record<string, unknown>, options: Record<string, unknown>) => {
      created.push({ params, options });
      return { url: 'https://checkout.stripe.com/c/pay/cs_test_1' };
    } } },
  };
  const handler = createCheckoutHandler({
    env,
    createClient: () => ({ auth: { getUser: async () => ({ data: { user: 'user' in opts ? opts.user : confirmedUser }, error: null }) } }),
    createStripe: () => stripe,
    now: () => 1_800_000 * 1000,
  });
  return { handler, created };
}
const post = (url: string, body: unknown, headers: Record<string, string> = {}) => new Request(url, {
  method: 'POST', body: JSON.stringify(body),
  headers: { origin: 'https://www.legallyai.ai', authorization: 'Bearer token', 'content-type': 'application/json', ...headers },
});

test('create-checkout rejects prices outside the allowlist', async () => {
  const { handler, created } = checkoutSetup();
  for (const priceId of ['price_attacker', '', 'toString', '__proto__', 42]) {
    const res = await handler(post('https://fn/create-checkout', { priceId }));
    assert.equal(res.status, 400);
  }
  assert.equal(created.length, 0);
});

test('create-checkout rejects unconfirmed or anonymous users', async () => {
  for (const user of [null, { id: 'u', email: 'a@example.com', email_confirmed_at: null }, { id: 'u', email: null, email_confirmed_at: 'x' }]) {
    const { handler, created } = checkoutSetup({ user });
    const res = await handler(post('https://fn/create-checkout', { priceId: PREMIUM }));
    assert.equal(res.status, 401);
    assert.equal(created.length, 0);
  }
  const { handler } = checkoutSetup();
  assert.equal((await handler(post('https://fn/create-checkout', { priceId: PREMIUM }, { authorization: '' }))).status, 401);
});

test('create-checkout rejects disallowed origins', async () => {
  const { handler, created } = checkoutSetup();
  const res = await handler(post('https://fn/create-checkout', { priceId: PREMIUM }, { origin: 'https://evil.example' }));
  assert.equal(res.status, 403);
  assert.equal(created.length, 0);
});

test('create-checkout trial sets 7 days, user binding and a stable idempotency key', async () => {
  const { handler, created } = checkoutSetup();
  const res = await handler(post('https://fn/create-checkout', { priceId: PREMIUM, trial: true }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { url: 'https://checkout.stripe.com/c/pay/cs_test_1', trialDays: 7 });
  const { params, options } = created[0];
  assert.equal(params.client_reference_id, 'user-a');
  assert.equal((params.metadata as Record<string, string>).user_id, 'user-a');
  assert.equal((params.subscription_data as Record<string, unknown>).trial_period_days, 7);
  assert.equal(params.success_url, 'https://www.legallyai.ai/payment-success?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(options.idempotencyKey, `checkout:user-a:${PREMIUM}:trial:1000`);
});

test('create-checkout refuses trials for one-time prices and repeat trials', async () => {
  const one = checkoutSetup();
  assert.equal((await one.handler(post('https://fn/create-checkout', { priceId: DOCUMENT, trial: true }))).status, 400);
  const repeat = checkoutSetup({ customers: [{ id: 'cus_A1', metadata: { user_id: 'user-a' } }], subscriptions: [{ status: 'canceled' }] });
  const res = await repeat.handler(post('https://fn/create-checkout', { priceId: PREMIUM, trial: true }));
  assert.equal(res.status, 409);
  assert.equal(repeat.created.length, 0);
});

test('create-checkout paid checkout uses the paid idempotency key and no trial', async () => {
  const { handler, created } = checkoutSetup();
  assert.equal((await handler(post('https://fn/create-checkout', { priceId: PREMIUM }))).status, 200);
  assert.equal(created[0].options.idempotencyKey, `checkout:user-a:${PREMIUM}:paid:1000`);
  assert.equal((created[0].params.subscription_data as Record<string, unknown>).trial_period_days, undefined);
});

function portalSetup(mapping: unknown, customer: unknown = { id: 'cus_A123', metadata: { user_id: 'user-a' } }) {
  const portalCalls: Record<string, unknown>[] = [];
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: mapping, error: null }) };
  const handler = customerPortalHandler({
    env,
    createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-a' } }, error: null }) }, from: () => query }),
    createStripe: () => ({
      customers: { retrieve: async () => customer },
      billingPortal: { sessions: { create: async (p: Record<string, unknown>) => { portalCalls.push(p); return { url: 'https://billing.stripe.com/p/session' }; } } },
    }),
  });
  return { handler, portalCalls };
}

test("customer-portal opens only the signed-in user's mapped customer with the dashboard return URL", async () => {
  const { handler, portalCalls } = portalSetup({ user_id: 'user-a', stripe_customer_id: 'cus_A123' });
  const res = await handler(post('https://fn/customer-portal', {}, { origin: 'https://legallyai.ai' }));
  assert.equal(res.status, 200);
  assert.deepEqual(portalCalls, [{ customer: 'cus_A123', return_url: 'https://legallyai.ai/dashboard' }]);
});

test("customer-portal refuses another user's customer, missing mappings and bad origins", async () => {
  const other = portalSetup({ user_id: 'user-b', stripe_customer_id: 'cus_B123' });
  assert.equal((await other.handler(post('https://fn/customer-portal', {}))).status, 409);
  const foreignMeta = portalSetup({ user_id: 'user-a', stripe_customer_id: 'cus_A123' }, { id: 'cus_A123', metadata: { user_id: 'user-b' } });
  assert.equal((await foreignMeta.handler(post('https://fn/customer-portal', {}))).status, 409);
  const none = portalSetup(null);
  assert.equal((await none.handler(post('https://fn/customer-portal', {}))).status, 409);
  const evil = portalSetup({ user_id: 'user-a', stripe_customer_id: 'cus_A123' });
  assert.equal((await evil.handler(post('https://fn/customer-portal', {}, { origin: 'https://evil.example' }))).status, 403);
  for (const s of [other, foreignMeta, none, evil]) assert.equal(s.portalCalls.length, 0);
});
