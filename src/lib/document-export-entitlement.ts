// Shared rules for exporting (downloading) AI-generated documents.
// Mirrors the /generate page: exports require a server-verified payment
// (verify-payment -> hasPaid) whenever payments are enabled for the deployment.

// Same one-time $5 "Per Document" price used by /generate and /pricing.
export const DOCUMENT_EXPORT_PRICE_ID = "price_1SckVt0QhWGUtGKvl9YdmQqk";
export const DOCUMENT_EXPORT_CHECKOUT_MODE = "payment" as const;

export function canExportDocument({
  paymentsEnabled,
  hasPaid,
}: {
  paymentsEnabled: boolean;
  hasPaid: boolean;
}): boolean {
  return !paymentsEnabled || hasPaid === true;
}
