import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaypostCheckoutRequest {
  amount: number;
  currency?: string;
  mode: 'payment' | 'subscription';
  tier?: 'premium' | 'pro';
  success_url?: string;
  cancel_url?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPOST-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get Paypost credentials from environment
    const merchantId = Deno.env.get("PAYPOST_MERCHANT_ID");
    const apiKey = Deno.env.get("PAYPOST_API_KEY");
    const apiSecret = Deno.env.get("PAYPOST_API_SECRET");
    const environment = Deno.env.get("PAYPOST_ENVIRONMENT") || "sandbox";

    if (!merchantId || !apiKey || !apiSecret) {
      throw new Error("Paypost credentials not configured");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify authentication
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
    
    if (userError || !userData.user?.email) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const user = userData.user;
    logStep("User authenticated", { email: user.email, id: user.id });

    // Parse request body
    const body: PaypostCheckoutRequest = await req.json();
    const {
      amount,
      currency = "USD",
      mode,
      tier,
      success_url,
      cancel_url
    } = body;

    // Validate request
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!['payment', 'subscription'].includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Request validated", { amount, currency, mode, tier });

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://legallyai.ai";
    const finalSuccessUrl = success_url || `${origin}/payment-success`;
    const finalCancelUrl = cancel_url || `${origin}/pricing`;

    // Determine Paypost API endpoint based on environment
    const apiBaseUrl = environment === "production"
      ? "https://api.globalpayments.com"
      : "https://api-sandbox.globalpayments.com";

    // Create payment session with Paypost
    // Note: This is a simplified implementation. Actual Paypost API may differ.
    // Refer to Global Payments documentation for exact API structure.
    
    const paypostPayload = {
      merchant_id: merchantId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      payment_method: "paypost",
      mode: mode,
      customer: {
        email: user.email,
        user_id: user.id,
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        tier: tier,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }
    };

    logStep("Creating Paypost session", { payload: paypostPayload });

    // Make request to Paypost API
    const authString = btoa(`${apiKey}:${apiSecret}`);
    const paypostResponse = await fetch(`${apiBaseUrl}/v1/payment-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(paypostPayload),
    });

    if (!paypostResponse.ok) {
      const errorText = await paypostResponse.text();
      logStep("Paypost API error", { status: paypostResponse.status, error: errorText });
      throw new Error(`Paypost API error: ${errorText}`);
    }

    const paypostSession = await paypostResponse.json();
    logStep("Paypost session created", { sessionId: paypostSession.id });

    // Store payment intent in database for tracking
    const { error: dbError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        provider: 'paypost',
        provider_transaction_id: paypostSession.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_type: mode === 'subscription' ? 'subscription' : 'one_time',
        metadata: {
          tier: tier,
          session_id: paypostSession.id,
        }
      });

    if (dbError) {
      logStep("Database error", { error: dbError.message });
      // Continue anyway - we can reconcile later via webhook
    }

    // Return checkout URL to frontend
    return new Response(JSON.stringify({
      session_id: paypostSession.id,
      checkout_url: paypostSession.hosted_payment_page_url || paypostSession.url,
      status: "created"
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
