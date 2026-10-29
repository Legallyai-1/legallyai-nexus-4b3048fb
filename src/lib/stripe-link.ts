// Links a Stripe subscription paid under this account's verified email (e.g. a customer moved from the old backend).
// Once per user per browser session; failures are silent (the webhook also falls back to the same email match).
const DONE_KEY = "legallyai.stripe-link.checked";

export async function linkStripeCustomer(accessToken: string, userId: string, fetcher: typeof fetch = fetch, storage: Pick<Storage, "getItem" | "setItem"> | null = typeof sessionStorage !== "undefined" ? sessionStorage : null): Promise<boolean> {
  if (!accessToken || !userId) return false;
  const marker = userId;
  try { if (storage?.getItem(DONE_KEY) === marker) return false; } catch { /* storage blocked */ }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetcher("/api/webhooks/stripe?action=link-customer", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return false;
    try { storage?.setItem(DONE_KEY, marker); } catch { /* storage blocked */ }
    const body = await res.json().catch(() => null) as { linked?: unknown } | null;
    return body?.linked === true;
  } catch {
    return false;
  }
}
