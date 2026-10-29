// LEG-21: security-focused tests for the Stripe webhook, checkout and plan mapping.
// No network and no real secrets: Stripe/Supabase are mocked; the webhook signature uses a dummy secret.
import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import handler, { processVerifiedEvent } from '../api/webhooks/stripe.ts';
import { createCheckoutHandler } from '../supabase/functions/_shared/create-checkout-handler.ts';

const PREMIUM = 'price_1Sdfqp0QhWGUtGKvcQuWONuB';
const PRO = 'price_1SckV70QhWGUtGKvvg1tH7lu';
const DOCUMENT = 'price_1SckVt0QhWGUtGKvl9YdmQqk';
const DUMMY_SECRET = 'whsec_dummy_test_only';

// ---------- webhook HTTP handler: signature boundary ----------
function withWebhookEnv<T>(fn: () => Promise<T>, env: Record<string, string | undefined> = {}) {
  const keys = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  Object.assign(process.env, { STRIPE_SECRET_KEY: 'sk_test_dummy', STRIPE_WEBHOOK_SECRET: DUMMY_SECRET,
    SUPABASE_URL: 'https://whdljtbtqisoszbrzdwq.supabase.co', SUPABASE_SECRET_KEY: 'dummy-server-key' });
  for (const [k, v] of Object.entries(env)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  return fn().finally(() => { for (const k of keys) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } });
}
function fakeReq(body: string, headers: Record<string, string> = {}, method = 'POST') {
  return { method, headers, async *[Symbol.asyncIterator]() { if (body) yield Buffer.from(body); },
    get body() { throw new Error('req.body must not be read'); } };
}
function fakeRes() {
  const res = { statusCode: 0, payload: undefined as unknown, headers: {} as Record<string, string>,
    setHeader(k: string, v: string) { res.headers[k] = v; }, status(c: number) { res.statusCode = c; return res; },
    json(p: unknown) { res.payload = p; return res; } };
  return res;
}
const callHandler = async (req: ReturnType<typeof fakeReq>) => { const res = fakeRes(); await handler(req as never, res as never); return res; };
const signed = (payload: string, secret = DUMMY_SECRET) =>
  Stripe.webhooks.generateTestHeaderString({ payload, secret });

test('webhook rejects non-POST and missing signature', () => withWebhookEnv(async () => {
  assert.equal((await callHandler(fakeReq('{}', {}, 'GET'))).statusCode, 405);
  const res = await callHandler(fakeReq('{}'));
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers['Cache-Control'], 'no-store');
}));

test('webhook rejects an invalid or tampered signature', () => withWebhookEnv(async () => {
  const payload = JSON.stringify({ id: 'evt_x', type: 'checkout.session.completed', data: { object: { id: 'cs_x' } } });
  const wrongSecret = await callHandler(fakeReq(payload, { 'stripe-signature': signed(payload, 'whsec_attacker') }));
  assert.equal(wrongSecret.statusCode, 400);
  assert.deepEqual(wrongSecret.payload, { error: 'Webhook verification failed' });
  const tampered = await callHandler(fakeReq(payload.replace('cs_x', 'cs_y'), { 'stripe-signature': signed(payload) }));
  assert.equal(tampered.statusCode, 400);
  assert.equal((await callHandler(fakeReq(payload, { 'stripe-signature': 'garbage' }))).statusCode, 400);
}));

test('webhook with valid signature for an unsupported event is acknowledged without processing', () => withWebhookEnv(async () => {
  const payload = JSON.stringify({ id: 'evt_ok', object: 'event', type: 'customer.created', created: 1700000000, data: { object: { id: 'cus_x' } } });
  const res = await callHandler(fakeReq(payload, { 'stripe-signature': signed(payload) }));
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, { received: true, ignored: true });
}));

test('webhook fails closed (503) when configuration is missing', () => withWebhookEnv(async () => {
  assert.equal((await callHandler(fakeReq('{}', { 'stripe-signature': 't=1,v1=x' }))).statusCode, 503);
}, { STRIPE_WEBHOOK_SECRET: undefined }));

test('webhook refuses an unexpected Supabase backend', () => withWebhookEnv(async () => {
  assert.equal((await callHandler(fakeReq('{}', { 'stripe-signature': 't=1,v1=x' }))).statusCode, 503);
}, { SUPABASE_URL: 'https://evil.supabase.co' }));

// ---------- verified event handling paths ----------
function eventHarness(opts: { price?: string; amount?: number; status?: string; session?: Record<string, unknown> } = {}) {
  const syncs: any[] = []; const records: any[] = []; const logs: any[] = [];
  const subscription = () => ({ id: 'sub_A', customer: 'cus_A', status: opts.status ?? 'active', metadata: { user_id: 'user-a' }, cancel_at_period_end: false,
    items: { data: [{ current_period_start: 1700000000, current_period_end: 1702592000,
      price: { id: opts.price ?? PREMIUM, currency: 'usd', unit_amount: opts.amount ?? 999, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_A' } }] } });
  const db = {
    rpc(name: string, args: any) { return { async throwOnError() {
      if (name === 'claim_webhook_log') return { data: [{ id: 'log-a', claimed: true, processing_status: 'pending' }] };
      syncs.push(args); return { data: true };
    } }; },
    from(table: string) {
      let payload: any;
      const q = { select: () => q, eq: () => q, maybeSingle: () => q,
        update(v: any) { payload = v; return q; }, upsert(v: any) { payload = v; return q; },
        async throwOnError() {
          if (table === 'subscriptions') return { data: { user_id: 'user-a' } };
          if (table === 'profiles') return { data: { id: 'user-a' } };
          if (table === 'webhook_logs') logs.push(payload);
          if (table === 'payment_records') records.push(payload);
          return { data: null };
        } };
      return q;
    },
  };
  const stripe = { subscriptions: { retrieve: async () => subscription() },
    customers: { retrieve: async () => ({ id: 'cus_A', metadata: { user_id: 'user-a' } }) },
    checkout: { sessions: {
      retrieve: async () => ({ id: 'cs_A', mode: 'subscription', payment_status: 'paid', customer: 'cus_A', subscription: 'sub_A',
        metadata: { user_id: 'user-a' }, client_reference_id: 'user-a', ...opts.session }),
      listLineItems: async () => ({ has_more: false, data: [{ quantity: 1, price: { id: DOCUMENT, currency: 'usd', unit_amount: 500, recurring: null, product: 'prod_D' } }] }),
    } } };
  const run = (type: string, object: Record<string, unknown>) =>
    processVerifiedEvent({ id: 'evt_1', type, created: 1700000000, data: { object } } as never, stripe as never, db as never);
  return { run, syncs, records, logs };
}

test('checkout.session.completed (subscription) syncs the mapped tier for the session owner', async () => {
  const h = eventHarness({ price: PRO, amount: 9900 });
  const r = await h.run('checkout.session.completed', { id: 'cs_A', customer: 'cus_A' });
  assert.equal(r.status, 200);
  assert.equal(h.syncs.length, 1);
  assert.equal(h.syncs[0].p_user_id, 'user-a');
  assert.equal(h.syncs[0].p_tier, 'pro');
  assert.equal(h.logs.at(-1).processing_status, 'processed');
});

test('checkout.session.completed with conflicting owner ids is rejected and retryable', async () => {
  const h = eventHarness({ session: { client_reference_id: 'user-b' } });
  const r = await h.run('checkout.session.completed', { id: 'cs_A', customer: 'cus_A' });
  assert.equal(r.status, 503);
  assert.equal(h.syncs.length, 0);
  assert.equal(h.logs.at(-1).processing_status, 'error');
});

test('checkout.session.completed (document payment) records one document credit', async () => {
  const h = eventHarness({ session: { mode: 'payment', subscription: null, amount_total: 500, payment_intent: 'pi_A' } });
  const r = await h.run('checkout.session.completed', { id: 'cs_A', customer: 'cus_A' });
  assert.equal(r.status, 200);
  assert.equal(h.records.length, 1);
  assert.equal(h.records[0].tier, 'document');
  assert.equal(h.records[0].metadata.documents_remaining, 1);
});

test('unpaid checkout session grants nothing', async () => {
  const h = eventHarness({ session: { payment_status: 'unpaid' } });
  assert.equal((await h.run('checkout.session.completed', { id: 'cs_A' })).status, 200);
  assert.equal(h.syncs.length + h.records.length, 0);
});

test('customer.subscription.updated maps premium; unknown or mispriced plans fall back to free', async () => {
  const premium = eventHarness();
  await premium.run('customer.subscription.updated', { id: 'sub_A', customer: 'cus_A' });
  assert.equal(premium.syncs[0].p_tier, 'premium');
  const unknown = eventHarness({ price: 'price_attacker', amount: 999 });
  await unknown.run('customer.subscription.updated', { id: 'sub_A', customer: 'cus_A' });
  assert.equal(unknown.syncs[0].p_tier, 'free');
  const mispriced = eventHarness({ price: PRO, amount: 1 });
  await mispriced.run('customer.subscription.updated', { id: 'sub_A', customer: 'cus_A' });
  assert.equal(mispriced.syncs[0].p_tier, 'free');
});

test('customer.subscription.deleted syncs canceled status from Stripe', async () => {
  const h = eventHarness({ status: 'canceled' });
  const r = await h.run('customer.subscription.deleted', { id: 'sub_A', customer: 'cus_A' });
  assert.equal(r.status, 200);
  assert.equal(h.syncs[0].p_status, 'canceled');
  assert.equal(h.syncs[0].p_stripe_subscription_id, 'sub_A');
});

// ---------- checkout handler: auth, allowlist, plan mapping ----------
function checkout(user: unknown = { id: 'user-a', email: 'a@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' }) {
  const created: any[] = [];
  const amounts: Record<string, number> = { [PREMIUM]: 999, [PRO]: 9900, [DOCUMENT]: 500 };
  const stripe = {
    prices: { retrieve: async (id: string) => ({ active: true, currency: 'usd', unit_amount: amounts[id] ?? 1, product: 'prod_' + id,
      recurring: id === DOCUMENT ? null : { interval: 'month', interval_count: 1 } }) },
    customers: { list: async () => ({ has_more: false, data: [] }) },
    subscriptions: { list: async () => ({ has_more: false, data: [] }) },
    checkout: { sessions: { create: async (params: any, options: any) => { created.push({ params, options }); return { url: 'https://checkout.stripe.com/c/pay/cs_test' }; } } },
  };
  const env = (n: string) => ({ STRIPE_SECRET_KEY: 'sk_test_dummy', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' } as Record<string, string>)[n];
  const handle = createCheckoutHandler({ env, createStripe: () => stripe,
    createClient: () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) } }), now: () => 0 } as never);
  const post = (body: unknown, auth: string | null = 'Bearer token') => handle(new Request('https://fn.example/create-checkout', {
    method: 'POST', body: JSON.stringify(body),
    headers: { origin: 'https://www.legallyai.ai', 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) } }));
  return { post, created };
}

test('checkout requires a bearer token and a confirmed user', async () => {
  assert.equal((await checkout().post({ priceId: PREMIUM }, null)).status, 401);
  assert.equal((await checkout(null).post({ priceId: PREMIUM })).status, 401);
  assert.equal((await checkout({ id: 'u', email: 'u@example.com', email_confirmed_at: null }).post({ priceId: PREMIUM })).status, 401);
});

test('checkout rejects price ids outside the allowlist and mode mismatches without creating a session', async () => {
  const c = checkout();
  for (const priceId of ['price_attacker', '', 'constructor', '__proto__', 123]) assert.equal((await c.post({ priceId })).status, 400, String(priceId));
  assert.equal((await c.post({ priceId: DOCUMENT, mode: 'subscription' })).status, 400);
  assert.equal((await c.post({ priceId: PRO, mode: 'payment' })).status, 400);
  assert.equal(c.created.length, 0);
});

test('checkout maps each allowlisted price to its plan, mode and user binding', async () => {
  for (const [priceId, tier, mode] of [[PREMIUM, 'premium', 'subscription'], [PRO, 'pro', 'subscription'], [DOCUMENT, 'document', 'payment']]) {
    const c = checkout();
    const res = await c.post({ priceId });
    assert.equal(res.status, 200, priceId);
    const { params } = c.created[0];
    assert.equal(params.mode, mode);
    assert.equal(params.metadata.tier, tier);
    assert.equal(params.metadata.user_id, 'user-a');
    assert.equal(params.client_reference_id, 'user-a');
    assert.deepEqual(params.line_items, [{ price: priceId, quantity: 1 }]);
  }
});
