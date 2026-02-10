import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { createHmac } from "https://deno.land/std@0.190.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paypost-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPOST-WEBHOOK] ${step}${detailsStr}`);
};

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  const computedSignature = `sha256=${hmac.digest("hex")}`;
  return computedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Get webhook secret
    const webhookSecret = Deno.env.get("PAYPOST_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    // Verify webhook signature
    const signature = req.headers.get("x-paypost-signature") || req.headers.get("x-gp-signature");
    const rawBody = await req.text();
    
    if (signature && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logStep("Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const event = JSON.parse(rawBody);
    logStep("Event parsed", { type: event.type, id: event.id });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(supabaseAdmin, event);
        break;
      
      case "payment.failed":
        await handlePaymentFailed(supabaseAdmin, event);
        break;
      
      case "subscription.created":
        await handleSubscriptionCreated(supabaseAdmin, event);
        break;
      
      case "subscription.updated":
        await handleSubscriptionUpdated(supabaseAdmin, event);
        break;
      
      case "subscription.canceled":
        await handleSubscriptionCanceled(supabaseAdmin, event);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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

async function handlePaymentSucceeded(supabase: any, event: any) {
  logStep("Handling payment.succeeded", { paymentId: event.data.id });

  const payment = event.data;
  const userId = payment.metadata?.user_id;

  if (!userId) {
    logStep("No user_id in metadata");
    return;
  }

  // Update payment transaction status
  const { error: updateError } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
      metadata: payment,
    })
    .eq('provider_transaction_id', payment.id);

  if (updateError) {
    logStep("Error updating payment transaction", { error: updateError.message });
  }

  // If one-time payment, grant access to the feature
  if (payment.metadata?.tier) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: payment.metadata.tier,
        subscription_status: 'active',
      })
      .eq('id', userId);

    if (profileError) {
      logStep("Error updating profile", { error: profileError.message });
    }
  }

  logStep("Payment succeeded processed successfully");
}

async function handlePaymentFailed(supabase: any, event: any) {
  logStep("Handling payment.failed", { paymentId: event.data.id });

  const payment = event.data;

  // Update payment transaction status
  const { error } = await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
      metadata: payment,
    })
    .eq('provider_transaction_id', payment.id);

  if (error) {
    logStep("Error updating payment transaction", { error: error.message });
  }

  logStep("Payment failed processed successfully");
}

async function handleSubscriptionCreated(supabase: any, event: any) {
  logStep("Handling subscription.created", { subscriptionId: event.data.id });

  const subscription = event.data;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    logStep("No user_id in metadata");
    return;
  }

  // Create subscription record
  const { error: insertError } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      provider: 'paypost',
      provider_subscription_id: subscription.id,
      tier: subscription.metadata?.tier || 'premium',
      status: 'active',
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      metadata: subscription,
    });

  if (insertError) {
    logStep("Error creating subscription", { error: insertError.message });
    return;
  }

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_tier: subscription.metadata?.tier || 'premium',
      subscription_status: 'active',
    })
    .eq('id', userId);

  if (profileError) {
    logStep("Error updating profile", { error: profileError.message });
  }

  logStep("Subscription created processed successfully");
}

async function handleSubscriptionUpdated(supabase: any, event: any) {
  logStep("Handling subscription.updated", { subscriptionId: event.data.id });

  const subscription = event.data;

  // Update subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      metadata: subscription,
      updated_at: new Date().toISOString(),
    })
    .eq('provider_subscription_id', subscription.id);

  if (error) {
    logStep("Error updating subscription", { error: error.message });
  }

  logStep("Subscription updated processed successfully");
}

async function handleSubscriptionCanceled(supabase: any, event: any) {
  logStep("Handling subscription.canceled", { subscriptionId: event.data.id });

  const subscription = event.data;

  // Update subscription record
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('provider_subscription_id', subscription.id);

  if (subError) {
    logStep("Error updating subscription", { error: subError.message });
  }

  // Get user_id from subscription
  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single();

  if (subData) {
    // Downgrade user to free tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
      })
      .eq('id', subData.user_id);

    if (profileError) {
      logStep("Error updating profile", { error: profileError.message });
    }
  }

  logStep("Subscription canceled processed successfully");
}
