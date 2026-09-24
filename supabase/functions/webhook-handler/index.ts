import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const PRICE_TIERS: Record<string, "premium" | "pro" | "document"> = {
  price_1Sdfqp0QhWGUtGKvcQuWONuB: "premium",
  price_1SckV70QhWGUtGKvvg1tH7lu: "pro",
  price_1SckVt0QhWGUtGKvl9YdmQqk: "document",
};

type SubscriptionTier = "free" | "premium" | "pro" | "enterprise" | "document";
type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
};

function normalizeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "trialing" || status === "active" || status === "past_due" || status === "canceled" || status === "unpaid") {
    return status;
  }

  return "inactive";
}

function isPaidTier(tier: string | null | undefined): tier is Exclude<SubscriptionTier, "free"> {
  return tier === "premium" || tier === "pro" || tier === "enterprise" || tier === "document";
}

function normalizeTier(tier: string | null | undefined, fallback: SubscriptionTier = "free"): SubscriptionTier {
  if (tier === "premium" || tier === "pro" || tier === "enterprise" || tier === "document" || tier === "free") {
    return tier;
  }

  return fallback;
}

function getSubscriptionItem(subscription: Stripe.Subscription) {
  return subscription.items.data[0];
}

function getSubscriptionPrice(subscription: Stripe.Subscription) {
  return getSubscriptionItem(subscription)?.price;
}

function getSubscriptionTier(subscription: Stripe.Subscription): SubscriptionTier {
  const price = getSubscriptionPrice(subscription);
  const metadataTier = price?.metadata?.tier || subscription.metadata?.tier;
  return normalizeTier(metadataTier, normalizeTier(PRICE_TIERS[price?.id || ""]));
}

async function resolveUserId(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  customerId: string | null,
  metadata: Stripe.Metadata | null | undefined,
) {
  if (metadata?.user_id) {
    return metadata.user_id;
  }

  if (!customerId) {
    return null;
  }

  const customer = await stripe.customers.retrieve(customerId);
  if ("deleted" in customer || !("email" in customer) || !customer.email) {
    return null;
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", customer.email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return profile?.id ?? null;
}

async function syncProfileTier(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  tier: SubscriptionTier,
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function upsertSubscription(
  supabaseAdmin: ReturnType<typeof createClient>,
  input: {
    userId: string;
    customerId: string | null;
    subscriptionId: string;
    status: SubscriptionStatus;
    tier: SubscriptionTier;
    priceId: string | null;
    productId: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    metadata: Record<string, unknown>;
    eventId: string;
  },
) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert({
      user_id: input.userId,
      stripe_customer_id: input.customerId,
      stripe_subscription_id: input.subscriptionId,
      status: input.status,
      tier: input.tier,
      stripe_price_id: input.priceId,
      stripe_product_id: input.productId,
      current_period_start: input.currentPeriodStart,
      current_period_end: input.currentPeriodEnd,
      cancel_at_period_end: input.cancelAtPeriodEnd,
      metadata: input.metadata,
      last_event_id: input.eventId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    throw error;
  }

  const profileTier = input.status === "active" || input.status === "trialing" || input.status === "past_due"
    ? input.tier
    : "free";
  await syncProfileTier(supabaseAdmin, input.userId, profileTier);
}

async function upsertPaymentRecord(
  supabaseAdmin: ReturnType<typeof createClient>,
  input: {
    userId: string;
    tier: SubscriptionTier;
    amount: number;
    paymentMethod: "stripe" | "manual" | "promotional";
    expiresAt: string | null;
    customerId: string | null;
    subscriptionId: string | null;
    priceId: string | null;
    productId: string | null;
    checkoutSessionId: string | null;
    invoiceId: string | null;
    chargeId: string | null;
    status: string;
    eventId: string;
    metadata: Record<string, unknown>;
  },
) {
  const payload = {
    user_id: input.userId,
    tier: input.tier,
    amount: input.amount,
    payment_method: input.paymentMethod,
    expires_at: input.expiresAt,
    metadata: input.metadata,
    stripe_customer_id: input.customerId,
    stripe_subscription_id: input.subscriptionId,
    stripe_price_id: input.priceId,
    stripe_product_id: input.productId,
    stripe_checkout_session_id: input.checkoutSessionId,
    stripe_invoice_id: input.invoiceId,
    stripe_charge_id: input.chargeId,
    status: input.status,
    last_event_id: input.eventId,
    updated_at: new Date().toISOString(),
  };

  const conflictTarget = input.invoiceId
    ? "stripe_invoice_id"
    : input.checkoutSessionId
      ? "stripe_checkout_session_id"
      : null;

  const query = supabaseAdmin.from("payment_records");
  const response = conflictTarget
    ? await query.upsert(payload, { onConflict: conflictTarget })
    : await query.insert(payload);

  if (response.error) {
    throw response.error;
  }
}

async function loadSubscriptionById(stripe: Stripe, subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

async function persistStripeSubscription(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  eventId: string,
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const userId = fallbackUserId || await resolveUserId(stripe, supabaseAdmin, customerId, subscription.metadata);
  if (!userId) {
    logStep("Skipping subscription persistence without resolvable user", { subscriptionId: subscription.id });
    return;
  }

  const item = getSubscriptionItem(subscription);
  const price = item?.price;
  const productId = typeof price?.product === "string" ? price.product : price?.product?.id || null;
  await upsertSubscription(supabaseAdmin, {
    userId,
    customerId,
    subscriptionId: subscription.id,
    status: normalizeSubscriptionStatus(subscription.status),
    tier: getSubscriptionTier(subscription),
    priceId: price?.id || subscription.metadata?.price_id || null,
    productId: productId || subscription.metadata?.product_id || null,
    currentPeriodStart: item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : null,
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    metadata: subscription.metadata,
    eventId,
  });
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
  const userId = await resolveUserId(stripe, supabaseAdmin, customerId, session.metadata);
  if (!userId) {
    logStep("Skipping checkout.session.completed without resolvable user", { sessionId: session.id });
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
    const subscription = await loadSubscriptionById(stripe, subscriptionId);
    await persistStripeSubscription(stripe, supabaseAdmin, event.id, {
      ...subscription,
      metadata: {
        ...subscription.metadata,
        checkout_session_id: session.id,
        price_id: subscription.metadata?.price_id || session.metadata?.price_id,
        product_id: subscription.metadata?.product_id || session.metadata?.product_id,
      },
    }, userId);
    return;
  }

  const tier = normalizeTier(session.metadata?.tier, "document");
  await upsertPaymentRecord(supabaseAdmin, {
    userId,
    tier,
    amount: (session.amount_total || 0) / 100,
    paymentMethod: "stripe",
    expiresAt: null,
    customerId,
    subscriptionId: null,
    priceId: session.metadata?.price_id || null,
    productId: session.metadata?.product_id || null,
    checkoutSessionId: session.id,
    invoiceId: typeof session.invoice === "string" ? session.invoice : session.invoice?.id || null,
    chargeId: null,
    status: session.payment_status || "completed",
    eventId: event.id,
    metadata: {
      checkout_session_id: session.id,
      payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
      mode: session.mode,
    },
  });

  await syncProfileTier(supabaseAdmin, userId, tier);
}

async function handleSubscriptionEvent(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const subscription = event.data.object as Stripe.Subscription;
  await persistStripeSubscription(stripe, supabaseAdmin, event.id, subscription);
}

async function handleInvoicePaid(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null;
  const userId = await resolveUserId(stripe, supabaseAdmin, customerId, invoice.metadata);
  if (!userId) {
    logStep("Skipping invoice.paid without resolvable user", { invoiceId: invoice.id });
    return;
  }

  const line = invoice.lines.data[0];
  const price = line?.pricing?.type === "price_details" ? line.pricing.price_details : null;
  const priceId = price?.price || invoice.metadata?.price_id || null;
  const productId = price?.product || invoice.metadata?.product_id || null;
  const tier = normalizeTier(invoice.metadata?.tier, normalizeTier(PRICE_TIERS[priceId || ""]));
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id || null;

  await upsertPaymentRecord(supabaseAdmin, {
    userId,
    tier,
    amount: (invoice.amount_paid || 0) / 100,
    paymentMethod: "stripe",
    expiresAt: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    customerId,
    subscriptionId,
    priceId,
    productId,
    checkoutSessionId: null,
    invoiceId: invoice.id,
    chargeId: typeof invoice.charge === "string" ? invoice.charge : invoice.charge?.id || null,
    status: "paid",
    eventId: event.id,
    metadata: {
      invoice_status: invoice.status,
      billing_reason: invoice.billing_reason,
    },
  });
}

async function handleInvoicePaymentFailed(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null;
  const userId = await resolveUserId(stripe, supabaseAdmin, customerId, invoice.metadata);
  if (!userId) {
    logStep("Skipping invoice.payment_failed without resolvable user", { invoiceId: invoice.id });
    return;
  }

  const line = invoice.lines.data[0];
  const price = line?.pricing?.type === "price_details" ? line.pricing.price_details : null;
  const priceId = price?.price || invoice.metadata?.price_id || null;
  const productId = price?.product || invoice.metadata?.product_id || null;
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription?.id || null;

  await upsertPaymentRecord(supabaseAdmin, {
    userId,
    tier: normalizeTier(invoice.metadata?.tier),
    amount: (invoice.amount_due || 0) / 100,
    paymentMethod: "stripe",
    expiresAt: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    customerId,
    subscriptionId,
    priceId,
    productId,
    checkoutSessionId: null,
    invoiceId: invoice.id,
    chargeId: typeof invoice.charge === "string" ? invoice.charge : invoice.charge?.id || null,
    status: "payment_failed",
    eventId: event.id,
    metadata: {
      invoice_status: invoice.status,
      billing_reason: invoice.billing_reason,
    },
  });

  if (subscriptionId) {
    const subscription = await loadSubscriptionById(stripe, subscriptionId);
    await persistStripeSubscription(stripe, supabaseAdmin, event.id, subscription, userId);
  }
}

async function handleChargeRefunded(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  event: Stripe.Event,
) {
  const charge = event.data.object as Stripe.Charge;
  const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id || null;
  const userId = await resolveUserId(stripe, supabaseAdmin, customerId, charge.metadata);
  if (!userId) {
    logStep("Skipping charge.refunded without resolvable user", { chargeId: charge.id });
    return;
  }

  const priceId = charge.metadata?.price_id || null;
  const productId = charge.metadata?.product_id || null;
  const tier = normalizeTier(charge.metadata?.tier, normalizeTier(PRICE_TIERS[priceId || ""]));

  const { data: existingRecord, error: loadError } = await supabaseAdmin
    .from("payment_records")
    .select("id")
    .eq("stripe_charge_id", charge.id)
    .maybeSingle();

  if (loadError) {
    throw loadError;
  }

  if (existingRecord?.id) {
    const { error } = await supabaseAdmin
      .from("payment_records")
      .update({
        amount: (charge.amount_refunded || charge.amount || 0) / 100,
        status: "refunded",
        last_event_id: event.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRecord.id);

    if (error) {
      throw error;
    }
  } else {
    await upsertPaymentRecord(supabaseAdmin, {
      userId,
      tier,
      amount: (charge.amount_refunded || charge.amount || 0) / 100,
      paymentMethod: "stripe",
      expiresAt: null,
      customerId,
      subscriptionId: null,
      priceId,
      productId,
      checkoutSessionId: null,
      invoiceId: null,
      chargeId: charge.id,
      status: "refunded",
      eventId: event.id,
      metadata: {
        refunded: true,
      },
    });
  }

  if (tier === "document") {
    await syncProfileTier(supabaseAdmin, userId, "free");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Stripe webhook is not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "Missing stripe-signature header" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Signature verification failed", { message });
    return new Response(
      JSON.stringify({ error: "Webhook verification failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }

  const { data: existingLog, error: existingLogError } = await supabaseAdmin
    .from("webhook_logs")
    .select("id, processing_status")
    .eq("source", "stripe")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existingLogError) {
    logStep("Failed to load webhook log", { eventId: event.id, error: existingLogError.message });
    return new Response(
      JSON.stringify({ error: "Webhook logging failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }

  if (existingLog?.processing_status === "processed") {
    return new Response(
      JSON.stringify({ received: true, duplicate: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }

  const subject = event.data.object as Record<string, unknown>;
  const customerId = typeof subject.customer === "string"
    ? subject.customer
    : subject.customer && typeof subject.customer === "object" && "id" in subject.customer
      ? String(subject.customer.id)
      : null;
  const subscriptionId = typeof subject.subscription === "string"
    ? subject.subscription
    : typeof subject.id === "string" && event.type.startsWith("customer.subscription.")
      ? subject.id
      : null;

  const { data: savedLog, error: saveLogError } = await supabaseAdmin
    .from("webhook_logs")
    .upsert({
      id: existingLog?.id,
      source: "stripe",
      event_id: event.id,
      event_type: event.type,
      payload: JSON.parse(rawBody),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      processing_status: "pending",
      processing_error: null,
      processed_at: null,
    }, { onConflict: "source,event_id" })
    .select("id")
    .maybeSingle();

  if (saveLogError) {
    logStep("Failed to save webhook log", { eventId: event.id, error: saveLogError.message });
    return new Response(
      JSON.stringify({ error: "Webhook logging failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(stripe, supabaseAdmin, event);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(stripe, supabaseAdmin, event);
        break;
      case "invoice.paid":
        await handleInvoicePaid(stripe, supabaseAdmin, event);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(stripe, supabaseAdmin, event);
        break;
      case "charge.refunded":
        await handleChargeRefunded(stripe, supabaseAdmin, event);
        break;
      default:
        logStep("Ignoring unsupported event", { eventType: event.type });
        break;
    }

    const { error: processedLogError } = await supabaseAdmin
      .from("webhook_logs")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", savedLog?.id || existingLog?.id);

    if (processedLogError) {
      throw processedLogError;
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("Webhook processing failed", { eventId: event.id, message });

    await supabaseAdmin
      .from("webhook_logs")
      .update({
        processing_status: "error",
        processing_error: message,
      })
      .eq("id", savedLog?.id || existingLog?.id);

    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
