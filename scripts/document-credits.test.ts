import test from 'node:test';
import assert from 'node:assert/strict';
import {
  consumeDocumentCredit,
  documentsRemaining,
  hasSubscriptionEntitlement,
  refundDocumentCredit,
} from '../supabase/functions/_shared/document-credits.ts';

type Row = Record<string, any>;

// Minimal PostgREST-like fake: filters are evaluated when the query is awaited, so an
// UPDATE only matches rows that still satisfy its WHERE clause at write time.
function fakeDb(rows: Row[]) {
  const field = (row: Row, column: string) => {
    if (column === 'metadata->>documents_remaining') {
      const v = row.metadata?.documents_remaining; return v === undefined || v === null ? null : String(v);
    }
    return row[column];
  };
  return {
    from() {
      const filters: Array<(r: Row) => boolean> = [];
      let patch: Row | null = null; let single = false;
      const q: any = {
        select() { return q; }, order() { return q; },
        update(value: Row) { patch = value; return q; },
        eq(c: string, v: unknown) { filters.push((r) => field(r, c) === v); return q; },
        in(c: string, v: unknown[]) { filters.push((r) => v.includes(field(r, c))); return q; },
        is(c: string, v: unknown) { filters.push((r) => field(r, c) === v); return q; },
        maybeSingle() { single = true; return q; },
        then(resolve: (x: unknown) => void, reject: (e: unknown) => void) {
          Promise.resolve().then(() => {
            const matched = rows.filter((r) => filters.every((f) => f(r)));
            if (patch) for (const r of matched) Object.assign(r, structuredClone(patch));
            const data = matched.map((r) => structuredClone(r));
            resolve({ data: single ? data[0] ?? null : data, error: null });
          }, reject);
        },
      };
      return q;
    },
  };
}

const record = (over: Row = {}) => ({ id: 'pr-1', user_id: 'u1', tier: 'document', status: 'paid', expires_at: null, metadata: { documents_remaining: 1 }, ...over });

test('one Per Document purchase buys exactly one generation', async () => {
  const rows = [record()];
  const db = fakeDb(rows);
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: true, recordId: 'pr-1', remaining: 0 });
  assert.equal(rows[0].metadata.documents_remaining, 0);
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: false, reason: 'exhausted' });
});

test('concurrent requests cannot both spend the same credit', async () => {
  const rows = [record({ metadata: {} })]; // legacy row without the key counts as 1
  const db = fakeDb(rows);
  const results = await Promise.all([consumeDocumentCredit(db, 'u1'), consumeDocumentCredit(db, 'u1'), consumeDocumentCredit(db, 'u1')]);
  assert.equal(results.filter((r) => r.ok).length, 1);
  assert.equal(rows[0].metadata.documents_remaining, 0);
});

test('two purchases buy two generations; other users and refunded/expired rows are ignored', async () => {
  const rows = [record(), record({ id: 'pr-2' }), record({ id: 'x', user_id: 'u2' }), record({ id: 'r', status: 'refunded' }), record({ id: 'e', expires_at: '2000-01-01T00:00:00Z' })];
  const db = fakeDb(rows);
  assert.equal((await consumeDocumentCredit(db, 'u1')).ok, true);
  assert.equal((await consumeDocumentCredit(db, 'u1')).ok, true);
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: false, reason: 'exhausted' });
  assert.equal(rows[2].metadata.documents_remaining, 1);
  assert.equal(rows[3].metadata.documents_remaining, 1);
});

test('a JSON null allowance counts as one credit and can be spent once', async () => {
  const rows = [record({ metadata: { documents_remaining: null } })];
  const db = fakeDb(rows);
  assert.equal((await consumeDocumentCredit(db, 'u1')).ok, true);
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: false, reason: 'exhausted' });
});

test('users with no purchase are reported as no_purchase, not exhausted', async () => {
  assert.deepEqual(await consumeDocumentCredit(fakeDb([]), 'u1'), { ok: false, reason: 'no_purchase' });
});

test('a failed generation returns the credit', async () => {
  const rows = [record()];
  const db = fakeDb(rows);
  const spent = await consumeDocumentCredit(db, 'u1');
  assert.ok(spent.ok);
  assert.equal(await refundDocumentCredit(db, 'u1', 'pr-1'), true);
  assert.equal(rows[0].metadata.documents_remaining, 1);
});

test('subscription tiers never consume document credits', () => {
  assert.equal(hasSubscriptionEntitlement('free', { status: 'active', tier: 'pro' }, []), true);
  assert.equal(hasSubscriptionEntitlement('free', null, [{ tier: 'premium', status: 'paid', expires_at: null }]), true);
  assert.equal(hasSubscriptionEntitlement('enterprise', null, []), true);
  assert.equal(hasSubscriptionEntitlement('free', null, [{ tier: 'document', status: 'paid', expires_at: null }]), false);
  assert.equal(hasSubscriptionEntitlement('free', { status: 'canceled', tier: 'pro' }, []), false);
  assert.equal(documentsRemaining({ documents_remaining: '2' }), 2);
});
