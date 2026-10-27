import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCheckoutCustomerOptions } from "../_shared/checkout-customer.ts";

const origins = new Set(["https://legallyai.ai", "https://www.legallyai.ai"]);
const prices: Record<string, { tier: string; amount: number; mode: "subscription" | "payment" }> = {
  price_1Sdfqp0QhWGUtGKvcQuWONuB: { tier: "premium", amount: 999, mode: "subscription" },
  price_1SckV70QhWGUtGKvvg1tH7lu: { tier: "pro", amount: 9900, mode: "subscription" },
  price_1SckVt0QhWGUtGKvl9YdmQqk: { tier: "document", amount: 500, mode: "payment" },
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = {
    "Access-Control-Allow-Origin": origin && origins.has(origin) ? origin : "https://www.legallyai.ai",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { headers, status });
  if (origin && !origins.has(origin)) return reply({ error: "Origin not allowed." }, 403);
  if (req.method === "OPTIONS") return new Response(null, { headers, status: 204 });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  // Payments always enabled (owner decision Oct 2026). Stripe key presence is checked below.
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!key || !url || !anon) return reply({ error: "Checkout is temporarily unavailable." }, 503);
  const auth = req.headers.get("authorization") || "";
  const token = /^Bearer\s+(.+)$/i.exec(auth)?.[1]?.trim();
  if (!token) return reply({ error: "Sign in to continue." }, 401);
  try {
    const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user?.email || !user.email_confirmed_at) {
      return reply({ error: "A confirmed account is required." }, 401);
    }
    let input: { priceId?: unknown; mode?: unknown; trial?: unknown };
    try { input = await req.json(); } catch { return reply({ error: "Invalid JSON body." }, 400); }
    if (!input || typeof input !== "object") return reply({ error: "Invalid request." }, 400);
    const priceId = typeof input.priceId === "string" ? input.priceId : "";
    const selected = Object.prototype.hasOwnProperty.call(prices, priceId) ? prices[priceId] : undefined;
    if (!selected) return reply({ error: "Invalid price ID." }, 400);
    if (input.mode !== undefined && input.mode !== selected.mode) return reply({ error: "Payment mode does not match this price." }, 400);
    if (input.trial !== undefined && typeof input.trial !== "boolean") return reply({ error: "Invalid trial request." }, 400);
    const trial = input.trial === true;
    if (trial && selected.mode !== "subscription") return reply({ error: "Trials require a subscription." }, 400);
    const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });
    const price = await stripe.prices.retrieve(priceId);
    if (!price.active || price.currency !== "usd" || price.unit_amount !== selected.amount ||
      (selected.mode === "subscription" && (!price.recurring || price.recurring.interval !== "month" || price.recurring.interval_count !== 1)) ||
      (selected.mode === "payment" && price.recurring)) {
      return reply({ error: "The configured price requires administrator review." }, 503);
    }
    const customers = await stripe.customers.list({ email: user.email, limit: 100 });
    if (customers.has_more) return reply({ error: "Please contact support to review your billing account." }, 409);
    let customerId: string | undefined;
    for (const customer of customers.data) {
      const belongsToUser = customer.metadata?.user_id === user.id;
      if (belongsToUser && !customerId) customerId = customer.id;
      if (selected.mode !== "subscription") continue;
      const history = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
      if (trial && history.data.length) return reply({ error: "A free trial is available only before your first subscription. No charge was created.", trialUnavailable: true }, 409);
      if (history.has_more || history.data.some(sub => !["canceled", "incomplete_expired"].includes(sub.status))) {
        return reply({ error: "Review your existing subscription in billing settings before starting another." }, 409);
      }
    }
    const productId = typeof price.product === "string" ? price.product : price.product.id;
    const metadata = { user_id: user.id, tier: selected.tier, price_id: priceId, product_id: productId };
    const returnOrigin = origin && origins.has(origin) ? origin : "https://www.legallyai.ai";
    const session = await stripe.checkout.sessions.create({
      ...getCheckoutCustomerOptions(selected.mode, customerId, user.email),
      client_reference_id: user.id,
      metadata,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: selected.mode,
      ...(selected.mode === "subscription" ? {
        subscription_data: { metadata, ...(trial ? { trial_period_days: 7 } : {}) },
        payment_method_collection: "always" as const,
      } : {}),
      success_url: `${returnOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnOrigin}/pricing`,
    }, { idempotencyKey: `checkout:${user.id}:${priceId}:${trial ? "trial" : "paid"}:${Math.floor(Date.now() / 1800000)}` });
    if (!session.url) return reply({ error: "Checkout did not return a URL." }, 502);
    return reply({ url: session.url, trialDays: trial ? 7 : 0 });
  } catch (error) {
    console.error("Checkout failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return reply({ error: "Checkout could not be started. Please try again or contact support." }, 502);
  }
});
