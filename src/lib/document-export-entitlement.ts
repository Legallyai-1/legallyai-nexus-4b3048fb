// Hub document generation: the generate-document edge function decides entitlement
// server-side (see supabase/functions/_shared/generate-document-handler.ts). The UI only
// reflects its response; it never unlocks exports on its own.

// Same one-time $5 "Per Document" price used by /generate and /pricing.
export const DOCUMENT_EXPORT_PRICE_ID = "price_1SckVt0QhWGUtGKvl9YdmQqk";
export const DOCUMENT_EXPORT_CHECKOUT_MODE = "payment" as const;

export interface GeneratedDocumentResult {
  document: string;
  /** "ai" = paid AI draft, "template" = free planning worksheet. */
  mode: "ai" | "template";
  exportUnlocked: boolean;
  purchaseRequired: boolean;
  paidAiAvailable: boolean;
  documentsRemaining: number | null;
  reason: string | null;
}

/** Normalizes a generate-document response. Fails closed: exports unlock only on an explicit `true`. */
export function parseGenerateDocumentResponse(data: unknown): GeneratedDocumentResult | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.document !== "string" || !d.document.trim()) return null;
  return {
    document: d.document.trim(),
    mode: d.mode === "ai" ? "ai" : "template",
    exportUnlocked: d.exportUnlocked === true,
    purchaseRequired: d.purchaseRequired === true,
    // The AI and purchase-required responses omit it; only an explicit false means paid AI is off.
    paidAiAvailable: d.paidAiAvailable !== false,
    documentsRemaining: typeof d.documentsRemaining === "number" ? d.documentsRemaining : null,
    reason: typeof d.reason === "string" ? d.reason : null,
  };
}

/** Show "Buy this document – $5" only when the server asks for a purchase and paid AI exists. */
export function shouldOfferDocumentPurchase(result: GeneratedDocumentResult | null, paymentsEnabled: boolean): boolean {
  return Boolean(result && paymentsEnabled && result.paidAiAvailable && result.purchaseRequired);
}

export interface GenerateInvokeOutcome {
  data: unknown;
  status: number | null;
  errorMessage: string | null;
}

export const CONTENTION_RETRY_DELAY_MS = 1500;
export const CONTENTION_RETRY_MESSAGE =
  "Another document request is still in progress. Please try again in a moment.";

/**
 * 409 = another request holds the user's document credit; nothing was spent.
 * Retry exactly once after a short delay, then surface the retry message.
 */
export async function invokeWithContentionRetry(
  invoke: () => Promise<GenerateInvokeOutcome>,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<GenerateInvokeOutcome> {
  const first = await invoke();
  if (first.status !== 409) return first;
  await wait(CONTENTION_RETRY_DELAY_MS);
  const second = await invoke();
  if (second.status === 409) return { ...second, errorMessage: CONTENTION_RETRY_MESSAGE };
  return second;
}
