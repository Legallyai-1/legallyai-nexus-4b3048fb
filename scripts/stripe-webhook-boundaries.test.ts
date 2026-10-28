import test from 'node:test';
import assert from 'node:assert/strict';
import { processVerifiedEvent } from '../api/webhooks/stripe.ts';

async function scenario(type: string, object: Record<string, unknown>, deleted = false) {
  const state = { retrieves: 0, writes: 0, statuses: [] as string[] };
  const db = {
    rpc(name: string) {
      if (name !== 'claim_webhook_log') state.writes++;
      return { throwOnError: async () => ({ data: [{ id: 'log-a', claimed: true, processing_status: 'pending' }] }) };
    },
    from(table: string) {
      let status = '';
      const query = {
        select() { return query; }, eq() { return query; }, maybeSingle() { return query; },
        update(value: { processing_status: string }) { status = value.processing_status; return query; },
        async throwOnError() { if (table === 'webhook_logs') state.statuses.push(status); return { data: null }; },
      };
      return query;
    },
  };
  const stripe = {
    subscriptions: { retrieve: async () => { state.retrieves++; return { customer: 'cus_A', metadata: { user_id: 'user-a' } }; } },
    checkout: { sessions: { retrieve: async () => { state.retrieves++; throw new Error('Unexpected retrieval'); } } },
    customers: { retrieve: async () => deleted ? { id: 'cus_A', deleted: true } : { id: 'cus_A', metadata: {} } },
  };
  const event = { id: 'evt_boundary', type, created: 1700000000, data: { object } };
  const result = await processVerifiedEvent(event as never, stripe as never, db as never);
  return { result, state };
}

test('missing checkout ID is rejected before Stripe retrieval', async () => {
  const { result, state } = await scenario('checkout.session.completed', { object: 'checkout.session' });
  assert.equal(result.status, 503); assert.equal(state.retrieves, 0); assert.equal(state.writes, 0);
});

test('missing subscription ID is rejected before Stripe retrieval', async () => {
  const { result, state } = await scenario('customer.subscription.updated', { object: 'subscription' });
  assert.equal(result.status, 503); assert.equal(state.retrieves, 0); assert.equal(state.writes, 0);
});

test('deleted customer cannot receive a subscription access write', async () => {
  const { result, state } = await scenario('customer.subscription.updated', { id: 'sub_A' }, true);
  assert.equal(result.status, 503); assert.equal(state.retrieves, 1); assert.equal(state.writes, 0);
  assert.equal(state.statuses.at(-1), 'error');
});
