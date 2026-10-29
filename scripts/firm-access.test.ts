import { test } from "node:test";
import assert from "node:assert/strict";
import { planGrantsFirmAccess, resolveFirmAccess, SOLO_PRICE_ID } from "../supabase/functions/_shared/firm-access.ts";

const FIRM_OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const STAFF = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const FORMER_STAFF = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const FREE_OWNER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const FREE_STAFF = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const PAID_ORG = "11111111-1111-4111-8111-111111111111";
const FREE_ORG = "22222222-2222-4222-8222-222222222222";
const SOLO_OWNER = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const SOLO_STAFF = "99999999-9999-4999-8999-999999999999";
const SOLO_ORG = "33333333-3333-4333-8333-333333333333";
const future = new Date(Date.now() + 86_400_000).toISOString();

const tables: Record<string, Record<string, unknown>[]> = {
  organizations: [{ id: PAID_ORG, owner_id: FIRM_OWNER }, { id: FREE_ORG, owner_id: FREE_OWNER }, { id: SOLO_ORG, owner_id: SOLO_OWNER }],
  organization_members: [
    { user_id: STAFF, organization_id: PAID_ORG, is_active: true },
    { user_id: FORMER_STAFF, organization_id: PAID_ORG, is_active: false },
    { user_id: FREE_STAFF, organization_id: FREE_ORG, is_active: true },
    { user_id: SOLO_STAFF, organization_id: SOLO_ORG, is_active: true },
  ],
  subscriptions: [
    { user_id: FIRM_OWNER, status: "active", tier: "pro" },
    { user_id: FREE_OWNER, status: "active", tier: "premium" },
    { user_id: SOLO_OWNER, status: "active", tier: "pro", stripe_price_id: SOLO_PRICE_ID },
  ],
  payment_records: [],
};

function fakeDb() {
  return {
    from(table: string) {
      let rows = [...(tables[table] ?? [])];
      const q = {
        select: () => q,
        eq: (k: string, v: unknown) => { rows = rows.filter((r) => r[k] === v); return q; },
        in: (k: string, vs: unknown[]) => { rows = rows.filter((r) => vs.includes(r[k])); return q; },
        order: () => q,
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: null }),
      };
      return q;
    },
  };
}

test("only Firm (pro) and Enterprise plans that are live grant firm access", () => {
  assert.equal(planGrantsFirmAccess({ status: "active", tier: "pro" }, []), true);
  assert.equal(planGrantsFirmAccess({ status: "trialing", tier: "enterprise" }, []), true);
  assert.equal(planGrantsFirmAccess({ status: "active", tier: "premium" }, []), false);
  assert.equal(planGrantsFirmAccess({ status: "canceled", tier: "pro" }, []), false);
  assert.equal(planGrantsFirmAccess(null, [{ tier: "pro", status: "paid", expires_at: future }]), true);
  assert.equal(planGrantsFirmAccess(null, [{ tier: "document", status: "paid", expires_at: future, metadata: { documents_remaining: 1 } }]), false);
  assert.equal(planGrantsFirmAccess(null, [{ tier: "pro", status: "pending", expires_at: future }]), false);
  assert.equal(planGrantsFirmAccess(null, []), false);
});

test("active staff inherit their firm owner's plan; former staff and free firms do not", async () => {
  const db = fakeDb();
  const none = { subscription: null, paymentRecords: [] };
  assert.deepEqual(await resolveFirmAccess(db, FIRM_OWNER, { subscription: { status: "active", tier: "pro" }, paymentRecords: [] }), { firmAccess: true, source: "own_plan" });
  assert.deepEqual(await resolveFirmAccess(db, STAFF, none), { firmAccess: true, source: "organization_owner_plan" });
  assert.deepEqual(await resolveFirmAccess(db, FORMER_STAFF, none), { firmAccess: false, source: null });
  assert.deepEqual(await resolveFirmAccess(db, FREE_STAFF, none), { firmAccess: false, source: null });
  assert.deepEqual(await resolveFirmAccess(db, FREE_OWNER, { subscription: { status: "active", tier: "premium" }, paymentRecords: [] }), { firmAccess: false, source: null });
});

test("database errors fail closed", async () => {
  const errorDb = { from: () => { const q: Record<string, unknown> = {}; for (const k of ["select", "eq", "in", "order"]) q[k] = () => q; q.then = (r: (v: unknown) => void) => r({ data: null, error: { message: "boom" } }); return q; } };
  assert.deepEqual(await resolveFirmAccess(errorDb, STAFF, { subscription: null, paymentRecords: [] }), { firmAccess: false, source: null });
});

test("a Solo plan unlocks the hub for its subscriber only, not for organization staff", async () => {
  const db = fakeDb();
  assert.equal(SOLO_PRICE_ID, "price_1UVwxE0QhWGUtGKv3tjz0A3I");
  assert.deepEqual(await resolveFirmAccess(db, SOLO_OWNER, { subscription: { status: "active", tier: "pro" }, paymentRecords: [] }), { firmAccess: true, source: "own_plan" });
  assert.deepEqual(await resolveFirmAccess(db, SOLO_STAFF, { subscription: null, paymentRecords: [] }), { firmAccess: false, source: null });
});
