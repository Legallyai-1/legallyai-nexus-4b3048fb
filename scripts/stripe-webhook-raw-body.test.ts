import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import Stripe from 'stripe';
import { readRawBody, config } from '../api/webhooks/stripe.ts';

const secret = 'whsec_test_dummy_secret_for_unit_tests';
const stripe = new Stripe('sk_test_dummy', { apiVersion: '2025-08-27.basil' });
// Formatting Stripe actually sends (pretty-printed, unicode) differs from JSON.stringify output.
const payload = '{\n  "id": "evt_test_raw",\n  "object": "event",\n  "type": "customer.subscription.updated",\n  "data": { "object": { "id": "sub_A", "name": "Caf\u00e9 \u2013 r\u00e9sum\u00e9" } }\n}';
const header = stripe.webhooks.generateTestHeaderString({ payload, secret });

test('body parser is disabled for the webhook function', () => {
  assert.deepEqual(config, { api: { bodyParser: false } });
});

test('signature verifies against the exact raw bytes read from the stream', async () => {
  const bytes = Buffer.from(payload, 'utf8');
  const req = Readable.from([bytes.subarray(0, 7), bytes.subarray(7, 40), bytes.subarray(40)]);
  const raw = await readRawBody(req);
  assert.ok(raw.equals(bytes));
  const event = stripe.webhooks.constructEvent(raw, header, secret);
  assert.equal(event.id, 'evt_test_raw');
});

test('re-serialized JSON fails verification', () => {
  const reserialized = JSON.stringify(JSON.parse(payload));
  assert.notEqual(reserialized, payload);
  assert.throws(() => stripe.webhooks.constructEvent(reserialized, header, secret));
});

test('empty and oversized bodies are rejected', async () => {
  await assert.rejects(readRawBody(Readable.from([])), /raw webhook body unavailable/);
  await assert.rejects(readRawBody(Readable.from([Buffer.alloc(1048577)])), /too large/);
});
