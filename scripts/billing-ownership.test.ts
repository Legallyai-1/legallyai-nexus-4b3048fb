import test from 'node:test';
import assert from 'node:assert/strict';
import { getBillingReturnOrigin, getMappedBillingCustomerId, isBillingCustomerConsistent } from '../supabase/functions/_shared/billing-ownership.ts';

test('billing return allows only production origins', () => {
  assert.equal(getBillingReturnOrigin('https://legallyai.ai'), 'https://legallyai.ai');
  assert.equal(getBillingReturnOrigin('https://www.legallyai.ai'), 'https://www.legallyai.ai');
  assert.equal(getBillingReturnOrigin(null), 'https://www.legallyai.ai');
  for (const origin of ['https://example.com', 'null', 'https://www.legallyai.ai.example.com', 'http://www.legallyai.ai', 'https://www.legallyai.ai/path']) {
    assert.equal(getBillingReturnOrigin(origin), null);
  }
});

test('billing customer is selected from the authenticated user mapping', () => {
  assert.equal(getMappedBillingCustomerId('user-a', { user_id: 'user-a', stripe_customer_id: 'cus_A123' }), 'cus_A123');
});

test('another user mapping is rejected', () => {
  assert.equal(getMappedBillingCustomerId('user-a', { user_id: 'user-b', stripe_customer_id: 'cus_B123' }), null);
});

test('missing and malformed mappings are rejected', () => {
  assert.equal(getMappedBillingCustomerId('user-a', null), null);
  for (const id of [null, '', 'not-a-customer', 'cus_']) {
    assert.equal(getMappedBillingCustomerId('user-a', { user_id: 'user-a', stripe_customer_id: id }), null);
  }
});

test('matching customer metadata is accepted', () => {
  assert.equal(isBillingCustomerConsistent('user-a', 'cus_A123', { id: 'cus_A123', metadata: { user_id: 'user-a' } }), true);
});

test('stored mapping remains usable when legacy customer metadata is absent', () => {
  assert.equal(isBillingCustomerConsistent('user-a', 'cus_A123', { id: 'cus_A123', metadata: {} }), true);
});

test('deleted, mismatched and conflicting customers are rejected', () => {
  assert.equal(isBillingCustomerConsistent('user-a', 'cus_A123', { id: 'cus_A123', deleted: true }), false);
  assert.equal(isBillingCustomerConsistent('user-a', 'cus_A123', { id: 'cus_B123' }), false);
  assert.equal(isBillingCustomerConsistent('user-a', 'cus_A123', { id: 'cus_A123', metadata: { user_id: 'user-b' } }), false);
});
