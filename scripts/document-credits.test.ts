import test from 'node:test';
import assert from 'node:assert/strict';
import {
  consumeDocumentCredit,
  documentsRemaining,
  hasSubscriptionEntitlement,
  refundDocumentCredit,
} from '../supabase/functions/_shared/document-credits.ts';
import { buildNoCostTemplate, handleGenerateDocument } from '../supabase/functions/_shared/generate-document-handler.ts';

type Row = Record<string, any>;

// jsonb-style equality: key order does not matter.
const canonical = (v: unknown): string => JSON.stringify(v, (_k, x) =>
  x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => a.localeCompare(b))) : x);

// Minimal PostgREST-like fake: filters are evaluated when the query is awaited, so an
// UPDATE only matches rows that still satisfy its WHERE clause at write time.
// beforeUpdate lets a test simulate a concurrent writer between read and write.
function fakeDb(tables: Row[] | Record<string, Row[]>, opts: { beforeUpdate?: () => void } = {}) {
  const byTable: Record<string, Row[]> = Array.isArray(tables) ? { payment_records: tables } : tables;
  const field = (row: Row, column: string) => {
    if (column === 'metadata->>documents_remaining') {
      const v = row.metadata?.documents_remaining; return v === undefined || v === null ? null : String(v);
    }
    if (column === 'metadata') return row.metadata ?? null;
    return row[column];
  };
  const equals = (row: Row, column: string, v: unknown) => column === 'metadata'
    ? row.metadata != null && canonical(row.metadata) === canonical(JSON.parse(String(v)))
    : field(row, column) === v;
  const db = {
    updates: 0,
    from(table: string) {
      const rows = byTable[table] ?? [];
      const filters: Array<(r: Row) => boolean> = [];
      let patch: Row | null = null; let single = false;
      const q: any = {
        select() { return q; }, order() { return q; },
        update(value: Row) { patch = value; return q; },
        eq(c: string, v: unknown) { filters.push((r) => equals(r, c, v)); return q; },
        in(c: string, v: unknown[]) { filters.push((r) => v.includes(field(r, c))); return q; },
        is(c: string, v: unknown) { filters.push((r) => field(r, c) === v); return q; },
        maybeSingle() { single = true; return q; },
        then(resolve: (x: unknown) => void, reject: (e: unknown) => void) {
          Promise.resolve().then(() => {
            if (patch) { db.updates++; opts.beforeUpdate?.(); }
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
  return db;
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

test('a JSON null allowance and a null metadata column each count as one credit, spent once', async () => {
  for (const metadata of [{ documents_remaining: null }, null]) {
    const rows = [record({ metadata })];
    const db = fakeDb(rows);
    assert.equal((await consumeDocumentCredit(db, 'u1')).ok, true);
    assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: false, reason: 'exhausted' });
  }
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

test('a concurrent write to another metadata key is not overwritten: the spend re-reads and retries', async () => {
  const rows = [record({ metadata: { documents_remaining: 1, stripe_session: 'cs_1' } })];
  let raced = false;
  const db = fakeDb(rows, { beforeUpdate: () => { if (!raced) { raced = true; rows[0].metadata = { ...rows[0].metadata, receipt_url: 'r' }; } } });
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: true, recordId: 'pr-1', remaining: 0 });
  assert.equal(db.updates, 2); // first write lost the race, second succeeded
  assert.deepEqual(rows[0].metadata, { documents_remaining: 0, stripe_session: 'cs_1', receipt_url: 'r' });
});

test('the spend gives up with contention after a bounded number of retries', async () => {
  const rows = [record()];
  let n = 0;
  const db = fakeDb(rows, { beforeUpdate: () => { rows[0].metadata = { ...rows[0].metadata, touched: ++n }; } });
  assert.deepEqual(await consumeDocumentCredit(db, 'u1'), { ok: false, reason: 'contention' });
  assert.equal(db.updates, 4);
  assert.equal(rows[0].metadata.documents_remaining, 1);
});

test('only active/trialing subscriptions or live subscription payments exempt from credits', () => {
  assert.equal(hasSubscriptionEntitlement({ status: 'active', tier: 'pro' }, []), true);
  assert.equal(hasSubscriptionEntitlement({ status: 'trialing', tier: 'premium' }, []), true);
  assert.equal(hasSubscriptionEntitlement(null, [{ tier: 'premium', status: 'paid', expires_at: null }]), true);
  assert.equal(hasSubscriptionEntitlement({ status: 'past_due', tier: 'pro' }, []), false);
  assert.equal(hasSubscriptionEntitlement({ status: 'canceled', tier: 'pro' }, []), false);
  assert.equal(hasSubscriptionEntitlement({ status: 'active', tier: null }, []), false);
  assert.equal(hasSubscriptionEntitlement(null, []), false); // stale profiles.subscription_tier is not consulted
  assert.equal(hasSubscriptionEntitlement(null, [{ tier: 'pro', status: 'paid', expires_at: '2000-01-01T00:00:00Z' }]), false);
  assert.equal(hasSubscriptionEntitlement(null, [{ tier: 'document', status: 'paid', expires_at: null }]), false);
  assert.equal(documentsRemaining({ documents_remaining: '2' }), 2);
});

// --- generate-document handler ---------------------------------------------------

const PROMPT = 'Draft an NDA for a California startup';
const AI_TEXT = 'FULL PAID AI NDA DRAFT';

function harness(tables: Record<string, Row[]>, opts: { aiKey?: string; aiResponse?: () => unknown } = {}) {
  const db = fakeDb(tables);
  const aiCalls: unknown[] = [];
  const deps = {
    env: (name: string) => ({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'svc' } as Record<string, string>)[name],
    createClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) }, from: db.from.bind(db) }),
    anthropicKey: () => ('aiKey' in opts ? opts.aiKey : 'sk-ant-test'),
    fetch: (async (...args: unknown[]) => {
      aiCalls.push(args);
      return opts.aiResponse ? opts.aiResponse() : { ok: true, json: async () => ({ content: [{ type: 'text', text: AI_TEXT }] }) };
    }) as unknown as typeof fetch,
  };
  const call = async () => {
    const res = await handleGenerateDocument(new Request('https://fn/generate-document', {
      method: 'POST', headers: { Authorization: 'Bearer t', 'content-type': 'application/json' }, body: JSON.stringify({ prompt: PROMPT }),
    }), deps);
    return { status: res.status, body: await res.json() };
  };
  return { call, aiCalls };
}

test('users with no purchase never reach the paid AI and get the free worksheet with a purchase flag', async () => {
  const h = harness({ payment_records: [], subscriptions: [] });
  const { status, body } = await h.call();
  assert.equal(status, 200);
  assert.equal(h.aiCalls.length, 0);
  assert.equal(body.mode, 'template');
  assert.equal(body.purchaseRequired, true);
  assert.equal(body.exportUnlocked, false);
  assert.equal(body.reason, 'no_purchase');
  assert.equal(body.document, buildNoCostTemplate(PROMPT));
  assert.ok(!JSON.stringify(body).includes(AI_TEXT));
});

test('users whose credit is already spent (or only past_due) also get the worksheet, not the AI output', async () => {
  for (const tables of [
    { payment_records: [record({ metadata: { documents_remaining: 0 } })], subscriptions: [] },
    { payment_records: [], subscriptions: [{ user_id: 'u1', status: 'past_due', tier: 'pro' }] },
  ]) {
    const h = harness(tables);
    const { body } = await h.call();
    assert.equal(h.aiCalls.length, 0);
    assert.equal(body.mode, 'template');
    assert.equal(body.purchaseRequired, true);
    assert.ok(!JSON.stringify(body).includes(AI_TEXT));
  }
});

test('a Per Document credit buys one AI document with exports unlocked', async () => {
  const rows = [record()];
  const h = harness({ payment_records: rows, subscriptions: [] });
  const { body } = await h.call();
  assert.equal(h.aiCalls.length, 1);
  assert.deepEqual(body, { document: AI_TEXT, success: true, mode: 'ai', exportUnlocked: true, purchaseRequired: false, documentsRemaining: 0 });
  assert.equal(rows[0].metadata.documents_remaining, 0);
  const again = await h.call();
  assert.equal(h.aiCalls.length, 1);
  assert.equal(again.body.mode, 'template');
});

test('active subscribers get the AI document without spending a credit', async () => {
  const rows = [record()];
  const h = harness({ payment_records: rows, subscriptions: [{ user_id: 'u1', status: 'active', tier: 'pro' }] });
  const { body } = await h.call();
  assert.equal(body.mode, 'ai');
  assert.equal(body.documentsRemaining, null);
  assert.equal(rows[0].metadata.documents_remaining, 1);
});

test('an AI error after the spend refunds the credit', async () => {
  const rows = [record()];
  const h = harness({ payment_records: rows, subscriptions: [] }, { aiResponse: () => ({ ok: false, json: async () => ({}) }) });
  assert.equal((await h.call()).status, 502);
  assert.equal(rows[0].metadata.documents_remaining, 1);
});

test('an unexpected throw after the spend is refunded by the outer catch', async () => {
  const rows = [record()];
  const h = harness({ payment_records: rows, subscriptions: [] }, {
    aiResponse: () => ({ ok: true, json: async () => ({ get content() { throw new Error('malformed upstream'); } }) }),
  });
  const { status } = await h.call();
  assert.equal(status, 500);
  assert.equal(rows[0].metadata.documents_remaining, 1);
});

test('with paid AI disabled everyone gets the worksheet and no purchase is offered', async () => {
  const h = harness({ payment_records: [], subscriptions: [] }, { aiKey: undefined });
  const { body } = await h.call();
  assert.equal(h.aiCalls.length, 0);
  assert.equal(body.mode, 'template');
  assert.equal(body.purchaseRequired, false);
  assert.equal(body.paidAiAvailable, false);
});
