import test from 'node:test';
import assert from 'node:assert/strict';
import { failureReason, getSubscriptionTier, processVerifiedEvent, SUPPORTED_EVENTS } from '../api/webhooks/stripe.ts';

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
