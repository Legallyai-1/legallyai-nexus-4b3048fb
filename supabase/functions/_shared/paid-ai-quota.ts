// LEG-19: daily paid-AI quota for signed-in users without a paid plan.
// Pure logic (no network imports) so it can be unit-tested under Node; the edge function supplies the
// service-role client. Usage is counted atomically by the existing service-role-only RPC
// public.consume_free_question on public.ai_question_usage (no RLS policies => no client access),
// using a per-user, per-UTC-day subject so the count resets daily. No schema change.
import { resolveSubscriptionAccess } from "./subscription-access.ts";

export const DEFAULT_FREE_PAID_AI_DAILY_LIMIT = 10;

export function freePaidAIDailyLimit(env: { get(name: string): string | undefined }): number {
  const value = Number(env.get("FREE_PAID_AI_DAILY_LIMIT"));
  return Number.isSafeInteger(value) && value > 0 && value <= 1000 ? value : DEFAULT_FREE_PAID_AI_DAILY_LIMIT;
}

export function paidAIQuotaSubject(userId: string, now: Date): string {
  return `paid-ai:user:${userId}:${now.toISOString().slice(0, 10)}`;
}

// deno-lint-ignore no-explicit-any
type AdminDb = any;

export type PaidAIQuotaResult =
  | { status: "subscriber" }
  | { status: "free_allowed"; used: number; limit: number }
  | { status: "quota_exceeded"; used: number; limit: number }
  | { status: "unavailable" };

/**
 * Looks up the plan server-side; subscribers are unlimited. Free users atomically reserve `cost` units
 * of today's quota. Fails closed (unavailable) on any lookup or counting error, so a DB problem never
 * grants unmetered paid AI.
 */
export async function reservePaidAIQuota(opts: {
  admin: AdminDb;
  userId: string;
  cost: number;
  limit: number;
  now?: Date;
}): Promise<PaidAIQuotaResult> {
  const { admin, userId, cost, limit } = opts;
  if (!userId || !Number.isSafeInteger(cost) || cost <= 0 || cost > limit) return { status: "unavailable" };
  try {
    const [profileRes, subscriptionRes, paymentsRes] = await Promise.all([
      admin.from("profiles").select("id, subscription_tier").eq("id", userId).maybeSingle(),
      admin.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", userId).maybeSingle(),
      admin.from("payment_records").select("tier, payment_method, expires_at, status, metadata").eq("user_id", userId),
    ]);
    if (profileRes.error || !profileRes.data || subscriptionRes.error || paymentsRes.error) return { status: "unavailable" };
    const access = resolveSubscriptionAccess(profileRes.data.subscription_tier || "free", subscriptionRes.data, paymentsRes.data);
    if (access.entitled) return { status: "subscriber" };

    const subject = paidAIQuotaSubject(userId, opts.now ?? new Date());
    let used = 0;
    for (let i = 0; i < cost; i++) {
      const { data, error } = await admin.rpc("consume_free_question", { p_subject: subject, p_limit: limit });
      if (error) return { status: "unavailable" };
      const row = Array.isArray(data) ? data[0] : data;
      used = Number(row?.used ?? limit);
      if (!row?.allowed) return { status: "quota_exceeded", used, limit };
    }
    return { status: "free_allowed", used, limit };
  } catch {
    return { status: "unavailable" };
  }
}
