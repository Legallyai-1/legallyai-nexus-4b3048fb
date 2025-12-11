import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PERCENT = 1; // 1% of all profits go to platform owner

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PLATFORM-FEE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'owner'])
      .maybeSingle();

    if (!roleData) throw new Error("Admin access required");
    logStep("Admin verified", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { action, loanId, amount, transactionType } = await req.json();

    if (action === "process_fee") {
      // Calculate platform fee (1% of transaction amount)
      const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
      logStep("Calculated platform fee", { amount, platformFee, percent: PLATFORM_FEE_PERCENT });

      // Create a transfer to the platform's connected Stripe account
      // Note: This requires Stripe Connect setup for production
      // For now, we record the fee in our database for manual processing
      
      // Record the transaction
      const { data: transaction, error: txError } = await supabaseClient
        .from('loan_transactions')
        .insert({
          loan_id: loanId,
          transaction_type: transactionType || 'loan_disbursement',
          amount: amount,
          platform_fee: platformFee,
          status: 'completed'
        })
        .select()
        .single();

      if (txError) throw new Error(`Failed to record transaction: ${txError.message}`);

      // Update loan with platform fee
      await supabaseClient
        .from('loans')
        .update({ platform_fee: platformFee })
        .eq('id', loanId);

      logStep("Transaction recorded", { transactionId: transaction.id, platformFee });

      return new Response(JSON.stringify({
        success: true,
        transaction: transaction,
        platformFee: platformFee,
        message: `1% platform fee of $${platformFee.toFixed(2)} recorded`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "get_stats") {
      // Get total platform fees collected
      const { data: stats, error: statsError } = await supabaseClient
        .from('loan_transactions')
        .select('platform_fee, amount, status')
        .eq('status', 'completed');

      if (statsError) throw new Error(`Failed to fetch stats: ${statsError.message}`);

      const totalFees = stats?.reduce((sum, t) => sum + (t.platform_fee || 0), 0) || 0;
      const totalVolume = stats?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const transactionCount = stats?.length || 0;

      logStep("Stats fetched", { totalFees, totalVolume, transactionCount });

      return new Response(JSON.stringify({
        totalPlatformFees: totalFees,
        totalTransactionVolume: totalVolume,
        transactionCount: transactionCount,
        feePercentage: PLATFORM_FEE_PERCENT
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (action === "withdraw_fees") {
      // Get total pending fees to withdraw
      const { data: pendingFees } = await supabaseClient
        .from('loan_transactions')
        .select('platform_fee')
        .eq('status', 'completed');

      const totalToWithdraw = pendingFees?.reduce((sum, t) => sum + (t.platform_fee || 0), 0) || 0;

      if (totalToWithdraw < 1) {
        return new Response(JSON.stringify({
          success: false,
          message: "Minimum withdrawal is $1.00"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Create payout to platform owner's bank account
      // Note: This requires the platform owner to have a Stripe account with bank connected
      try {
        const payout = await stripe.payouts.create({
          amount: Math.round(totalToWithdraw * 100), // Convert to cents
          currency: 'usd',
          description: `LegallyAI Platform Fees - ${new Date().toISOString().split('T')[0]}`
        });

        logStep("Payout created", { payoutId: payout.id, amount: totalToWithdraw });

        return new Response(JSON.stringify({
          success: true,
          payoutId: payout.id,
          amount: totalToWithdraw,
          message: `Payout of $${totalToWithdraw.toFixed(2)} initiated to your bank account`
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } catch (payoutError: any) {
        // If payout fails (no bank connected), return instructions
        return new Response(JSON.stringify({
          success: false,
          totalFees: totalToWithdraw,
          message: "To receive payouts, connect a bank account in your Stripe Dashboard",
          stripeError: payoutError.message
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
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
