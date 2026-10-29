// LEG-19: free signed-in users get a daily paid-AI quota; subscribers are unlimited; errors fail closed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { freePaidAIDailyLimit, paidAIQuotaSubject, reservePaidAIQuota, DEFAULT_FREE_PAID_AI_DAILY_LIMIT } from '../supabase/functions/_shared/paid-ai-quota.ts';

function fakeAdmin(opts: { tier?: string; subscription?: unknown; profile?: boolean; rpcError?: boolean; dbError?: boolean } = {}) {
  const counts = new Map<string, number>(); const calls: any[] = [];
  const admin = {
    from(table: string) {
      const q: any = { select: () => q, eq: () => q,
        maybeSingle: async () => {
          if (opts.dbError) return { data: null, error: { message: 'db down' } };
          if (table === 'profiles') return { data: opts.profile === false ? null : { id: 'u1', subscription_tier: opts.tier ?? 'free' }, error: null };
          return { data: opts.subscription ?? null, error: null };
        },
        then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }) };
      return q;
    },
    async rpc(name: string, args: { p_subject: string; p_limit: number }) {
      calls.push({ name, ...args });
      if (opts.rpcError) return { data: null, error: { message: 'rpc down' } };
      const used = counts.get(args.p_subject) ?? 0;
      if (used >= args.p_limit) return { data: [{ allowed: false, used }], error: null };
      counts.set(args.p_subject, used + 1);
      return { data: [{ allowed: true, used: used + 1 }], error: null };
    },
  };
  return { admin, calls, counts };
}
const day = new Date('2026-10-29T12:00:00Z');

test('free user is allowed up to the daily limit, then quota_exceeded', async () => {
  const { admin, calls } = fakeAdmin();
  for (let i = 1; i <= 3; i++) assert.deepEqual(await reservePaidAIQuota({ admin, userId: 'u1', cost: 1, limit: 3, now: day }), { status: 'free_allowed', used: i, limit: 3 });
  assert.deepEqual(await reservePaidAIQuota({ admin, userId: 'u1', cost: 1, limit: 3, now: day }), { status: 'quota_exceeded', used: 3, limit: 3 });
  assert.equal(calls[0].name, 'consume_free_question');
  assert.equal(calls[0].p_subject, 'paid-ai:user:u1:2026-10-29');
});

test('quota resets on a new UTC day and multi-unit cost is charged per unit', async () => {
  const { admin } = fakeAdmin();
  assert.equal((await reservePaidAIQuota({ admin, userId: 'u1', cost: 3, limit: 4, now: day })).status, 'free_allowed');
  assert.equal((await reservePaidAIQuota({ admin, userId: 'u1', cost: 3, limit: 4, now: day })).status, 'quota_exceeded');
  assert.equal((await reservePaidAIQuota({ admin, userId: 'u1', cost: 3, limit: 4, now: new Date('2026-10-30T00:00:01Z') })).status, 'free_allowed');
  assert.notEqual(paidAIQuotaSubject('u1', day), paidAIQuotaSubject('u2', day));
});

test('active subscribers are unlimited and not counted', async () => {
  const { admin, calls } = fakeAdmin({ subscription: { status: 'active', tier: 'premium', current_period_end: '2099-01-01T00:00:00Z', cancel_at_period_end: false } });
  assert.deepEqual(await reservePaidAIQuota({ admin, userId: 'u1', cost: 1, limit: 1, now: day }), { status: 'subscriber' });
  assert.equal(calls.length, 0);
});

test('fails closed on missing profile, DB/RPC errors, bad cost or missing user', async () => {
  assert.equal((await reservePaidAIQuota({ admin: fakeAdmin({ profile: false }).admin, userId: 'u1', cost: 1, limit: 5 })).status, 'unavailable');
  assert.equal((await reservePaidAIQuota({ admin: fakeAdmin({ dbError: true }).admin, userId: 'u1', cost: 1, limit: 5 })).status, 'unavailable');
  assert.equal((await reservePaidAIQuota({ admin: fakeAdmin({ rpcError: true }).admin, userId: 'u1', cost: 1, limit: 5 })).status, 'unavailable');
  for (const cost of [0, -1, 1.5, 6]) assert.equal((await reservePaidAIQuota({ admin: fakeAdmin().admin, userId: 'u1', cost, limit: 5 })).status, 'unavailable', String(cost));
  assert.equal((await reservePaidAIQuota({ admin: fakeAdmin().admin, userId: '', cost: 1, limit: 5 })).status, 'unavailable');
});

test('daily limit env parsing defaults safely', () => {
  const env = (v?: string) => ({ get: () => v });
  assert.equal(freePaidAIDailyLimit(env()), DEFAULT_FREE_PAID_AI_DAILY_LIMIT);
  assert.equal(freePaidAIDailyLimit(env('25')), 25);
  for (const bad of ['0', '-3', 'abc', '1.5', '100000']) assert.equal(freePaidAIDailyLimit(env(bad)), DEFAULT_FREE_PAID_AI_DAILY_LIMIT);
});
