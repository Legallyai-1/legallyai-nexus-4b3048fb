// Decides whether /payment-success may report a purchase conversion. Pure (no env/DOM) so it is unit-testable.
export interface VerifiedCheckout {
  verified?: unknown;
  paid?: unknown;
  session_id?: unknown;
  amount_total?: unknown;
  currency?: unknown;
}

export interface PurchaseConversion { transactionId: string; value?: number; currency?: string }

// Stripe reports these in whole units (https://docs.stripe.com/currencies#zero-decimal).
const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
// Three-decimal currencies; anything else is assumed to use two decimals.
const THREE_DECIMAL = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND']);

export function minorUnitsToAmount(amount: number, currency: string): number {
  const code = currency.toUpperCase();
  const divisor = ZERO_DECIMAL.has(code) ? 1 : THREE_DECIMAL.has(code) ? 1000 : 100;
  return amount / divisor;
}

export function getPurchaseConversion(urlSessionId: string | null, checkout: VerifiedCheckout | null | undefined): PurchaseConversion | null {
  if (!urlSessionId || !checkout || checkout.verified !== true || checkout.paid !== true) return null;
  if (checkout.session_id !== urlSessionId) return null;
  const conversion: PurchaseConversion = { transactionId: urlSessionId };
  if (typeof checkout.amount_total === 'number' && typeof checkout.currency === 'string') {
    conversion.currency = checkout.currency.toUpperCase();
    conversion.value = minorUnitsToAmount(checkout.amount_total, conversion.currency);
  }
  return conversion;
}
