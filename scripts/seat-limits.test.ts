import { test } from "node:test";
import assert from "node:assert/strict";
import { ENTERPRISE_PLAN_PRICE_ID, FIRM_PLAN_PRICE_ID, PREMIUM_PRICE_ID, SOLO_PLAN_PRICE_ID, extraSeatsFrom, planNameFor, seatLimitFor } from "../supabase/functions/_shared/plan-catalog.ts";
import { getOrganizationSeats, hasFreeSeat, seatLimitMessage } from "../supabase/functions/_shared/organization-seats.ts";
import { subscriptionMetadata } from "../api/webhooks/stripe.ts";
import { seatsFull, seatSummary } from "../src/lib/firmSeats.ts";

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

test("plan names come from the price ID, not the shared 'pro' tier", () => {
  assert.equal(planNameFor(SOLO_PLAN_PRICE_ID, "pro"), "Solo");
  assert.equal(planNameFor(FIRM_PLAN_PRICE_ID, "pro"), "Firm");
  assert.equal(planNameFor(ENTERPRISE_PLAN_PRICE_ID, "pro"), "Enterprise");
  assert.equal(planNameFor(PREMIUM_PRICE_ID, "premium"), "Premium");
  assert.equal(planNameFor(null, "pro"), "Firm");
  assert.equal(planNameFor(null, "document"), "Per document");
  assert.equal(planNameFor(null, null), "Free");
});

test("seat limits: Solo 1, Firm 3, Enterprise 10, plus purchased extra seats", () => {
  assert.equal(seatLimitFor(SOLO_PLAN_PRICE_ID, "pro", { extra_seats: "5" }), 1);
  assert.equal(seatLimitFor(FIRM_PLAN_PRICE_ID, "pro", {}), 3);
  assert.equal(seatLimitFor(FIRM_PLAN_PRICE_ID, "pro", { extra_seats: "2" }), 5);
  assert.equal(seatLimitFor(ENTERPRISE_PLAN_PRICE_ID, "pro", { extra_seats: 4 }), 14);
  assert.equal(seatLimitFor(PREMIUM_PRICE_ID, "premium", {}), null);
  assert.equal(seatLimitFor(null, "pro", null), 3);
  assert.equal(seatLimitFor(null, "free", null), null);
  assert.equal(extraSeatsFrom({ extra_seats: "-3" }), 0);
  assert.equal(extraSeatsFrom({ extra_seats: "abc" }), 0);
  assert.equal(extraSeatsFrom({ extra_seats: "999" }), 100);
});

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORG = "11111111-1111-4111-8111-111111111111";
type Row = Record<string, unknown>;

function fakeDb(tables: Record<string, Row[]>) {
  return {
    from(table: string) {
      let rows = [...(tables[table] ?? [])];
      const q = {
        select: () => q, limit: () => q, order: () => q,
        eq: (k: string, v: unknown) => { rows = rows.filter((r) => r[k] === v); return q; },
        is: (k: string, v: unknown) => { rows = rows.filter((r) => (r[k] ?? null) === v); return q; },
        gt: (k: string, v: string) => { rows = rows.filter((r) => String(r[k]) > v); return q; },
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: null }),
      };
      return q;
    },
  };
}

function firm(priceId: string | null, extra: Row = {}, members: Row[] = [], invites: Row[] = [], roles: Row[] = [], status = "active") {
  return fakeDb({
    organizations: [{ id: ORG, owner_id: OWNER }],
    subscriptions: priceId === null ? [] : [{ user_id: OWNER, status, tier: "pro", stripe_price_id: priceId, metadata: extra }],
    payment_records: [],
    organization_members: [{ organization_id: ORG, user_id: OWNER, is_active: true }, ...members.map((m) => ({ organization_id: ORG, ...m }))],
    user_roles: [{ organization_id: ORG, user_id: OWNER, role: "owner" }, ...roles.map((r) => ({ organization_id: ORG, ...r }))],
    organization_invites: invites.map((i) => ({ organization_id: ORG, accepted_at: null, expires_at: future, ...i })),
  });
}

test("Firm: owner + 2 staff fills 3 seats; pending invites hold seats; clients and former staff don't count", async () => {
  const members = [{ user_id: "s1", is_active: true }, { user_id: "s2", is_active: true }, { user_id: "gone", is_active: false }, { user_id: "c1", is_active: true }];
  const roles = [{ user_id: "s1", role: "lawyer" }, { user_id: "c1", role: "client" }];
  const full = await getOrganizationSeats(firm(FIRM_PLAN_PRICE_ID, {}, members, [], roles), ORG);
  assert.deepEqual({ ...full }, { planName: "Firm", limit: 3, members: 3, pendingInvites: 0, used: 3 });
  assert.equal(hasFreeSeat(full), false);
  assert.match(seatLimitMessage(full), /Firm plan includes 3 seats.*\/pricing/);

  const oneStaff = [{ user_id: "s1", is_active: true }];
  const invites = [{ id: "i1", role: "paralegal" }, { id: "i2", role: "client" }, { id: "i3", role: "lawyer", expires_at: past }];
  const withInvite = await getOrganizationSeats(firm(FIRM_PLAN_PRICE_ID, {}, oneStaff, invites), ORG);
  assert.equal(withInvite.used, 3);
  assert.equal(hasFreeSeat(withInvite), false);
  // At acceptance time only active members count (the invite itself held the seat).
  const atAccept = await getOrganizationSeats(firm(FIRM_PLAN_PRICE_ID, {}, oneStaff, invites), ORG, { countPendingInvites: false });
  assert.equal(atAccept.used, 2);
  assert.equal(hasFreeSeat(atAccept), true);
});

test("extra seats raise the limit; Enterprise starts at 10; Solo is 1", async () => {
  const members = [{ user_id: "s1", is_active: true }, { user_id: "s2", is_active: true }];
  assert.equal(hasFreeSeat(await getOrganizationSeats(firm(FIRM_PLAN_PRICE_ID, { extra_seats: "1" }, members), ORG)), true);
  const ent = await getOrganizationSeats(firm(ENTERPRISE_PLAN_PRICE_ID, {}, members), ORG);
  assert.equal(ent.planName, "Enterprise");
  assert.equal(ent.limit, 10);
  const solo = await getOrganizationSeats(firm(SOLO_PLAN_PRICE_ID), ORG);
  assert.deepEqual([solo.planName, solo.limit, solo.used, hasFreeSeat(solo)], ["Solo", 1, 1, false]);
  assert.match(seatLimitMessage(solo), /Upgrade to Firm or Enterprise/);
});

test("owners without a live plan have no seat allowance to enforce", async () => {
  const none = await getOrganizationSeats(firm(null), ORG);
  assert.equal(none.limit, null);
  assert.equal(hasFreeSeat(none), true);
  const lapsed = await getOrganizationSeats(firm(FIRM_PLAN_PRICE_ID, {}, [], [], [], "canceled"), ORG);
  assert.equal(lapsed.planName, "Free");
});

test("webhook stores the live seat add-on quantity as metadata.extra_seats", () => {
  const sub = (items: { id: string; quantity: number }[], metadata: Record<string, string> = {}) =>
    ({ metadata, items: { data: items.map((i) => ({ price: { id: i.id }, quantity: i.quantity })) } }) as never;
  assert.deepEqual(subscriptionMetadata(sub([{ id: FIRM_PLAN_PRICE_ID, quantity: 1 }, { id: "price_1UVwxO0QhWGUtGKvUKZM9SCE", quantity: 4 }], { user_id: "u", extra_seats: "2" })), { user_id: "u", extra_seats: "4" });
  assert.deepEqual(subscriptionMetadata(sub([{ id: FIRM_PLAN_PRICE_ID, quantity: 1 }], { user_id: "u", extra_seats: "2" })), { user_id: "u" });
});

test("team panel seat summary and full state", () => {
  const seats = { planName: "Firm", limit: 3, members: 2, pendingInvites: 1, used: 3 };
  assert.equal(seatsFull(seats), true);
  assert.equal(seatSummary(seats), "Firm plan · 3 of 3 seats used (1 pending invite)");
  assert.equal(seatsFull({ ...seats, limit: null }), false);
  assert.equal(seatsFull(null), false);
});
