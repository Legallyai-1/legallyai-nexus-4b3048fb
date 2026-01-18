import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    // Create Supabase client for auth and database access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
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
    const userEmail = userData.user.email;
    logStep("User authenticated", { userId, email: userEmail });

    // If Stripe is not configured, check Supabase payment records only
    if (!stripeKey) {
      logStep("Stripe not configured, checking Supabase payment records");
      
      const { data: subscription, error: subError } = await supabaseClient
        .rpc('check_user_subscription', { check_user_id: userId })
        .single();
      
      if (subError) {
        logStep("Error checking subscription", { error: subError.message });
        // Default to free tier if error
        return new Response(JSON.stringify({ 
          hasPaid: false,
          tier: 'free',
          payment_method: 'none',
          message: "Error checking subscription status"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      logStep("Subscription checked (Supabase only)", subscription);
      
      return new Response(JSON.stringify({ 
        hasPaid: subscription?.tier !== 'free' && subscription?.is_active,
        tier: subscription?.tier || 'free',
        payment_method: subscription?.payment_method || 'none',
        isActive: subscription?.is_active || false,
        expiresAt: subscription?.expires_at
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Stripe is configured - check both Stripe and Supabase records
    logStep("Stripe configured, checking both Stripe and Supabase");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    let hasStripePayment = false;
    let hasActiveSubscription = false;
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found customer", { customerId });

      // Check for successful payments (one-time purchases)
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      const successfulPayments = paymentIntents.data.filter(
        (pi: { status: string }) => pi.status === "succeeded"
      );

      // Also check for active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      hasActiveSubscription = subscriptions.data.length > 0;
      hasStripePayment = successfulPayments.length > 0;

      logStep("Stripe payment status", { 
        hasSuccessfulPayment: hasStripePayment, 
        hasActiveSubscription,
        paymentCount: successfulPayments.length 
      });
    } else {
      logStep("No Stripe customer found");
    }

    // Also check Supabase payment records
    const { data: subscription } = await supabaseClient
      .rpc('check_user_subscription', { check_user_id: userId })
      .single();
    
    const hasSupabaseSubscription = subscription?.tier !== 'free' && subscription?.is_active;
    
    logStep("Combined payment status", { 
      hasStripePayment, 
      hasActiveSubscription,
      hasSupabaseSubscription,
      tier: subscription?.tier
    });

    return new Response(JSON.stringify({ 
      hasPaid: hasStripePayment || hasActiveSubscription || hasSupabaseSubscription,
      hasActiveSubscription,
      tier: subscription?.tier || 'free',
      payment_method: hasStripePayment || hasActiveSubscription ? 'stripe' : subscription?.payment_method,
      isActive: hasActiveSubscription || hasSupabaseSubscription
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
