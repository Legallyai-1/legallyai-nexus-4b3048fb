import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExtraSeats, seatPlanItem, updateSeatsHandler, EXTRA_SEAT_PRICE_ID } from '../supabase/functions/_shared/update-seats-handler.ts';
import { getSubscriptionTier, subscriptionMetadata } from '../api/webhooks/stripe.ts';

const FIRM = 'price_1SckV70QhWGUtGKvvg1tH7lu';
const ENTERPRISE = 'price_1UVwxL0QhWGUtGKvpqH8gbUR';
const SOLO = 'price_1UVwxE0QhWGUtGKv3tjz0A3I';
const PREMIUM = 'price_1Sdfqp0QhWGUtGKvcQuWONuB';
const env = (name: string) => ({ STRIPE_SECRET_KEY: 'sk_test_x', SUPABASE_URL: 'https://x.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service' } as Record<string, string>)[name];
const monthly = (id: string, amount: number) => ({ id, currency: 'usd', unit_amount: amount, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_x' });

type Opts = {
  user?: { id: string } | null; orgs?: { id: string }[];
  row?: Record<string, unknown> | null; status?: string; items?: Record<string, unknown>[];
  customerMeta?: Record<string, string>; subCustomer?: string; used?: number;
};
function setup(opts: Opts = {}) {
  const updates: { id: string; params: Record<string, unknown>; options: Record<string, unknown> }[] = [];
  const retrieved: string[] = [];
  const row = 'row' in opts ? opts.row : { user_id: 'owner', stripe_customer_id: 'cus_A', stripe_subscription_id: 'sub_A', status: 'active' };
  const db = {
    auth: { getUser: async () => ({ data: { user: 'user' in opts ? opts.user : { id: 'owner' } }, error: null }) },
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const q = {
        select: () => q,
        eq: (col: string, val: unknown) => { filters[col] = val; return q; },
        limit: async () => ({ data: table === 'organizations' && filters.owner_id === 'owner' ? (opts.orgs ?? [{ id: 'org1' }]) : [], error: null }),
        maybeSingle: async () => ({ data: table === 'subscriptions' && row && filters.user_id === row.user_id ? row : null, error: null }),
      };
      return q;
    },
  };
  const stripe = {
    customers: { retrieve: async (id: string) => ({ id, metadata: opts.customerMeta ?? { user_id: 'owner' } }) },
    subscriptions: {
      retrieve: async (id: string) => {
        retrieved.push(id);
        return { id, customer: opts.subCustomer ?? 'cus_A', status: opts.status ?? 'active',
          items: { data: opts.items ?? [{ id: 'si_plan', quantity: 1, price: monthly(FIRM, 9900) }] } };
      },
      update: async (id: string, params: Record<string, unknown>, options: Record<string, unknown>) => { updates.push({ id, params, options }); return { id }; },
    },
  };
  const handler = updateSeatsHandler({ env, createClient: () => db, createStripe: () => stripe, seatsUsed: async () => opts.used ?? 2 });
  return { handler, updates, retrieved };
}
const post = (body: unknown, headers: Record<string, string> = {}) => new Request('https://fn/update-seats', {
  method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
  headers: { origin: 'https://www.legallyai.ai', authorization: 'Bearer token', 'content-type': 'application/json', ...headers },
});

test('parseExtraSeats accepts only integers 0..100', () => {
  for (const ok of [0, 1, 37, 100]) assert.equal(parseExtraSeats(ok), ok);
  for (const bad of [-1, 101, 1.5, '3', null, undefined, NaN, Infinity, true, [2], { n: 2 }]) assert.equal(parseExtraSeats(bad), null);
});

test('seatPlanItem only matches a single Firm or Enterprise plan item', () => {
  assert.equal(seatPlanItem({ items: { data: [{ price: { id: FIRM } }] } })?.plan.name, 'Firm');
  assert.equal(seatPlanItem({ items: { data: [{ price: { id: ENTERPRISE } }, { price: { id: EXTRA_SEAT_PRICE_ID } }] } })?.plan.included, 10);
  assert.equal(seatPlanItem({ items: { data: [{ price: { id: SOLO } }] } }), null);
  assert.equal(seatPlanItem({ items: { data: [{ price: { id: PREMIUM } }] } }), null);
  assert.equal(seatPlanItem({ items: { data: [{ price: { id: FIRM } }, { price: { id: ENTERPRISE } }] } }), null);
});

test('rejects missing or invalid auth, bad origins and methods', async () => {
  const { handler, updates } = setup();
  assert.equal((await handler(post({ extraSeats: 2 }, { authorization: '' }))).status, 401);
  assert.equal((await setup({ user: null }).handler(post({ extraSeats: 2 }))).status, 401);
  assert.equal((await handler(post({ extraSeats: 2 }, { origin: 'https://evil.example' }))).status, 403);
  assert.equal((await handler(new Request('https://fn/update-seats', { method: 'GET', headers: { origin: 'https://www.legallyai.ai', authorization: 'Bearer t' } }))).status, 405);
  assert.equal(updates.length, 0);
});

test('rejects invalid seat counts before touching Stripe', async () => {
  const { handler, updates, retrieved } = setup();
  for (const extraSeats of [-1, 101, 2.5, '4', null, true]) {
    assert.equal((await handler(post({ extraSeats }))).status, 400);
  }
  assert.equal((await handler(post('not json'))).status, 400);
  assert.equal((await handler(post([1]))).status, 400);
  assert.equal(updates.length + retrieved.length, 0);
});

test('only the firm owner holding the subscription can change seats', async () => {
  // A member (not an org owner) is refused even though they are signed in.
  const member = setup({ user: { id: 'member' } });
  assert.equal((await member.handler(post({ extraSeats: 3 }))).status, 403);
  // An owner without a subscription row is refused.
  const noSub = setup({ row: null });
  assert.equal((await noSub.handler(post({ extraSeats: 3 }))).status, 403);
  // Stripe customer owned by someone else.
  const foreign = setup({ customerMeta: { user_id: 'someone-else' } });
  assert.equal((await foreign.handler(post({ extraSeats: 3 }))).status, 409);
  // Subscription on another customer.
  const mismatch = setup({ subCustomer: 'cus_B' });
  assert.equal((await mismatch.handler(post({ extraSeats: 3 }))).status, 409);
  for (const s of [member, noSub, foreign, mismatch]) assert.equal(s.updates.length, 0);
});

test('only active or trialing Firm/Enterprise plans can change seats', async () => {
  for (const opts of [
    { status: 'past_due' }, { status: 'canceled' }, { status: 'incomplete' },
    { items: [{ id: 'si', quantity: 1, price: monthly(SOLO, 2900) }] },
    { items: [{ id: 'si', quantity: 1, price: monthly(PREMIUM, 999) }] },
  ]) {
    const s = setup(opts);
    assert.equal((await s.handler(post({ extraSeats: 1 }))).status, 403);
    assert.equal(s.updates.length, 0);
  }
});

test('ignores client-sent subscription and customer IDs', async () => {
  const { handler, updates, retrieved } = setup();
  const res = await handler(post({ extraSeats: 2, subscriptionId: 'sub_VICTIM', customerId: 'cus_VICTIM' }));
  assert.equal(res.status, 200);
  assert.deepEqual(retrieved, ['sub_A']);
  assert.equal(updates[0].id, 'sub_A');
});

test('adds the Extra seat item when missing, with prorations', async () => {
  const { handler, updates } = setup({ status: 'trialing' });
  const res = await handler(post({ extraSeats: 2 }));
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.seat_limit, 5);
  assert.equal(body.updated, true);
  assert.deepEqual(updates[0].params, { items: [{ price: EXTRA_SEAT_PRICE_ID, quantity: 2 }], proration_behavior: 'create_prorations' });
  assert.match(String(updates[0].options.idempotencyKey), /^update-seats:sub_A:0->2$/);
});

test('changes the quantity of the existing Extra seat item', async () => {
  const { handler, updates } = setup({ items: [{ id: 'si_plan', quantity: 1, price: monthly(ENTERPRISE, 29900) }, { id: 'si_seat', quantity: 4, price: monthly(EXTRA_SEAT_PRICE_ID, 2500) }], used: 3 });
  const res = await handler(post({ extraSeats: 0 }));
  assert.equal(res.status, 200);
  assert.deepEqual(updates[0].params, { items: [{ id: 'si_seat', quantity: 0 }], proration_behavior: 'create_prorations' });
});

test('status request and unchanged quantity do not call update', async () => {
  const { handler, updates } = setup({ items: [{ id: 'si_plan', quantity: 1, price: monthly(FIRM, 9900) }, { id: 'si_seat', quantity: 2, price: monthly(EXTRA_SEAT_PRICE_ID, 2500) }], used: 4 });
  const status = await (await handler(post({}))).json();
  assert.deepEqual({ ...status }, { plan_name: 'Firm', included_seats: 3, extra_seats: 2, seat_limit: 5, seats_used: 4, max_extra_seats: 100, price_per_seat_usd: 25, updated: false });
  assert.equal((await handler(post({ extraSeats: 2 }))).status, 200);
  assert.equal(updates.length, 0);
});

test('never lowers seats below the seats in use', async () => {
  const { handler, updates } = setup({ items: [{ id: 'si_plan', quantity: 1, price: monthly(FIRM, 9900) }, { id: 'si_seat', quantity: 3, price: monthly(EXTRA_SEAT_PRICE_ID, 2500) }], used: 5 });
  assert.equal((await handler(post({ extraSeats: 1 }))).status, 409);
  assert.equal(updates.length, 0);
});

test('webhook sync keeps the Firm tier and clears extra_seats when the seat item drops to 0', () => {
  const sub = (seatQty: number) => ({ metadata: { user_id: 'u', extra_seats: '4' }, items: { data: [
    { id: 'si_plan', quantity: 1, price: monthly(FIRM, 9900) },
    { id: 'si_seat', quantity: seatQty, price: monthly(EXTRA_SEAT_PRICE_ID, 2500) },
  ] } }) as never;
  assert.deepEqual(subscriptionMetadata(sub(0)), { user_id: 'u' });
  assert.deepEqual(subscriptionMetadata(sub(7)), { user_id: 'u', extra_seats: '7' });
  assert.equal(getSubscriptionTier(sub(0)), 'pro');
  assert.equal(getSubscriptionTier(sub(7)), 'pro');
});
