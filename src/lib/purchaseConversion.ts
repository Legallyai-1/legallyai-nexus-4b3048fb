// Decides whether /payment-success may report a purchase conversion. Pure (no env/DOM) so it is unit-testable.
export interface VerifiedCheckout {
  verified?: unknown;
  paid?: unknown;
  session_id?: unknown;
  amount_total?: unknown;
  currency?: unknown;
}

export interface PurchaseConversion { transactionId: string; value?: number; currency?: string }

export function getPurchaseConversion(urlSessionId: string | null, checkout: VerifiedCheckout | null | undefined): PurchaseConversion | null {
  if (!urlSessionId || !checkout || checkout.verified !== true || checkout.paid !== true) return null;
  if (checkout.session_id !== urlSessionId) return null;
  const conversion: PurchaseConversion = { transactionId: urlSessionId };
  if (typeof checkout.amount_total === 'number' && typeof checkout.currency === 'string') {
    conversion.value = checkout.amount_total / 100;
    conversion.currency = checkout.currency;
  }
  return conversion;
}
