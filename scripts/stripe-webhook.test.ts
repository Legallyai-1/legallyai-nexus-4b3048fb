import test from 'node:test';
import assert from 'node:assert/strict';
import { failureReason, getSubscriptionTier, linkStripeCustomerForUser, ownerByVerifiedEmail, processVerifiedEvent, SUPPORTED_EVENTS } from '../api/webhooks/stripe.ts';

function harness() {
  const state = { processed: false, pending: false, fail: false, status: 'active', syncs: [] as any[], logs: [] as any[], records: new Map<string, any>() };
  const subscription = () => ({ id: 'sub_A', customer: 'cus_A', status: state.status, metadata: { user_id: 'user-a' }, cancel_at_period_end: false,
    items: { data: [{ current_period_start: 1700000000, current_period_end: 1702592000, price: { id: 'price_1Sdfqp0QhWGUtGKvcQuWONuB', currency: 'usd', unit_amount: 999, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_A' } }] } });
  const db = {
    rpc(name: string, args: any) { return { async throwOnError() {
      if (name === 'claim_webhook_log') return { data: [{ id: 'log-a', claimed: !state.processed && !state.pending, processing_status: state.processed ? 'processed' : 'pending' }] };
      assert.equal(name, 'sync_stripe_subscription_state');
      if (state.fail) throw new Error('Simulated database failure');
      state.syncs.push(args); return { data: true };
    } }; },
    from(table: string) {
      let payload: any; let options: any;
      const query = { select() { return query; }, eq() { return query; }, maybeSingle() { return query; },
        update(value: any) { payload = value; return query; }, upsert(value: any, config: any) { payload = value; options = config; return query; },
        async throwOnError() {
          if (table === 'subscriptions') return { data: { user_id: 'user-a' } };
          if (table === 'profiles') return { data: { id: 'user-a' } };
          if (table === 'webhook_logs') { state.logs.push(payload); state.processed = payload.processing_status === 'processed'; }
          if (table === 'payment_records') { assert.equal(options.ignoreDuplicates, true); assert.equal(options.onConflict, 'stripe_checkout_session_id'); if (!state.records.has(payload.stripe_checkout_session_id)) state.records.set(payload.stripe_checkout_session_id, payload); }
          return { data: null };
        } };
      return query;
    },
  };
  const stripe = { subscriptions: { retrieve: async () => subscription() }, customers: { retrieve: async () => ({ id: 'cus_A', metadata: { user_id: 'user-a' } }) },
    checkout: { sessions: {
      retrieve: async () => ({ id: 'cs_A', mode: 'payment', payment_status: 'paid', customer: 'cus_A', metadata: { user_id: 'user-a' }, client_reference_id: 'user-a', amount_total: 500, payment_intent: 'pi_A' }),
      listLineItems: async () => ({ has_more: false, data: [{ quantity: 1, price: { id: 'price_1SckVt0QhWGUtGKvl9YdmQqk', currency: 'usd', unit_amount: 500, recurring: null, product: 'prod_D' } }] }),
    } } };
  const event = (type = 'customer.subscription.updated', id = 'evt_A') => ({ id, type, created: 1700000000, data: { object: { id: 'sub_A', customer: 'cus_A', parent: { type: 'subscription_details', subscription_details: { subscription: 'sub_A' } } } } });
  const run = (value = event()) => processVerifiedEvent(value as never, stripe as never, db as never);
  return { state, subscription, event, run };
}

test('unknown prices and metadata overrides cannot grant a subscription tier', () => {
  const h = harness(); const sub = h.subscription();
  assert.equal(getSubscriptionTier(sub as never), 'premium');
  sub.items.data[0].price.id = 'price_unknown';
  assert.equal(getSubscriptionTier({ ...sub, metadata: { tier: 'premium' } } as never), 'free');
});

test('processed duplicates do not repeat subscription writes', async () => {
  const h = harness(); assert.equal((await h.run()).status, 200); assert.equal((await h.run()).status, 200); assert.equal(h.state.syncs.length, 1);
});

test('pending claims require a retry without fulfillment', async () => {
  const h = harness(); h.state.pending = true; assert.equal((await h.run()).status, 503); assert.equal(h.state.syncs.length, 0);
});

test('failed renewals reconcile current Stripe subscription state', async () => {
  const h = harness(); h.state.status = 'past_due'; assert.ok(SUPPORTED_EVENTS.has('invoice.payment_failed'));
  assert.equal((await h.run(h.event('invoice.payment_failed'))).status, 200); assert.equal(h.state.syncs[0].p_status, 'past_due');
});

test('processing errors remain retryable', async () => {
  const h = harness(); h.state.fail = true; assert.equal((await h.run()).status, 503); assert.equal(h.state.logs.at(-1).processing_status, 'error');
  h.state.fail = false; assert.equal((await h.run()).status, 200);
});

test('distinct checkout events cannot reset a consumed document allowance', async () => {
  const h = harness(); assert.equal((await h.run(h.event('checkout.session.completed'))).status, 200);
  h.state.records.get('cs_A').metadata.documents_remaining = 0;
  h.state.processed = false;
  assert.equal((await h.run(h.event('checkout.session.async_payment_succeeded', 'evt_B'))).status, 200);
  assert.equal(h.state.records.size, 1); assert.equal(h.state.records.get('cs_A').metadata.documents_remaining, 0);
});

test('failed deliveries record a short, secret-free reason', async () => {
  const h = harness(); h.state.fail = true; assert.equal((await h.run()).status, 503);
  assert.match(h.state.logs.at(-1).processing_error, /retry required: Error: Simulated database failure$/);
  assert.equal(failureReason(new Error('bad key sk_live_abc123 and eyJhbGciOi.x.y')), 'Error: bad key [redacted] and [redacted]');
  assert.equal(failureReason('x'), 'UnknownError');
  assert.ok(failureReason(new Error('a'.repeat(500))).length <= 200);
});

function linkHarness(opts: { confirmed?: boolean; authEmail?: string; profiles?: number; customerOwner?: string; mappedTo?: string; existingStatus?: string } = {}) {
  const state = { updates: [] as any[], syncs: [] as any[] };
  const sub = { id: 'sub_V', customer: 'cus_V', status: 'active', metadata: {}, cancel_at_period_end: false,
    items: { data: [{ current_period_start: 1790833015, current_period_end: 1793511415, quantity: 1, price: { id: 'price_1Sdfqp0QhWGUtGKvcQuWONuB', currency: 'usd', unit_amount: 999, recurring: { interval: 'month', interval_count: 1 }, product: 'prod_P' } }] } };
  const customer = { id: 'cus_V', email: 'Vicki@Example.com', metadata: opts.customerOwner ? { user_id: opts.customerOwner } : {} };
  const db = {
    auth: { admin: { getUserById: async (id: string) => ({ data: { user: { id, email: opts.authEmail ?? 'vicki@example.com', email_confirmed_at: opts.confirmed === false ? null : '2026-10-29T00:00:00Z' } }, error: null }) } },
    rpc(name: string, args: any) { return { async throwOnError() { assert.equal(name, 'sync_stripe_subscription_state'); state.syncs.push(args); return { data: true }; } }; },
    from(table: string) {
      let field = '';
      const query: any = { update() { return query; }, select() { return query; }, eq(f: string) { field = f; return query; }, maybeSingle() { return query; }, ilike() { return query; }, limit() { return query; },
        async throwOnError() {
          if (table === 'profiles' && field === 'id') return { data: { id: 'user-v' } };
          if (table === 'profiles') return { data: Array.from({ length: opts.profiles ?? 1 }, (_, i) => ({ id: i ? `user-${i}` : 'user-v' })) };
          if (table === 'subscriptions' && field === 'user_id') return { data: opts.existingStatus ? { status: opts.existingStatus } : null };
          if (table === 'subscriptions') return { data: opts.mappedTo ? { user_id: opts.mappedTo } : null };
          return { data: null };
        } };
      return query;
    },
  };
  const stripe = {
    customers: { retrieve: async () => customer, list: async () => ({ data: [customer] }), update: async (id: string, body: any) => { state.updates.push({ id, body }); customer.metadata = body.metadata; return customer; } },
    subscriptions: { retrieve: async () => sub, list: async () => ({ data: [sub] }) },
  };
  return { state, db, stripe };
}

test('webhook falls back to a verified email match when a migrated customer has no user_id', async () => {
  const h = linkHarness();
  const event = { id: 'evt_V', type: 'invoice.paid', created: 1790833015, data: { object: { id: 'in_V', customer: 'cus_V', parent: { type: 'subscription_details', subscription_details: { subscription: 'sub_V' } } } } };
  const db: any = { ...h.db, rpc(name: string, args: any) { return { async throwOnError() { if (name === 'claim_webhook_log') return { data: [{ id: 'log', claimed: true }] }; h.state.syncs.push(args); return { data: true }; } }; } };
  assert.equal((await processVerifiedEvent(event as never, h.stripe as never, db)).status, 200);
  assert.deepEqual(h.state.updates, [{ id: 'cus_V', body: { metadata: { user_id: 'user-v' } } }]);
  assert.equal(h.state.syncs[0].p_user_id, 'user-v'); assert.equal(h.state.syncs[0].p_tier, 'premium');
});

test('email fallback never matches an unverified, mismatched or ambiguous account', async () => {
  for (const opts of [{ confirmed: false }, { authEmail: 'other@example.com' }, { profiles: 2 }]) {
    const h = linkHarness(opts); assert.equal(await ownerByVerifiedEmail(h.db as never, 'vicki@example.com'), null);
  }
  assert.equal(await ownerByVerifiedEmail(linkHarness().db as never, ' Vicki@example.com '), 'user-v');
});

test('signed-in link claims a paid subscription billed to the verified email only', async () => {
  const user = { id: 'user-v', email: 'vicki@example.com', email_confirmed_at: '2026-10-29T00:00:00Z' };
  const h = linkHarness();
  assert.deepEqual(await linkStripeCustomerForUser(h.stripe as never, h.db as never, user), { linked: true, tier: 'premium' });
  assert.equal(h.state.syncs[0].p_user_id, 'user-v'); assert.equal(h.state.syncs[0].p_status, 'active');
  assert.equal((await linkStripeCustomerForUser(linkHarness().stripe as never, linkHarness().db as never, { ...user, email_confirmed_at: null })).linked, false);
  for (const opts of [{ customerOwner: 'someone-else' }, { mappedTo: 'someone-else' }, { existingStatus: 'active' }]) {
    const x = linkHarness(opts); assert.equal((await linkStripeCustomerForUser(x.stripe as never, x.db as never, user)).linked, false);
    assert.equal(x.state.syncs.length, 0); assert.equal(x.state.updates.length, 0);
  }
});
