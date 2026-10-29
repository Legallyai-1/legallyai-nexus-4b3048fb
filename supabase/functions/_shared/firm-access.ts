// Firm-tier (Business Hub) access. Only a live Stripe-backed plan counts: an active/trialing/past_due
// subscription or a verified, unexpired payment record on the Firm ("pro") or Enterprise tier.
// profiles.subscription_tier alone never grants access (users can't be trusted to keep it accurate).
import { resolveSubscriptionAccess, type PaymentRecordCandidate, type SubscriptionCandidate } from "./subscription-access.ts";

export const FIRM_TIERS: ReadonlySet<string> = new Set(["pro", "enterprise"]);

// deno-lint-ignore no-explicit-any
type Db = any;

export type FirmAccessSource = "own_plan" | "organization_owner_plan" | null;

export function planGrantsFirmAccess(
  subscription: SubscriptionCandidate,
  paymentRecords: PaymentRecordCandidate[] | null | undefined,
): boolean {
  const access = resolveSubscriptionAccess("free", subscription, paymentRecords);
  if (access.activeSubscription) return FIRM_TIERS.has(subscription?.tier ?? "");
  if (access.activePayment) return FIRM_TIERS.has(access.activePaymentRecord?.tier ?? "");
  return false;
}

async function userHasFirmPlan(db: Db, userId: string): Promise<boolean> {
  const [{ data: subscription, error: subError }, { data: payments, error: payError }] = await Promise.all([
    db.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", userId).maybeSingle(),
    db.from("payment_records").select("tier, expires_at, status, metadata, verified_at").eq("user_id", userId)
      .order("verified_at", { ascending: false }),
  ]);
  if (subError || payError) return false;
  return planGrantsFirmAccess(subscription ?? null, payments ?? []);
}

const MAX_ORGS_CHECKED = 10;

/**
 * True when the user has their own Firm/Enterprise plan, or is an ACTIVE member of an organization
 * whose owner has one (so invited staff get the hub their firm pays for). Fails closed on errors.
 */
export async function resolveFirmAccess(
  db: Db,
  userId: string,
  ownPlan: { subscription: SubscriptionCandidate; paymentRecords: PaymentRecordCandidate[] | null | undefined },
): Promise<{ firmAccess: boolean; source: FirmAccessSource }> {
  if (planGrantsFirmAccess(ownPlan.subscription, ownPlan.paymentRecords)) {
    return { firmAccess: true, source: "own_plan" };
  }

  const { data: memberships, error: memberError } = await db
    .from("organization_members")
    .select("organization_id, is_active")
    .eq("user_id", userId);
  if (memberError || !Array.isArray(memberships)) return { firmAccess: false, source: null };

  const orgIds = [...new Set(
    memberships.filter((m: { is_active: boolean | null }) => m.is_active === true)
      .map((m: { organization_id: string }) => m.organization_id),
  )].slice(0, MAX_ORGS_CHECKED);
  if (!orgIds.length) return { firmAccess: false, source: null };

  const { data: orgs, error: orgError } = await db.from("organizations").select("id, owner_id").in("id", orgIds);
  if (orgError || !Array.isArray(orgs)) return { firmAccess: false, source: null };

  const ownerIds = [...new Set(
    orgs.map((o: { owner_id: string | null }) => o.owner_id).filter((id: string | null): id is string => Boolean(id) && id !== userId),
  )];
  for (const ownerId of ownerIds) {
    if (await userHasFirmPlan(db, ownerId as string)) return { firmAccess: true, source: "organization_owner_plan" };
  }
  return { firmAccess: false, source: null };
}
