import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - Database-only mode (NO Stripe)");

    const { priceId, mode } = await req.json();
    logStep("Request params", { priceId, mode });

    // Map old Stripe price IDs to tiers and amounts
    const PRICE_MAP: Record<string, { tier: string; amount: number }> = {
      'price_1Sdfqp0QhWGUtGKvcQuWONuB': { tier: 'premium', amount: 9.99 },
      'price_1SckV70QhWGUtGKvvg1tH7lu': { tier: 'pro', amount: 99 },
      'price_1SckVt0QhWGUtGKvl9YdmQqk': { tier: 'premium', amount: 5 }
    };

    const pricing = PRICE_MAP[priceId];
    if (!pricing) {
      logStep("Invalid price ID", { priceId });
      return new Response(
        JSON.stringify({ error: 'Invalid price ID' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Return success - frontend will handle the payment processing
    logStep("Checkout simulated", { tier: pricing.tier, amount: pricing.amount });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Ready to upgrade to ${pricing.tier}`,
        tier: pricing.tier,
        amount: pricing.amount,
        // No URL needed - frontend will call process-payment directly
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
