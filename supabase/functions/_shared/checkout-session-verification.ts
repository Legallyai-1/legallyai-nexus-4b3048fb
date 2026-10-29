// Server-side proof that a Stripe Checkout Session belongs to the signed-in user and was paid.
// Used by verify-payment so /payment-success never trusts a session_id from the URL.

export interface CheckoutSessionLike {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  client_reference_id?: string | null;
  customer?: string | { id: string } | null;
  metadata?: Record<string, string> | null;
  amount_total?: number | null;
  currency?: string | null;
}

export interface CheckoutSessionRetriever {
  checkout: { sessions: { retrieve: (id: string) => Promise<CheckoutSessionLike> } };
}

export type CheckoutVerification =
  | { verified: true; paid: boolean; sessionId: string; amountTotal: number | null; currency: string | null }
  | { verified: false; reason: "invalid_session_id" | "not_found" | "not_owner" | "customer_mismatch" | "incomplete" }
  // Stripe outage, rate limit, network or key problem: retryable, not proof the reference is invalid.
  | { verified: false; reason: "stripe_unavailable" };

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]{10,}$/;

export const isCheckoutSessionId = (value: unknown): value is string =>
  typeof value === "string" && SESSION_ID.test(value);

export function evaluateCheckoutSession(
  sessionId: string,
  userId: string,
  mappedCustomerId: string | null,
  session: CheckoutSessionLike | null,
): CheckoutVerification {
  if (!isCheckoutSessionId(sessionId)) return { verified: false, reason: "invalid_session_id" };
  if (!session || session.id !== sessionId) return { verified: false, reason: "not_found" };
  const owner = session.client_reference_id || session.metadata?.user_id || null;
  if (!owner || owner !== userId) return { verified: false, reason: "not_owner" };
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (mappedCustomerId && customerId && customerId !== mappedCustomerId) {
    return { verified: false, reason: "customer_mismatch" };
  }
  if (session.status !== "complete") return { verified: false, reason: "incomplete" };
  return {
    verified: true,
    // Trial checkouts complete with payment_status "no_payment_required": access is fine, but it is not a purchase.
    paid: session.payment_status === "paid",
    sessionId,
    amountTotal: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: session.currency ? session.currency.toUpperCase() : null,
  };
}

export async function verifyCheckoutSession(
  stripe: CheckoutSessionRetriever,
  sessionId: unknown,
  userId: string,
  mappedCustomerId: string | null,
): Promise<CheckoutVerification> {
  if (!isCheckoutSessionId(sessionId)) return { verified: false, reason: "invalid_session_id" };
  let session: CheckoutSessionLike | null = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    const code = (error as { code?: unknown; statusCode?: unknown } | null);
    if (code?.code === "resource_missing" || code?.statusCode === 404) return { verified: false, reason: "not_found" };
    console.error("[VERIFY-PAYMENT] Stripe session lookup failed", error instanceof Error ? error.message : String(error));
    return { verified: false, reason: "stripe_unavailable" };
  }
  return evaluateCheckoutSession(sessionId, userId, mappedCustomerId, session);
}
