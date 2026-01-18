import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user authentication
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
    const { tier, amount, payment_method = 'demo' } = await req.json();

    if (!tier || !amount) {
      return new Response(JSON.stringify({ error: "Tier and amount are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log(`Processing payment for user ${userId}: ${tier} tier, $${amount}`);

    // Calculate expiration based on tier
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('user_payments')
      .insert({
        user_id: userId,
        amount: parseFloat(amount),
        payment_method,
        status: 'completed',
        transaction_type: 'subscription',
        tier,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return new Response(JSON.stringify({ error: "Failed to create payment record" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Update or create subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        tier,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (subError) {
      console.error("Error updating subscription:", subError);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Add bonus credits for premium/pro tiers
    let bonusCredits = 0;
    if (tier === 'premium') bonusCredits = 100;
    if (tier === 'pro') bonusCredits = 500;
    if (tier === 'enterprise') bonusCredits = 2000;

    if (bonusCredits > 0) {
      const { error: creditsError } = await supabaseClient
        .rpc('add_user_credits', { uid: userId, amount: bonusCredits });
      
      if (creditsError) {
        console.error("Error adding credits:", creditsError);
      }
    }

    // Create transaction history entry
    await supabaseClient
      .from('transaction_history')
      .insert({
        user_id: userId,
        type: 'subscription_purchase',
        amount: parseFloat(amount),
        credits_change: bonusCredits,
        description: `Upgraded to ${tier} tier`,
        metadata: { tier, payment_method },
      });

    console.log(`Payment processed successfully for user ${userId}`);

    return new Response(JSON.stringify({ 
      success: true,
      payment,
      subscription,
      credits_added: bonusCredits,
      message: `Successfully upgraded to ${tier} tier!`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in process-payment:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
