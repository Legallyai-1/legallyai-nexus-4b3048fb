const BILLING_ORIGINS = new Set(['https://legallyai.ai', 'https://www.legallyai.ai']);

export function getBillingReturnOrigin(origin: string | null): string | null {
  if (origin === null) return 'https://www.legallyai.ai';
  return BILLING_ORIGINS.has(origin) ? origin : null;
}

export function getMappedBillingCustomerId(
  userId: string,
  mapping: { user_id: string; stripe_customer_id: string | null } | null,
): string | null {
  if (!mapping || mapping.user_id !== userId) return null;
  const id = mapping.stripe_customer_id;
  return typeof id === 'string' && /^cus_[A-Za-z0-9]+$/.test(id) ? id : null;
}

export function isBillingCustomerConsistent(
  userId: string,
  customerId: string,
  customer: { id: string; deleted?: unknown; metadata?: Record<string, string> | null },
): boolean {
  if (customer.deleted === true || customer.id !== customerId) return false;
  const owner = customer.metadata?.user_id;
  return !owner || owner === userId;
}
