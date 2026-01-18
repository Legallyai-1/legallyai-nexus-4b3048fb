import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Invalid user");

    const { tier, amount } = await req.json();
    
    // Create payment record
    await supabase.from("user_payments").insert({
      user_id: user.id,
      amount,
      status: "completed",
      transaction_type: "subscription",
      tier,
      payment_method: "demo"
    });

    // Update subscription
    await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      tier,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Add credits
    const creditsToAdd = tier === 'premium' ? 100 : tier === 'pro' ? 500 : 0;
    if (creditsToAdd > 0) {
      await supabase.rpc('add_user_credits', { uid: user.id, amount: creditsToAdd });
    }

    return new Response(JSON.stringify({ success: true, tier }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
