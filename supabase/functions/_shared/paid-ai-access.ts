import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getAnthropicKey } from "./anthropic-key.ts";
import { freePaidAIDailyLimit, type PaidAIQuotaResult, reservePaidAIQuota } from "./paid-ai-quota.ts";

interface PaidAIAccessOptions {
  userId: string;
  authorization: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  cost?: number;
  reason: string;
}

// LEG-19: one quota reservation per request. hasPaidAIQuota reserves (atomically, server-side) and
// consumePaidAIQuota confirms that same reservation, so a request is never counted twice.
const reservations = new WeakMap<PaidAIAccessOptions, PaidAIQuotaResult>();

function switchesOn({ userId, authorization, supabaseUrl, serviceRoleKey, anonKey, cost = 1 }: PaidAIAccessOptions) {
  return Deno.env.get("ENABLE_PAID_AI") === "true"
    && !!getAnthropicKey()
    && !!userId
    && authorization.startsWith("Bearer ")
    && !!supabaseUrl
    && !!serviceRoleKey
    && !!anonKey
    && Number.isSafeInteger(cost)
    && cost > 0;
}

async function reserve(options: PaidAIAccessOptions): Promise<PaidAIQuotaResult> {
  if (!switchesOn(options)) return { status: "unavailable" };
  const admin = createClient(options.supabaseUrl, options.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return await reservePaidAIQuota({
    admin,
    userId: options.userId,
    cost: options.cost ?? 1,
    limit: freePaidAIDailyLimit(Deno.env),
  });
}

const granted = (r: PaidAIQuotaResult | undefined) => r?.status === "subscriber" || r?.status === "free_allowed";

/** Checks plan server-side and reserves today's free-tier quota (subscribers are unlimited). */
export async function hasPaidAIQuota(options: PaidAIAccessOptions): Promise<boolean> {
  const result = await reserve(options);
  reservations.set(options, result);
  if (result.status === "quota_exceeded") {
    console.warn("paid AI daily quota reached", { reason: options.reason, used: result.used, limit: result.limit });
  }
  return granted(result);
}

/** Confirms the reservation made by hasPaidAIQuota for the same options object (reserves if none). */
export async function consumePaidAIQuota(options: PaidAIAccessOptions): Promise<boolean> {
  if (!switchesOn(options)) return false;
  const existing = reservations.get(options);
  if (existing) return granted(existing);
  return await hasPaidAIQuota(options);
}

/** The last quota decision for these options, so callers can return 429 with a clear message. */
export function paidAIQuotaResult(options: PaidAIAccessOptions): PaidAIQuotaResult | undefined {
  return reservations.get(options);
}
