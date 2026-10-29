// Pure helpers shared by every "buy" button (Pricing, /generate, hub documents).
// No Supabase import here so node --test can cover them.

export const CHECKOUT_FALLBACK_MESSAGE =
  "Checkout could not be started. No checkout redirect occurred. Please try again or contact support.";

export interface CheckoutStartError {
  message: string;
  /** Server said this account already had a subscription, so the free trial is not available. */
  trialUnavailable: boolean;
  status: number | null;
}

/** Only Stripe-hosted Checkout over HTTPS is an acceptable redirect target. */
export function parseStripeCheckoutUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com" && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

/** Reads the create-checkout error body (supabase-js puts the Response on error.context). */
export async function readCheckoutError(error: unknown, data?: unknown): Promise<CheckoutStartError> {
  const fromData = data && typeof data === "object" ? data as { error?: unknown; trialUnavailable?: unknown } : null;
  if (!error && typeof fromData?.error === "string") {
    return { message: fromData.error, trialUnavailable: fromData.trialUnavailable === true, status: null };
  }
  const context = error && typeof error === "object" ? (error as { context?: unknown }).context : undefined;
  if (typeof Response !== "undefined" && context instanceof Response) {
    const body = await context.clone().json().catch(() => null) as { error?: unknown; trialUnavailable?: unknown } | null;
    return {
      message: typeof body?.error === "string" && body.error ? body.error : CHECKOUT_FALLBACK_MESSAGE,
      trialUnavailable: body?.trialUnavailable === true,
      status: context.status,
    };
  }
  return { message: CHECKOUT_FALLBACK_MESSAGE, trialUnavailable: false, status: null };
}

/**
 * Opens Stripe Checkout in a new tab without tripping popup blockers: the tab is opened
 * synchronously inside the click, then pointed at Checkout once the server returns a URL.
 * Falls back to the current tab if the browser refused the new tab. Closes the tab on failure.
 */
export async function openCheckoutInNewTab(
  getUrl: () => Promise<string>,
  win: Pick<Window, "open" | "location"> = window,
): Promise<void> {
  const tab = win.open("", "_blank");
  try {
    const url = parseStripeCheckoutUrl(await getUrl());
    if (!url) throw new Error("The payment redirect could not be verified. Contact support.");
    if (tab && !tab.closed) {
      try { tab.opener = null; } catch { /* cross-origin later; nothing to clear */ }
      tab.location.href = url.href;
    } else {
      win.location.assign(url.href);
    }
  } catch (error) {
    if (tab && !tab.closed) tab.close();
    throw error;
  }
}
