// Free Ask Lee questions: per user or per device per day, with a per-network cap; dialog has no fake ad flow.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkFreeQuestion, freeQuestionSubjects, normalizeDeviceId, NETWORK_LIMIT_MULTIPLIER } from '../supabase/functions/_shared/free-question-gate.ts';
import { getDeviceId } from '../src/lib/freeQuestions.ts';

const now = new Date('2026-10-29T20:00:00Z');
const req = (ip = '203.0.113.7') => new Request('https://x.test', { headers: { 'x-forwarded-for': ip } });

function fakeAdmin() {
  const counts = new Map<string, number>(); const calls: string[] = [];
  const empty = { data: null, error: null };
  const q: any = { select: () => q, eq: () => q, maybeSingle: async () => empty, then: (r: any) => r({ data: [], error: null }) };
  return { calls, counts, from: () => q, rpc: async (_: string, { p_subject, p_limit }: { p_subject: string; p_limit: number }) => {
    calls.push(p_subject); const used = counts.get(p_subject) ?? 0;
    if (used >= p_limit) return { data: [{ allowed: false, used }], error: null };
    counts.set(p_subject, used + 1); return { data: [{ allowed: true, used: used + 1 }], error: null };
  } };
}

test('subjects are per user or per device per UTC day, with a network cap for devices', async () => {
  const user = await freeQuestionSubjects({ userId: 'u1', ip: '1.1.1.1', deviceId: null, salt: 's', limit: 5, now });
  assert.deepEqual(user, [{ subject: 'user:u1:2026-10-29', limit: 5 }]);
  const dev = await freeQuestionSubjects({ userId: null, ip: '1.1.1.1', deviceId: 'abcdef0123456789', salt: 's', limit: 5, now });
  assert.equal(dev.length, 2);
  assert.match(dev[0].subject, /^dev:[0-9a-f]{64}:2026-10-29$/);
  assert.deepEqual(dev[1].limit, 5 * NETWORK_LIMIT_MULTIPLIER);
  assert.match(dev[1].subject, /^ip:[0-9a-f]{64}:2026-10-29$/);
  assert.ok(!dev[0].subject.includes('abcdef0123456789'), 'raw device id is never stored');
  const ipOnly = await freeQuestionSubjects({ userId: null, ip: '1.1.1.1', deviceId: null, salt: 's', limit: 5, now });
  assert.deepEqual(ipOnly, [{ subject: dev[1].subject, limit: 5 }]);
});

test('an anonymous device gets 5 answers then the gate; another device on the same network still gets its own 5', async () => {
  const admin = fakeAdmin();
  const ask = (deviceId: string) => checkFreeQuestion({ admin, req: req(), userId: null, deviceId, salt: 's', limit: 5, now });
  for (let i = 1; i <= 5; i++) assert.deepEqual(await ask('device-aaaaaaaaaaaaaaaa'), { allowed: true, used: i, limit: 5, subscriber: false });
  assert.equal((await ask('device-aaaaaaaaaaaaaaaa')).allowed, false);
  assert.deepEqual(await ask('device-bbbbbbbbbbbbbbbb'), { allowed: true, used: 1, limit: 5, subscriber: false });
  const tomorrow = await checkFreeQuestion({ admin, req: req(), userId: null, deviceId: 'device-aaaaaaaaaaaaaaaa', salt: 's', limit: 5, now: new Date('2026-10-30T20:00:00Z') });
  assert.equal(tomorrow.allowed, true, 'count resets the next day');
});

test('the shared-network cap stops endless new device ids', async () => {
  const admin = fakeAdmin();
  let allowed = 0;
  for (let i = 0; i < 60; i++) {
    const r = await checkFreeQuestion({ admin, req: req(), userId: null, deviceId: `device-${String(i).padStart(12, '0')}`, salt: 's', limit: 5, now });
    if (r.allowed) allowed++;
  }
  assert.equal(allowed, 5 * NETWORK_LIMIT_MULTIPLIER);
});

test('device ids are validated and kept in storage', () => {
  assert.equal(normalizeDeviceId('short'), null);
  assert.equal(normalizeDeviceId('<script>alert(1)</script>xxxx'), null);
  assert.equal(normalizeDeviceId('0f8fad5b-d9cb-469f-a165-70867728950e'), '0f8fad5b-d9cb-469f-a165-70867728950e');
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  const id = getDeviceId(storage);
  assert.ok(id && normalizeDeviceId(id));
  assert.equal(getDeviceId(storage), id);
  assert.equal(getDeviceId(null), null);
});

test('free-limit dialog offers Subscribe and Sign in only, with no fake sponsor-video flow; pricing has no $0 plan', () => {
  const dialog = readFileSync(new URL('../src/components/paywall/FreeLimitDialog.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(dialog, /sponsor|watch|bonus|countdown/i);
  assert.match(dialog, /Subscribe to Premium/);
  assert.match(dialog, /\/login/);
  for (const file of ['../src/pages/PricingPage.tsx', '../src/pages/Index.tsx']) {
    assert.doesNotMatch(readFileSync(new URL(file, import.meta.url), 'utf8'), /price: "\$0"/);
  }
});
