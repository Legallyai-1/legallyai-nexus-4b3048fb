// Request handler for the customer-portal edge function, with Stripe/Supabase injected so it is unit-testable.
import { getBillingReturnOrigin, getMappedBillingCustomerId, isBillingCustomerConsistent } from "./billing-ownership.ts";

// deno-lint-ignore no-explicit-any
type Any = any;
export interface CustomerPortalDeps {
  env: (name: string) => string | undefined;
  createClient: (url: string, key: string, options: Any) => Any;
  createStripe: (key: string) => Any;
}

export const customerPortalHandler = (deps: CustomerPortalDeps) => async (req: Request): Promise<Response> => {
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
  if (!token) return reply({ error: "Sign in to manage billing." }, 401);
  const stripeKey = deps.env("STRIPE_SECRET_KEY");
  const url = deps.env("SUPABASE_URL");
  const serviceKey = deps.env("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !url || !serviceKey) return reply({ error: "Billing is temporarily unavailable." }, 503);
  try {
    const supabase = deps.createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user) return reply({ error: "Sign in to manage billing." }, 401);
    const user = data.user;
    const { data: mapping, error: mappingError } = await supabase
      .from("subscriptions")
      .select("user_id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (mappingError) throw new Error("Billing mapping lookup failed");
    const customerId = getMappedBillingCustomerId(user.id, mapping);
    if (!customerId) return reply({ error: "Your billing account is not linked yet. Please contact support." }, 409);
    const stripe = deps.createStripe(stripeKey);
    const customer = await stripe.customers.retrieve(customerId);
    if (!isBillingCustomerConsistent(user.id, customerId, customer)) {
      return reply({ error: "Your billing account requires support review." }, 409);
    }
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/dashboard` });
    return reply({ url: session.url });
  } catch {
    console.error("[CUSTOMER-PORTAL] Billing portal request failed");
    return reply({ error: "Billing could not be opened. Please try again or contact support." }, 502);
  }
};
