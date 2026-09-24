import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAID_TIERS = new Set(["premium", "pro", "enterprise", "document"]);
const ACTIVE_PAYMENT_STATUSES = new Set(["paid", "succeeded"]);

function getDocumentEntitlementCount(metadata: Record<string, unknown> | null | undefined) {
  const rawValue = metadata && typeof metadata === "object" ? metadata.documents_remaining : null;
  if (typeof rawValue === "number") {
    return rawValue;
  }

  if (typeof rawValue === "string") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isActivePaymentRecord(paymentRecord: {
  tier: string | null;
  expires_at: string | null;
  status: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  if (!paymentRecord.status || !ACTIVE_PAYMENT_STATUSES.has(paymentRecord.status)) {
    return false;
  }

  if (paymentRecord.tier === "document") {
    return (getDocumentEntitlementCount(paymentRecord.metadata) ?? 1) > 0;
  }

  return !paymentRecord.expires_at || new Date(paymentRecord.expires_at) > new Date();
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    const [
      { data: profile, error: profileError },
      { data: subscription, error: subscriptionError },
      { data: paymentRecords, error: paymentError },
    ] = await Promise.all([
      supabaseClient
        .from("profiles")
        .select("subscription_tier")
        .eq("id", userId)
        .maybeSingle(),
      supabaseClient
        .from("subscriptions")
        .select("status, tier, current_period_end, cancel_at_period_end")
        .eq("user_id", userId)
        .maybeSingle(),
      supabaseClient
        .from("payment_records")
        .select("tier, payment_method, expires_at, status, metadata, verified_at")
        .eq("user_id", userId)
        .order("verified_at", { ascending: false })
        .limit(10),
    ]);

    if (profileError) throw profileError;
    if (subscriptionError) throw subscriptionError;
    if (paymentError) throw paymentError;

    const profileTier = profile?.subscription_tier || "free";
    const subscriptionTier = subscription?.tier || null;
    const activePaymentRecord = paymentRecords?.find(isActivePaymentRecord) || null;
    const paymentTier = activePaymentRecord?.tier || null;
    const hasActiveSubscription = subscription
      ? ["active", "trialing", "past_due"].includes(subscription.status)
      : false;
    const hasActivePayment = Boolean(activePaymentRecord);
    const profileFallback = profileTier !== "document" && PAID_TIERS.has(profileTier) && !subscription && !activePaymentRecord;
    const tier = hasActiveSubscription
      ? subscriptionTier || profileTier
      : hasActivePayment
        ? paymentTier || profileTier
        : profileTier;
    const hasPaid = (hasActiveSubscription && PAID_TIERS.has(tier)) ||
      (hasActivePayment && PAID_TIERS.has(tier)) ||
      profileFallback;
    const paymentMethod = hasActiveSubscription
      ? "stripe"
      : hasActivePayment
        ? activePaymentRecord?.payment_method || "stripe"
        : "none";

    if (hasPaid && tier !== profileTier) {
      const { error: syncError } = await supabaseClient
        .from("profiles")
        .update({
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (syncError) {
        logStep("Profile sync failed", { userId, error: syncError.message });
      }
    }

    return new Response(JSON.stringify({
      hasPaid,
      hasActiveSubscription,
      tier,
      payment_method: paymentMethod,
      isActive: hasActiveSubscription || hasActivePayment,
      current_period_end: subscription?.current_period_end || activePaymentRecord?.expires_at || null,
      cancel_at_period_end: subscription?.cancel_at_period_end || false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
