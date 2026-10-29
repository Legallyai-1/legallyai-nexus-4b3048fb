import { test } from "node:test";
import assert from "node:assert/strict";
import { hasOrgAccess, isSafeOutboundUrl, userInAnyOrg } from "../supabase/functions/_shared/org-access.ts";

const ORG = "11111111-1111-4111-8111-111111111111";
const OTHER_ORG = "22222222-2222-4222-8222-222222222222";
const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ADMIN = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MEMBER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const OUTSIDER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const NULL_ROLE = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

const tables: Record<string, Record<string, unknown>[]> = {
  organizations: [{ id: ORG, owner_id: OWNER }, { id: OTHER_ORG, owner_id: OUTSIDER }],
  user_roles: [
    { user_id: ADMIN, organization_id: ORG, role: "admin" },
    { user_id: NULL_ROLE, organization_id: null, role: "owner" },
  ],
  organization_members: [{ id: "m1", user_id: MEMBER, organization_id: ORG, is_active: true }],
};

function fakeDb() {
  return {
    from(table: string) {
      let rows = [...(tables[table] ?? [])];
      const q = {
        select: () => q,
        eq: (k: string, v: unknown) => { rows = rows.filter((r) => r[k] === v); return q; },
        in: (k: string, vs: unknown[]) => { rows = rows.filter((r) => vs.includes(r[k])); return q; },
        not: (k: string) => { rows = rows.filter((r) => r[k] !== null && r[k] !== undefined); return q; },
        limit: async (n: number) => ({ data: rows.slice(0, n), error: null }),
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: rows, error: null }),
      };
      return q;
    },
  };
}

test("org owner, scoped admin and active member get the right access", async () => {
  const db = fakeDb();
  assert.equal(await hasOrgAccess(db, OWNER, ORG, "admin"), true);
  assert.equal(await hasOrgAccess(db, ADMIN, ORG, "admin"), true);
  assert.equal(await hasOrgAccess(db, MEMBER, ORG, "member"), true);
  assert.equal(await hasOrgAccess(db, MEMBER, ORG, "admin"), false);
});

test("outsiders, NULL-org roles and bad ids are denied", async () => {
  const db = fakeDb();
  assert.equal(await hasOrgAccess(db, OUTSIDER, ORG, "member"), false);
  assert.equal(await hasOrgAccess(db, NULL_ROLE, ORG, "member"), false);
  assert.equal(await hasOrgAccess(db, NULL_ROLE, ORG, "admin"), false);
  assert.equal(await hasOrgAccess(db, OWNER, "not-a-uuid", "member"), false);
  assert.equal(await hasOrgAccess(db, OWNER, undefined, "member"), false);
  assert.equal(await hasOrgAccess(db, ADMIN, OTHER_ORG, "member"), false);
});

test("notification targets must share a firm", async () => {
  const db = fakeDb();
  assert.equal(await userInAnyOrg(db, MEMBER, [ORG]), true);
  assert.equal(await userInAnyOrg(db, OUTSIDER, [ORG]), false);
  assert.equal(await userInAnyOrg(db, MEMBER, []), false);
});

test("outbound webhook URLs reject internal and non-https targets", () => {
  assert.equal(isSafeOutboundUrl("https://hooks.example.com/abc"), true);
  for (const bad of [
    "http://hooks.example.com/abc",
    "https://169.254.169.254/latest/meta-data",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://[::1]/",
    "https://user:pass@example.com/",
    "https://example.com:8443/",
    "https://whdljtbtqisoszbrzdwq.supabase.co/rest/v1/",
    "file:///etc/passwd",
    "not a url",
  ]) assert.equal(isSafeOutboundUrl(bad), false, bad);
});
