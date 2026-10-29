// Request handler for the update-seats edge function: lets a firm owner read or change the number of
// Extra seats on their own Firm/Enterprise subscription. Stripe/Supabase are injected so it is unit-testable.
//
// Security model:
// - The caller is identified only by their bearer token (auth.getUser). No subscription, customer or
//   organization ID is read from the request body; everything is looked up from the caller's own rows.
// - The caller must own a firm (organizations.owner_id) AND hold the subscription (subscriptions.user_id),
//   whose Stripe customer must match the mapped customer and whose plan item must be Firm or Enterprise.
// - Only the Extra seat line item is touched (quantity 0..100), with prorations.
// - Seats are never lowered below the seats already in use.
import { getBillingReturnOrigin, getMappedBillingCustomerId, isBillingCustomerConsistent } from "./billing-ownership.ts";
import { ENTERPRISE_PLAN_PRICE_ID, FIRM_PLAN_PRICE_ID, MAX_EXTRA_SEATS } from "./plan-catalog.ts";
import { getOrganizationSeats } from "./organization-seats.ts";

export const EXTRA_SEAT_PRICE_ID = "price_1UVwxO0QhWGUtGKvUKZM9SCE";
export const EXTRA_SEAT_MONTHLY_USD = 25;
const SEAT_PLANS: Record<string, { name: "Firm" | "Enterprise"; included: number }> = {
  [FIRM_PLAN_PRICE_ID]: { name: "Firm", included: 3 },
  [ENTERPRISE_PLAN_PRICE_ID]: { name: "Enterprise", included: 10 },
};
const EDITABLE_STATUSES = new Set(["active", "trialing"]);

// deno-lint-ignore no-explicit-any
type Any = any;
export interface UpdateSeatsDeps {
  env: (name: string) => string | undefined;
  createClient: (url: string, key: string, options: Any) => Any;
  createStripe: (key: string) => Any;
  /** Seats in use for one organization (defaults to the shared seat counter). */
  seatsUsed?: (db: Any, organizationId: string) => Promise<number>;
}

/** The requested Extra seat quantity: an integer 0..100, else null. Strings, floats and other types are rejected. */
export function parseExtraSeats(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_EXTRA_SEATS ? value : null;
}

/** The single Firm/Enterprise plan item on a Stripe subscription, or null. */
export function seatPlanItem(subscription: Any): { item: Any; plan: { name: "Firm" | "Enterprise"; included: number } } | null {
  const items: Any[] = subscription?.items?.data ?? [];
  const plans = items.filter((i) => Object.prototype.hasOwnProperty.call(SEAT_PLANS, i?.price?.id));
  return plans.length === 1 ? { item: plans[0], plan: SEAT_PLANS[plans[0].price.id] } : null;
}

const idOf = (value: unknown): string | null => typeof value === "string" ? value
  : value && typeof value === "object" && typeof (value as Any).id === "string" ? (value as Any).id : null;

export const updateSeatsHandler = (deps: UpdateSeatsDeps) => async (req: Request): Promise<Response> => {
  const origin = getBillingReturnOrigin(req.headers.get("origin"));
  const headers = {
    "Access-Control-Allow-Origin": origin || "https://www.legallyai.ai",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { headers, status });
  if (!origin) return reply({ error: "Origin not allowed." }, 403);
  if (req.method === "OPTIONS") return new Response(null, { headers, status: 204 });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);
  const token = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") || "")?.[1]?.trim();
  if (!token) return reply({ error: "Sign in to manage seats." }, 401);

  let body: Any = {};
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    return reply({ error: "Invalid request." }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ error: "Invalid request." }, 400);
  const wantsUpdate = Object.prototype.hasOwnProperty.call(body, "extraSeats");
  const requested = wantsUpdate ? parseExtraSeats(body.extraSeats) : null;
  if (wantsUpdate && requested === null) {
    return reply({ error: `Extra seats must be a whole number from 0 to ${MAX_EXTRA_SEATS}.` }, 400);
  }

  const stripeKey = deps.env("STRIPE_SECRET_KEY");
  const url = deps.env("SUPABASE_URL");
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !url || !serviceKey) return reply({ error: "Billing is temporarily unavailable." }, 503);
  try {
    const db = deps.createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth?.user?.id) return reply({ error: "Sign in to manage seats." }, 401);
    const userId: string = auth.user.id;

    const { data: orgs, error: orgError } = await db.from("organizations").select("id").eq("owner_id", userId).limit(20);
    if (orgError) throw new Error("Organization lookup failed");
    const orgIds = ((orgs ?? []) as { id: string }[]).map((o) => o.id).filter(Boolean);
    if (orgIds.length === 0) return reply({ error: "Only the firm owner can change seats." }, 403);

    const { data: row, error: subError } = await db.from("subscriptions")
      .select("user_id, stripe_customer_id, stripe_subscription_id, status")
      .eq("user_id", userId).maybeSingle();
    if (subError) throw new Error("Subscription lookup failed");
    const customerId = getMappedBillingCustomerId(userId, row ?? null);
    const subscriptionId = typeof row?.stripe_subscription_id === "string" && /^sub_[A-Za-z0-9]+$/.test(row.stripe_subscription_id)
      ? row.stripe_subscription_id : null;
    if (!customerId || !subscriptionId) return reply({ error: "Seats can be added on an active Firm or Enterprise plan." }, 403);

    const stripe = deps.createStripe(stripeKey);
    const customer = await stripe.customers.retrieve(customerId);
    if (!isBillingCustomerConsistent(userId, customerId, customer)) {
      return reply({ error: "Your billing account requires support review." }, 409);
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (idOf(subscription?.customer) !== customerId) return reply({ error: "Your billing account requires support review." }, 409);
    const planInfo = seatPlanItem(subscription);
    if (!planInfo || !EDITABLE_STATUSES.has(subscription.status)) {
      return reply({ error: "Seats can be added on an active Firm or Enterprise plan." }, 403);
    }
    const seatItems: Any[] = (subscription.items?.data ?? []).filter((i: Any) => i?.price?.id === EXTRA_SEAT_PRICE_ID);
    if (seatItems.length > 1) return reply({ error: "Your subscription needs support review before changing seats." }, 409);
    const seatItem = seatItems[0] ?? null;
    const current = seatItem ? Math.max(0, Number(seatItem.quantity) || 0) : 0;

    const seatsUsed = deps.seatsUsed ?? (async (client: Any, orgId: string) => (await getOrganizationSeats(client, orgId)).used);
    let used = 0;
    for (const orgId of orgIds) used = Math.max(used, await seatsUsed(db, orgId));

    const status = (extra: number) => ({
      plan_name: planInfo.plan.name,
      included_seats: planInfo.plan.included,
      extra_seats: extra,
      seat_limit: planInfo.plan.included + extra,
      seats_used: used,
      max_extra_seats: MAX_EXTRA_SEATS,
      price_per_seat_usd: EXTRA_SEAT_MONTHLY_USD,
    });
    if (!wantsUpdate || requested === current) return reply({ ...status(current), updated: false });

    if (planInfo.plan.included + (requested as number) < used) {
      return reply({ error: `You have ${used} seats in use. Remove members or invites before going below that.`, ...status(current) }, 409);
    }
    const items = seatItem
      ? [{ id: seatItem.id, quantity: requested }]
      : [{ price: EXTRA_SEAT_PRICE_ID, quantity: requested }];
    await stripe.subscriptions.update(subscriptionId, { items, proration_behavior: "create_prorations" },
      { idempotencyKey: `update-seats:${subscriptionId}:${current}->${requested}` });
    return reply({ ...status(requested as number), updated: true });
  } catch {
    console.error("[UPDATE-SEATS] Seat update failed");
    return reply({ error: "Seats could not be updated. Please try again or contact support." }, 502);
  }
};
