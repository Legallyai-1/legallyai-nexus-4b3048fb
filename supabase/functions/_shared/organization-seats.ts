// Seat limits for firm organizations. The limit comes from the organization OWNER's live plan
// (Solo 1, Firm 3, Enterprise 10, plus purchased extra seats); staff use the owner's seats.
// Seats in use = the owner + active non-client members + pending, unexpired non-client invites.
// Client-portal users never take a seat.
import { resolveSubscriptionAccess } from "./subscription-access.ts";
import { planNameFor, seatLimitFor, type PlanName } from "./plan-catalog.ts";

// deno-lint-ignore no-explicit-any
type Db = any;

export const PRICING_URL = "https://www.legallyai.ai/pricing";

export type OrganizationSeats = {
  /** Owner's plan name, e.g. "Firm". */
  planName: PlanName;
  /** Total seats on the owner's plan (owner included), or null when the plan has no seat allowance. */
  limit: number | null;
  /** Owner + active staff members. */
  members: number;
  /** Pending, unexpired staff invites. */
  pendingInvites: number;
  used: number;
};

/** The owner's live plan: name and seat limit. A lapsed or missing plan is "Free" with no seat allowance. */
export async function ownerPlan(db: Db, ownerId: string): Promise<{ planName: PlanName; limit: number | null }> {
  const [{ data: subscription, error: subError }, { data: payments, error: payError }] = await Promise.all([
    db.from("subscriptions").select("status, tier, stripe_price_id, metadata, current_period_end, cancel_at_period_end")
      .eq("user_id", ownerId).maybeSingle(),
    db.from("payment_records").select("tier, expires_at, status, metadata, verified_at").eq("user_id", ownerId)
      .order("verified_at", { ascending: false }),
  ]);
  if (subError || payError) throw new Error("Could not load the firm's plan");
  const access = resolveSubscriptionAccess("free", subscription ?? null, payments ?? []);
  if (access.activeSubscription) {
    return {
      planName: planNameFor(subscription?.stripe_price_id, subscription?.tier),
      limit: seatLimitFor(subscription?.stripe_price_id, subscription?.tier, subscription?.metadata),
    };
  }
  if (access.activePayment) {
    const record = access.activePaymentRecord;
    return { planName: planNameFor(null, record?.tier), limit: seatLimitFor(null, record?.tier, record?.metadata) };
  }
  return { planName: "Free", limit: null };
}

export async function getOrganizationSeats(
  db: Db,
  organizationId: string,
  options: { countPendingInvites?: boolean } = {},
): Promise<OrganizationSeats> {
  const countPending = options.countPendingInvites !== false;
  const { data: org, error: orgError } = await db.from("organizations").select("owner_id").eq("id", organizationId).maybeSingle();
  if (orgError || !org) throw new Error("Organization not found");
  const ownerId: string | null = org.owner_id ?? null;

  const [membersRes, rolesRes, invitesRes] = await Promise.all([
    db.from("organization_members").select("user_id, is_active").eq("organization_id", organizationId).limit(1000),
    db.from("user_roles").select("user_id, role").eq("organization_id", organizationId).limit(2000),
    countPending
      ? db.from("organization_invites").select("id, role").eq("organization_id", organizationId)
        .is("accepted_at", null).gt("expires_at", new Date().toISOString()).limit(500)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (membersRes.error || rolesRes.error || invitesRes.error) throw new Error("Could not count the firm's seats");

  const roles = new Map<string, string[]>();
  for (const r of (rolesRes.data ?? []) as { user_id: string; role: string }[]) {
    roles.set(r.user_id, [...(roles.get(r.user_id) ?? []), r.role]);
  }
  const isClientOnly = (userId: string) => {
    const list = roles.get(userId) ?? [];
    return list.length > 0 && list.every((role) => role === "client");
  };
  const staff = new Set<string>();
  if (ownerId) staff.add(ownerId);
  for (const m of (membersRes.data ?? []) as { user_id: string; is_active: boolean | null }[]) {
    if (m.is_active === true && !isClientOnly(m.user_id)) staff.add(m.user_id);
  }
  const pendingInvites = ((invitesRes.data ?? []) as { role: string }[]).filter((i) => i.role !== "client").length;
  const plan = ownerId ? await ownerPlan(db, ownerId) : { planName: "Free" as PlanName, limit: null };
  return { planName: plan.planName, limit: plan.limit, members: staff.size, pendingInvites, used: staff.size + pendingInvites };
}

/** True when one more staff seat fits. Plans without a seat allowance are not seat-limited here. */
export function hasFreeSeat(seats: Pick<OrganizationSeats, "limit" | "used">): boolean {
  return seats.limit === null || seats.used < seats.limit;
}

export function seatLimitMessage(seats: Pick<OrganizationSeats, "planName" | "limit">): string {
  const n = seats.limit ?? 0;
  if (seats.planName === "Solo") {
    return `Your Solo plan includes 1 seat, for you. Upgrade to Firm or Enterprise on the pricing page (${PRICING_URL}) to add staff.`;
  }
  return `Your ${seats.planName} plan includes ${n} seat${n === 1 ? "" : "s"} and all of them are in use (pending invites count). ` +
    `Add seats on the pricing page (${PRICING_URL}) or remove someone first.`;
}
