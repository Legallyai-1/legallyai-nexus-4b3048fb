import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getAnthropicKey } from "./anthropic-key.ts";
import { resolveSubscriptionAccess } from "./subscription-access.ts";

interface PaidAIAccessOptions {
  userId: string;
  authorization: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  anonKey: string;
  cost?: number;
  reason: string;
}

export async function consumePaidAIQuota({
  userId,
  authorization,
  supabaseUrl,
  serviceRoleKey,
  anonKey,
  cost = 1,
  reason,
}: PaidAIAccessOptions): Promise<boolean> {
  if (Deno.env.get("ENABLE_PAID_AI") !== "true" || !getAnthropicKey()) return false;

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const [
    { data: profile, error: profileError },
    { data: subscription, error: subscriptionError },
    { data: paymentRecords, error: paymentError },
  ] = await Promise.all([
    adminClient.from("profiles").select("credits, subscription_tier").eq("id", userId).maybeSingle(),
    adminClient.from("subscriptions").select("status, tier, current_period_end, cancel_at_period_end").eq("user_id", userId).maybeSingle(),
    adminClient.from("payment_records").select("tier, payment_method, expires_at, status, metadata").eq("user_id", userId),
  ]);

  if (profileError || subscriptionError || paymentError || !profile) return false;

  const access = resolveSubscriptionAccess(profile.subscription_tier || "free", subscription, paymentRecords);
  if (access.entitled && access.plan !== "document") return true;
  if (Number(profile.credits ?? 0) < cost) return false;

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: deduction, error: deductionError } = await userClient.rpc("deduct_ai_credits", {
    p_user_id: userId,
    p_cost: cost,
    p_reason: reason,
  });
  const result = Array.isArray(deduction) ? deduction[0] : deduction;
  return !deductionError && result?.success === true;
}
