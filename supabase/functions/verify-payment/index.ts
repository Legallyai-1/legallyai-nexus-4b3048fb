import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Query user_payments table for successful payments
    const { data: payments, error: paymentsError } = await supabaseClient
      .from("user_payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (paymentsError) {
      logStep("Error querying payments", { error: paymentsError.message });
    }

    const hasSuccessfulPayment = payments && payments.length > 0;
    const paymentCount = payments?.length || 0;

    // Check for active subscription
    const { data: subscription } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    const hasActiveSubscription = subscription !== null;

    logStep("Payment status checked", { 
      hasSuccessfulPayment, 
      hasActiveSubscription,
      paymentCount 
    });

    return new Response(JSON.stringify({ 
      hasPaid: hasSuccessfulPayment || hasActiveSubscription,
      hasActiveSubscription,
      paymentCount
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
