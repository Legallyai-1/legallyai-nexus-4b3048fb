import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyCheckoutSession, evaluateCheckoutSession, type CheckoutSessionLike } from '../supabase/functions/_shared/checkout-session-verification.ts';
import { getPurchaseConversion } from '../src/lib/purchaseConversion.ts';

const SID = 'cs_test_a1B2c3D4e5F6g7H8';
const paid: CheckoutSessionLike = {
  id: SID, status: 'complete', payment_status: 'paid', client_reference_id: 'user-a',
  customer: 'cus_A123', metadata: { user_id: 'user-a' }, amount_total: 999, currency: 'usd',
};
const mockStripe = (sessions: Record<string, CheckoutSessionLike>) => {
  const calls: string[] = [];
  return {
    calls,
    checkout: { sessions: { retrieve: async (id: string) => {
      calls.push(id);
      if (!sessions[id]) throw new Error('No such checkout.session');
      return sessions[id];
    } } },
  };
};

test('owned, complete, paid session is verified', async () => {
  const result = await verifyCheckoutSession(mockStripe({ [SID]: paid }), SID, 'user-a', 'cus_A123');
  assert.deepEqual(result, { verified: true, paid: true, sessionId: SID, amountTotal: 999, currency: 'USD' });
});

test('malformed session ids are rejected without calling Stripe', async () => {
  const stripe = mockStripe({});
  for (const id of ['', 'abc', 'cs_live_', 'cs_test_short', '../cs_test_a1B2c3D4e5F6', 42, null, { id: SID }]) {
    const r = await verifyCheckoutSession(stripe, id, 'user-a', null);
    assert.deepEqual(r, { verified: false, reason: 'invalid_session_id' });
  }
  assert.equal(stripe.calls.length, 0);
});

test('forged session id unknown to Stripe is rejected', async () => {
  const r = await verifyCheckoutSession(mockStripe({}), 'cs_live_ForgedForgedForged', 'user-a', null);
  assert.deepEqual(r, { verified: false, reason: 'not_found' });
});

test("another user's real session is rejected", async () => {
  const other = { ...paid, client_reference_id: 'user-b', metadata: { user_id: 'user-b' } };
  assert.deepEqual(await verifyCheckoutSession(mockStripe({ [SID]: other }), SID, 'user-a', null), { verified: false, reason: 'not_owner' });
  const noOwner = { ...paid, client_reference_id: null, metadata: null };
  assert.deepEqual(evaluateCheckoutSession(SID, 'user-a', null, noOwner), { verified: false, reason: 'not_owner' });
});

test('session for a different Stripe customer than the mapped one is rejected', () => {
  assert.deepEqual(evaluateCheckoutSession(SID, 'user-a', 'cus_OTHER1', paid), { verified: false, reason: 'customer_mismatch' });
});

test('incomplete or mismatched sessions are rejected', () => {
  assert.deepEqual(evaluateCheckoutSession(SID, 'user-a', null, { ...paid, status: 'open' }), { verified: false, reason: 'incomplete' });
  assert.deepEqual(evaluateCheckoutSession(SID, 'user-a', null, { ...paid, id: 'cs_test_zzzzzzzzzzzz' }), { verified: false, reason: 'not_found' });
});

test('trial checkout is verified but not paid', () => {
  const r = evaluateCheckoutSession(SID, 'user-a', null, { ...paid, payment_status: 'no_payment_required', amount_total: 0 });
  assert.equal(r.verified, true);
  assert.equal(r.verified && r.paid, false);
});

test('purchase conversion fires only for a verified, paid, matching session', () => {
  const ok = { verified: true, paid: true, session_id: SID, amount_total: 999, currency: 'USD' };
  assert.deepEqual(getPurchaseConversion(SID, ok), { transactionId: SID, value: 9.99, currency: 'USD' });
  assert.equal(getPurchaseConversion('cs_live_ForgedForgedForged', ok), null);
  assert.equal(getPurchaseConversion(SID, null), null);
  assert.equal(getPurchaseConversion(SID, undefined), null);
  assert.equal(getPurchaseConversion(null, ok), null);
  assert.equal(getPurchaseConversion(SID, { ...ok, verified: 'true' }), null);
  assert.equal(getPurchaseConversion(SID, { ...ok, paid: false }), null);
});

test('forged session end-to-end: rejected server-side, so no conversion', async () => {
  const forged = 'cs_live_ForgedForgedForged';
  const r = await verifyCheckoutSession(mockStripe({ [SID]: paid }), forged, 'user-a', 'cus_A123');
  assert.equal(r.verified, false);
  const checkout = r.verified ? { verified: true, paid: r.paid, session_id: r.sessionId } : null;
  assert.equal(getPurchaseConversion(forged, checkout), null);
});
