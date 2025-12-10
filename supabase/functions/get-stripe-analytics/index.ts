import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-ANALYTICS] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get date range for analytics
    const now = new Date();
    const thirtyDaysAgo = Math.floor((now.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000);

    // Fetch active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });
    logStep("Fetched subscriptions", { count: subscriptions.data.length });

    // Fetch recent payments
    const payments = await stripe.paymentIntents.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });
    logStep("Fetched payments", { count: payments.data.length });

    // Fetch recent charges for revenue calculation
    const charges = await stripe.charges.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });
    logStep("Fetched charges", { count: charges.data.length });

    // Calculate metrics
    const totalRevenue = charges.data
      .filter(c => c.paid && !c.refunded)
      .reduce((sum, c) => sum + c.amount, 0) / 100;

    const subscriptionRevenue = subscriptions.data.length * 99; // $99/month per sub
    const documentRevenue = totalRevenue - subscriptionRevenue;

    // Calculate revenue by stream
    const revenueStreams = [
      { name: "Lawyer Pro Subscriptions", amount: subscriptionRevenue, percentage: subscriptionRevenue / totalRevenue * 100 || 0 },
      { name: "Document Purchases", amount: documentRevenue > 0 ? documentRevenue : 0, percentage: documentRevenue > 0 ? documentRevenue / totalRevenue * 100 : 0 },
    ];

    // Recent transactions
    const recentTransactions = charges.data.slice(0, 10).map(charge => ({
      id: charge.id,
      type: charge.amount === 9900 ? "subscription" : "document",
      user: charge.billing_details?.name || charge.customer || "Unknown",
      amount: charge.amount / 100,
      time: new Date(charge.created * 1000).toLocaleDateString(),
      status: charge.paid ? "succeeded" : "failed"
    }));

    const analytics = {
      totalRevenue,
      subscriptions: subscriptions.data.length,
      documentsThisMonth: payments.data.filter(p => p.amount === 500).length,
      revenueStreams,
      recentTransactions,
      period: "30_days"
    };

    logStep("Analytics compiled", analytics);

    return new Response(JSON.stringify(analytics), {
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
