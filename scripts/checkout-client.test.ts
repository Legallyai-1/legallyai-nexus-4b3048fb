import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHECKOUT_FALLBACK_MESSAGE, openCheckoutInNewTab, parseStripeCheckoutUrl, readCheckoutError } from '../src/lib/checkout.ts';
import { createCheckoutHandler } from '../supabase/functions/_shared/create-checkout-handler.ts';

const STRIPE_URL = 'https://checkout.stripe.com/c/pay/cs_test_1';

test('only https checkout.stripe.com URLs are accepted as checkout redirects', () => {
  assert.equal(parseStripeCheckoutUrl(STRIPE_URL)?.href, STRIPE_URL);
  for (const bad of ['http://checkout.stripe.com/x', 'https://checkout.stripe.com.evil.io/x', 'https://evil.io/?u=checkout.stripe.com',
    'https://user:pw@checkout.stripe.com/x', 'javascript:alert(1)', '', null, 42]) {
    assert.equal(parseStripeCheckoutUrl(bad), null, String(bad));
  }
});

test('server error messages and the trialUnavailable flag reach the UI', async () => {
  const res = new Response(JSON.stringify({ error: 'A free trial is available only before your first subscription.', trialUnavailable: true }), { status: 409 });
  assert.deepEqual(await readCheckoutError({ context: res }), { message: 'A free trial is available only before your first subscription.', trialUnavailable: true, status: 409 });
  assert.deepEqual(await readCheckoutError(null, { error: 'Payments are not configured' }), { message: 'Payments are not configured', trialUnavailable: false, status: null });
  assert.equal((await readCheckoutError(new Error('network'))).message, CHECKOUT_FALLBACK_MESSAGE);
  assert.equal((await readCheckoutError({ context: new Response('not json', { status: 500 }) })).message, CHECKOUT_FALLBACK_MESSAGE);
});

function fakeWindow(blocked = false) {
  const tab = { closed: false, opener: {} as unknown, location: { href: '' }, close() { this.closed = true; } };
  const assigned: string[] = [];
  let opened = 0;
  const win = { open: () => { opened++; return blocked ? null : tab; }, location: { assign: (u: string) => assigned.push(u) } };
  return { win: win as unknown as Window, tab, assigned, opened: () => opened };
}

test('document checkout opens its tab before awaiting the server (popup-blocker safe)', async () => {
  const f = fakeWindow();
  let openedBeforeFetch = false;
  await openCheckoutInNewTab(async () => { openedBeforeFetch = f.opened() === 1; return STRIPE_URL; }, f.win);
  assert.equal(openedBeforeFetch, true);
  assert.equal(f.tab.location.href, STRIPE_URL);
  assert.equal(f.tab.opener, null);
  assert.deepEqual(f.assigned, []);
});

test('a blocked popup falls back to same-tab checkout', async () => {
  const f = fakeWindow(true);
  await openCheckoutInNewTab(async () => STRIPE_URL, f.win);
  assert.deepEqual(f.assigned, [STRIPE_URL]);
});

test('failures and unverified redirects close the pre-opened tab and surface an error', async () => {
  for (const getUrl of [async () => { throw new Error('Server said no'); }, async () => 'https://evil.io/pay']) {
    const f = fakeWindow();
    await assert.rejects(openCheckoutInNewTab(getUrl, f.win));
    assert.equal(f.tab.closed, true);
    assert.equal(f.tab.location.href, '');
    assert.deepEqual(f.assigned, []);
  }
});

test('returning subscriber: trial request gets trialUnavailable, retry without trial reaches Stripe Checkout', async () => {
  const created: Record<string, unknown>[] = [];
  const handler = createCheckoutHandler({
    env: (n: string) => ({ STRIPE_SECRET_KEY: 'stripe-key-fixture', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service' } as Record<string, string>)[n],
    createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-a', email: 'a@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' } }, error: null }) } }),
    createStripe: () => ({
      prices: { retrieve: async () => ({ active: true, currency: 'usd', unit_amount: 999, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_prem' }) },
      customers: { list: async () => ({ has_more: false, data: [{ id: 'cus_1', metadata: { user_id: 'user-a' } }] }) },
      subscriptions: { list: async () => ({ has_more: false, data: [{ id: 'sub_old', status: 'canceled' }] }) },
      checkout: { sessions: { create: async (params: Record<string, unknown>) => { created.push(params); return { url: STRIPE_URL }; } } },
    }),
    now: () => 1_800_000_000,
  } as never);
  const post = (trial: boolean) => new Request('https://fn/create-checkout', { method: 'POST',
    headers: { origin: 'https://www.legallyai.ai', authorization: 'Bearer t', 'content-type': 'application/json' },
    body: JSON.stringify({ priceId: 'price_1Sdfqp0QhWGUtGKvcQuWONuB', mode: 'subscription', trial }) });
  const refused = await handler(post(true));
  assert.equal(refused.status, 409);
  assert.equal((await readCheckoutError({ context: refused })).trialUnavailable, true);
  assert.equal(created.length, 0);
  const ok = await handler(post(false));
  assert.equal(ok.status, 200);
  assert.equal(parseStripeCheckoutUrl((await ok.json()).url)?.href, STRIPE_URL);
  assert.equal(created.length, 1);
  assert.equal((created[0].subscription_data as Record<string, unknown> | undefined)?.trial_period_days, undefined);
});

test('every price the UI sells is allowlisted server-side and fulfilled by the webhook', () => {
  const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
  const ids = (src: string) => new Set(src.match(/price_[A-Za-z0-9]{14,}/g) ?? []);
  const sold = new Set([...ids(read('src/pages/PricingPage.tsx')), ...ids(read('src/lib/document-export-entitlement.ts'))]);
  const allowed = ids(read('supabase/functions/_shared/create-checkout-handler.ts'));
  const webhook = ids(read('api/webhooks/stripe.ts'));
  assert.equal(sold.size, 3);
  for (const id of sold) {
    assert.ok(allowed.has(id), `${id} missing from create-checkout allowlist`);
    assert.ok(webhook.has(id), `${id} not fulfilled by the webhook`);
  }
});
