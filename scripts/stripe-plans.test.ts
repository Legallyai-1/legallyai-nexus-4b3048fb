// Solo, Enterprise and extra-seat plans: checkout line items and webhook tier mapping. Stripe is mocked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getPlanItem, getSubscriptionTier } from '../api/webhooks/stripe.ts';
import { createCheckoutHandler, EXTRA_SEAT_PRICE_ID } from '../supabase/functions/_shared/create-checkout-handler.ts';

const PREMIUM = 'price_1Sdfqp0QhWGUtGKvcQuWONuB';
const SOLO = 'price_1UVwxE0QhWGUtGKv3tjz0A3I';
const FIRM = 'price_1SckV70QhWGUtGKvvg1tH7lu';
const ENTERPRISE = 'price_1UVwxL0QhWGUtGKvpqH8gbUR';
const SEAT = 'price_1UVwxO0QhWGUtGKvUKZM9SCE';
const AMOUNTS: Record<string, number> = { [PREMIUM]: 999, [SOLO]: 2900, [FIRM]: 9900, [ENTERPRISE]: 29900, [SEAT]: 2500 };

function checkout(amounts = AMOUNTS) {
  const created: any[] = [];
  const stripe = {
    prices: { retrieve: async (id: string) => ({ active: true, currency: 'usd', unit_amount: amounts[id] ?? 1, product: 'prod_' + id,
      recurring: { interval: 'month', interval_count: 1 } }) },
    customers: { list: async () => ({ has_more: false, data: [] }) },
    subscriptions: { list: async () => ({ has_more: false, data: [] }) },
    checkout: { sessions: { create: async (params: any, options: any) => { created.push({ params, options }); return { url: 'https://checkout.stripe.com/c/pay/cs_test' }; } } },
  };
  const env = (n: string) => ({ STRIPE_SECRET_KEY: 'sk_test_dummy', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' } as Record<string, string>)[n];
  const user = { id: 'user-a', email: 'a@example.com', email_confirmed_at: '2026-01-01T00:00:00Z' };
  const handle = createCheckoutHandler({ env, createStripe: () => stripe,
    createClient: () => ({ auth: { getUser: async () => ({ data: { user }, error: null }) } }), now: () => 0 } as never);
  const post = (body: unknown) => handle(new Request('https://fn.example/create-checkout', {
    method: 'POST', body: JSON.stringify(body),
    headers: { origin: 'https://www.legallyai.ai', 'content-type': 'application/json', authorization: 'Bearer token' } }));
  return { post, created };
}

test('seat price constant matches the live Stripe extra-seat price', () => assert.equal(EXTRA_SEAT_PRICE_ID, SEAT));

test('Solo and Enterprise check out as single-quantity Firm-tier subscriptions', async () => {
  for (const priceId of [SOLO, ENTERPRISE]) {
    const c = checkout();
    assert.equal((await c.post({ priceId, mode: 'subscription', trial: true })).status, 200, priceId);
    const { params } = c.created[0];
    assert.equal(params.metadata.tier, 'pro');
    assert.deepEqual(params.line_items, [{ price: priceId, quantity: 1 }]);
    assert.equal(params.subscription_data.trial_period_days, 7);
  }
});

test('Firm and Enterprise add an extra-seat line item; Solo, Premium and bad counts are rejected', async () => {
  for (const priceId of [FIRM, ENTERPRISE]) {
    const c = checkout();
    assert.equal((await c.post({ priceId, extraSeats: 4 })).status, 200);
    assert.deepEqual(c.created[0].params.line_items, [{ price: priceId, quantity: 1 }, { price: SEAT, quantity: 4 }]);
    assert.equal(c.created[0].params.metadata.extra_seats, '4');
    assert.match(c.created[0].options.idempotencyKey, /seats4/);
  }
  const c = checkout();
  assert.equal((await c.post({ priceId: FIRM, extraSeats: 0 })).status, 200);
  assert.deepEqual(c.created[0].params.line_items, [{ price: FIRM, quantity: 1 }]);
  for (const body of [{ priceId: SOLO, extraSeats: 1 }, { priceId: PREMIUM, extraSeats: 1 }, { priceId: FIRM, extraSeats: -1 },
    { priceId: FIRM, extraSeats: 1.5 }, { priceId: FIRM, extraSeats: '2' }, { priceId: FIRM, extraSeats: 101 }]) {
    const r = checkout();
    assert.equal((await r.post(body)).status, 400, JSON.stringify(body));
    assert.equal(r.created.length, 0);
  }
});

test('checkout refuses seats when the live seat price drifted', async () => {
  const c = checkout({ ...AMOUNTS, [SEAT]: 1000 });
  assert.equal((await c.post({ priceId: FIRM, extraSeats: 2 })).status, 503);
  assert.equal(c.created.length, 0);
});

const item = (id: string, quantity = 1, amount = AMOUNTS[id]) => ({ quantity, price: { id, currency: 'usd', unit_amount: amount,
  recurring: { interval: 'month', interval_count: 1 }, product: 'prod_x' } });
const sub = (...items: unknown[]) => ({ items: { data: items } }) as any;

test('webhook maps Solo, Firm and Enterprise to the pro tier, with or without extra seats', () => {
  assert.equal(getSubscriptionTier(sub(item(SOLO))), 'pro');
  assert.equal(getSubscriptionTier(sub(item(FIRM))), 'pro');
  assert.equal(getSubscriptionTier(sub(item(ENTERPRISE))), 'pro');
  assert.equal(getSubscriptionTier(sub(item(FIRM), item(SEAT, 5))), 'pro');
  assert.equal(getSubscriptionTier(sub(item(SEAT, 5), item(ENTERPRISE))), 'pro');
  assert.equal(getPlanItem(sub(item(SEAT, 5), item(ENTERPRISE)))?.price.id, ENTERPRISE);
  assert.equal(getSubscriptionTier(sub(item(PREMIUM))), 'premium');
});

test('webhook refuses unexpected plan shapes', () => {
  assert.equal(getSubscriptionTier(sub(item(SOLO), item(SEAT, 1))), 'free');
  assert.equal(getSubscriptionTier(sub(item(PREMIUM), item(SEAT, 1))), 'free');
  assert.equal(getSubscriptionTier(sub(item(FIRM, 2))), 'free');
  assert.equal(getSubscriptionTier(sub(item(FIRM), item(ENTERPRISE))), 'free');
  assert.equal(getSubscriptionTier(sub(item(FIRM), item(SEAT, 1), item(SEAT, 1))), 'free');
  assert.equal(getSubscriptionTier(sub(item(FIRM), item(SEAT, 1, 100))), 'free');
  assert.equal(getSubscriptionTier(sub(item(SEAT, 3))), 'free');
  assert.equal(getSubscriptionTier(sub(item(ENTERPRISE, 1, 100))), 'free');
});
