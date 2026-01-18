import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DB-ANALYTICS] ${step}${detailsStr}`);
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
    logStep("Function started - Database-only analytics (NO Stripe)");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get date range for analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch active subscriptions from database
    const { data: subscriptions, error: subsError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'active');

    if (subsError) throw subsError;
    logStep("Fetched subscriptions", { count: subscriptions?.length || 0 });

    // Fetch recent payments from database
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('user_payments')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('status', 'completed');

    if (paymentsError) throw paymentsError;
    logStep("Fetched payments", { count: payments?.length || 0 });

    // Fetch ad impressions for revenue calculation
    const { data: adImpressions, error: adError } = await supabaseClient
      .from('ad_impressions')
      .select('*')
      .gte('impression_time', thirtyDaysAgo.toISOString());

    if (adError) throw adError;
    logStep("Fetched ad impressions", { count: adImpressions?.length || 0 });

    // Calculate metrics from database
    const totalRevenue = (payments || [])
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    const subscriptionRevenue = (payments || [])
      .filter(p => p.transaction_type === 'subscription')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    const documentRevenue = (payments || [])
      .filter(p => p.transaction_type === 'document')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    const adRevenue = (adImpressions || [])
      .reduce((sum, ad) => sum + (ad.revenue_cents || 0), 0) / 100;

    // Calculate revenue by stream
    const revenueStreams = [
      { 
        name: "Subscriptions", 
        amount: subscriptionRevenue, 
        percentage: totalRevenue > 0 ? subscriptionRevenue / totalRevenue * 100 : 0 
      },
      { 
        name: "Document Purchases", 
        amount: documentRevenue, 
        percentage: totalRevenue > 0 ? documentRevenue / totalRevenue * 100 : 0 
      },
      { 
        name: "Ad Revenue", 
        amount: adRevenue, 
        percentage: totalRevenue > 0 ? adRevenue / totalRevenue * 100 : 0 
      },
    ];

    // Recent transactions from database
    const recentTransactions = (payments || []).slice(0, 10).map(payment => ({
      id: payment.id,
      type: payment.transaction_type || "unknown",
      user: payment.user_id,
      amount: parseFloat(payment.amount || '0'),
      time: new Date(payment.created_at).toLocaleDateString(),
      status: payment.status || "unknown"
    }));

    const analytics = {
      totalRevenue: totalRevenue + adRevenue,
      subscriptions: (subscriptions || []).length,
      documentsThisMonth: (payments || []).filter(p => p.transaction_type === 'document').length,
      revenueStreams,
      recentTransactions,
      adImpressions: (adImpressions || []).length,
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
