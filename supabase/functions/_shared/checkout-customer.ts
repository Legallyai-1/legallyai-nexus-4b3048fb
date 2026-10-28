export function getCheckoutCustomerOptions(
  mode: 'subscription' | 'payment',
  customerId: string | undefined,
  email: string,
) {
  if (customerId) return { customer: customerId };
  if (mode === 'payment') return { customer_email: email, customer_creation: 'always' as const };
  return { customer_email: email };
}
