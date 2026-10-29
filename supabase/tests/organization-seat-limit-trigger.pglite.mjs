// Manual DB test for 20261029181637_organization_seat_limit_trigger.sql.
// Not in CI (pglite is not a repo dependency). Run with:
//   npm i --no-save @electric-sql/pglite && node --test supabase/tests/organization-seat-limit-trigger.pglite.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const migration = readFileSync(
  new URL("../migrations/20261029181637_organization_seat_limit_trigger.sql", import.meta.url), "utf8");

const STUB = `
create role anon; create role authenticated;
create table public.organizations (id uuid primary key, owner_id uuid);
create table public.organization_members (id serial primary key, organization_id uuid, user_id uuid,
  is_active boolean default true, job_title text, unique (organization_id, user_id));
create table public.user_roles (user_id uuid, organization_id uuid, role text);
create table public.subscriptions (user_id uuid, status text, tier text, stripe_price_id text,
  metadata jsonb default '{}', current_period_end timestamptz);
`;
const ORG = "00000000-0000-0000-0000-0000000000aa";
const OWNER = "00000000-0000-0000-0000-000000000001";
const u = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;

async function setup(sub) {
  const db = new PGlite();
  await db.exec(STUB);
  await db.exec(migration);
  await db.query("insert into public.organizations values ($1, $2)", [ORG, OWNER]);
  if (sub) {
    await db.query("insert into public.subscriptions values ($1,$2,$3,$4,$5,now() + interval '30 days')",
      [OWNER, sub.status ?? "active", sub.tier ?? "pro", sub.price ?? null, JSON.stringify(sub.metadata ?? {})]);
  }
  return db;
}
// Like accept_organization_invite: member row first, role second, one transaction.
const addMember = (db, n, role = "lawyer") => db.transaction(async (tx) => {
  await tx.query("insert into public.organization_members (organization_id, user_id) values ($1,$2)", [ORG, u(n)]);
  await tx.query("insert into public.user_roles values ($1,$2,$3)", [u(n), ORG, role]);
});

test("Firm allows owner + 2 staff, blocks the 4th seat", async () => {
  const db = await setup({ price: "price_1SckV70QhWGUtGKvvg1tH7lu" });
  await addMember(db, 2); await addMember(db, 3);
  await assert.rejects(addMember(db, 4), /Seat limit reached for this plan\. Add seats in Settings\./);
  const { rows } = await db.query("select count(*)::int c from public.organization_members");
  assert.equal(rows[0].c, 2);
});

test("clients do not use seats (role inserted after member row)", async () => {
  const db = await setup({ price: "price_1UVwxE0QhWGUtGKv3tjz0A3I" }); // Solo = 1
  await addMember(db, 2, "client"); await addMember(db, 3, "client");
  await assert.rejects(addMember(db, 4, "lawyer"), /Seat limit reached for this plan\. Add seats in Settings\./);
});

test("extra_seats raise the limit, trialing counts as live", async () => {
  const db = await setup({ status: "trialing", price: "price_1SckV70QhWGUtGKvvg1tH7lu", metadata: { extra_seats: "2" } });
  for (const n of [2, 3, 4, 5]) await addMember(db, n);
  await assert.rejects(addMember(db, 6), /Seat limit reached for this plan\. Add seats in Settings\./);
});

test("reactivating a member is checked too", async () => {
  const db = await setup({ price: "price_1UVwxE0QhWGUtGKv3tjz0A3I" });
  await db.query("insert into public.organization_members (organization_id,user_id,is_active) values ($1,$2,false)", [ORG, u(2)]);
  await db.query("insert into public.user_roles values ($1,$2,'lawyer')", [u(2), ORG]);
  await assert.rejects(db.query("update public.organization_members set is_active = true where user_id = $1", [u(2)]), /Seat limit reached for this plan\. Add seats in Settings\./);
});

test("no live seat plan means no limit (premium, canceled, none)", async () => {
  for (const sub of [{ price: "price_1Sdfqp0QhWGUtGKvcQuWONuB", tier: "premium" }, { status: "canceled" }, null]) {
    const db = await setup(sub);
    for (const n of [2, 3, 4, 5, 6]) await addMember(db, n);
  }
});

const FIRM = "price_1SckV70QhWGUtGKvvg1tH7lu";
const SOLO = "price_1UVwxE0QhWGUtGKv3tjz0A3I";
const count = async (db) => (await db.query("select count(*)::int c from public.organization_members where is_active")).rows[0].c;

// Firm (limit 3) that already has owner + 4 staff = 5 seats, e.g. members added before the trigger existed.
async function overLimitFirm() {
  const db = await setup(null);
  for (const n of [2, 3, 4, 5]) await addMember(db, n);
  await db.query("insert into public.subscriptions values ($1,'active','pro',$2,'{}',now() + interval '30 days')", [OWNER, FIRM]);
  return db;
}

test("an insert within the limit succeeds", async () => {
  const db = await setup({ price: FIRM });
  await addMember(db, 2);
  await addMember(db, 3);
  assert.equal(await count(db), 2);
});

test("an already-over-limit firm keeps everyone and can update and delete existing rows", async () => {
  const db = await overLimitFirm();
  await db.query("update public.organization_members set job_title = 'Partner' where user_id = $1", [u(2)]);
  // Same as accept_organization_invite's ON CONFLICT DO UPDATE SET is_active = true on an active member.
  await db.query(`insert into public.organization_members (organization_id, user_id, is_active) values ($1,$2,true)
    on conflict (organization_id, user_id) do update set is_active = true`, [ORG, u(3)]);
  await db.query("update public.organization_members set is_active = false where user_id = $1", [u(4)]);
  await db.query("delete from public.organization_members where user_id = $1", [u(5)]);
  assert.equal(await count(db), 2);
});

test("an over-limit firm cannot add staff or reactivate, but can still add clients", async () => {
  const db = await overLimitFirm();
  await assert.rejects(addMember(db, 6), /Seat limit reached for this plan/);
  await addMember(db, 7, "client");
  await db.query("update public.organization_members set is_active = false where user_id = $1", [u(2)]);
  await assert.rejects(db.query("update public.organization_members set is_active = true where user_id = $1", [u(2)]), /Seat limit reached/);
  assert.equal(await count(db), 4); // 3 staff + 1 client still active
});

test("removing members always works, and frees a seat for a new member", async () => {
  const db = await setup({ price: FIRM });
  await addMember(db, 2); await addMember(db, 3);
  await db.query("delete from public.organization_members where user_id = $1", [u(2)]);
  await addMember(db, 4);
  await db.transaction(async (tx) => { // remove and add in one transaction
    await tx.query("update public.organization_members set is_active = false where user_id = $1", [u(3)]);
    await tx.query("insert into public.organization_members (organization_id, user_id) values ($1,$2)", [ORG, u(5)]);
    await tx.query("insert into public.user_roles values ($1,$2,'lawyer')", [u(5), ORG]);
  });
  assert.equal(await count(db), 2);
});

test("the owner is never blocked, even in a full firm", async () => {
  const db = await setup({ price: SOLO }); // limit 1 = the owner
  await addMember(db, 1, "admin"); // u(1) === OWNER
  await db.query("update public.organization_members set is_active = false where user_id = $1", [OWNER]);
  await db.query("update public.organization_members set is_active = true where user_id = $1", [OWNER]);
  assert.equal(await count(db), 1);
});

test("the error carries a clear message and detail", async () => {
  const db = await setup({ price: SOLO });
  await assert.rejects(addMember(db, 2), (e) => {
    assert.equal(e.message, "Seat limit reached for this plan. Add seats in Settings.");
    assert.equal(e.code, "P0001");
    assert.match(e.detail ?? "", /2 of 1 seats/);
    return true;
  });
});
