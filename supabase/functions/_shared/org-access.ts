// Server-side organization authorization for edge functions that use the service-role client.
// The service-role client bypasses RLS, so every function that accepts an organization id from the
// request body MUST call one of these before reading or writing that organization's data.

// deno-lint-ignore no-explicit-any
type Db = any;

export type OrgAccessLevel = "member" | "admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/**
 * Returns true only when userId belongs to organizationId.
 * - "member": organization owner, an active organization_members row, or any user_roles row scoped to this org.
 * - "admin": organization owner, or an owner/admin user_roles row scoped to this org.
 * Roles with a NULL organization_id never count (they are not scoped to any firm).
 */
export async function hasOrgAccess(
  db: Db,
  userId: string,
  organizationId: unknown,
  level: OrgAccessLevel = "member",
): Promise<boolean> {
  if (!isUuid(userId) || !isUuid(organizationId)) return false;

  const { data: org, error: orgError } = await db
    .from("organizations")
    .select("id, owner_id")
    .eq("id", organizationId)
    .maybeSingle();
  if (orgError || !org) return false;
  if (org.owner_id === userId) return true;

  const roles = level === "admin" ? ["owner", "admin"] : null;
  let roleQuery = db
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", organizationId);
  if (roles) roleQuery = roleQuery.in("role", roles);
  const { data: roleRows, error: roleError } = await roleQuery.limit(1);
  if (!roleError && Array.isArray(roleRows) && roleRows.length > 0) return true;
  if (level === "admin") return false;

  const { data: member, error: memberError } = await db
    .from("organization_members")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();
  return !memberError && Boolean(member);
}

/** Organizations in which userId is owner/admin (scoped roles only). */
export async function adminOrgIds(db: Db, userId: string): Promise<string[]> {
  const ids = new Set<string>();
  const { data: owned } = await db.from("organizations").select("id").eq("owner_id", userId);
  for (const row of owned ?? []) if (row?.id) ids.add(row.id);
  const { data: roles } = await db
    .from("user_roles")
    .select("organization_id")
    .eq("user_id", userId)
    .in("role", ["owner", "admin"])
    .not("organization_id", "is", null);
  for (const row of roles ?? []) if (row?.organization_id) ids.add(row.organization_id);
  return [...ids];
}

/** True when targetUserId is the owner or an active member/role holder of one of orgIds. */
export async function userInAnyOrg(db: Db, targetUserId: string, orgIds: string[]): Promise<boolean> {
  if (!isUuid(targetUserId) || orgIds.length === 0) return false;
  for (const orgId of orgIds) {
    if (await hasOrgAccess(db, targetUserId, orgId, "member")) return true;
  }
  return false;
}

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|metadata\.google\.internal)$/i;

/**
 * Outbound webhook URL guard (SSRF): https only, default port, no credentials,
 * and no literal IPs or internal hostnames.
 */
export function isSafeOutboundUrl(raw: unknown): boolean {
  if (typeof raw !== "string" || raw.length > 2048) return false;
  let url: URL;
  try { url = new URL(raw); } catch { return false; }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (url.port && url.port !== "443") return false;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || PRIVATE_HOST.test(host)) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[") || host.includes(":")) return false;
  if (/(^|\.)supabase\.(co|in)$/.test(host)) return false;
  return true;
}
