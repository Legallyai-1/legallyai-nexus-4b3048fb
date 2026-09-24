const PAID_TIERS = new Set(["premium", "pro", "enterprise", "document"]);
const ACTIVE_PAYMENT_STATUSES = new Set(["paid", "succeeded"]);

export type PaymentRecordCandidate = {
  tier: string | null;
  payment_method?: string | null;
  expires_at: string | null;
  status: string | null;
  metadata?: Record<string, unknown> | null;
};

export type SubscriptionCandidate = {
  status: string | null;
  tier: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
} | null;

function getDocumentEntitlementCount(metadata: Record<string, unknown> | null | undefined) {
  const rawValue = metadata && typeof metadata === "object" ? metadata.documents_remaining : null;
  if (typeof rawValue === "number") {
    return rawValue;
  }

  if (typeof rawValue === "string") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isActivePaymentRecord(paymentRecord: PaymentRecordCandidate) {
  if (!paymentRecord.status || !ACTIVE_PAYMENT_STATUSES.has(paymentRecord.status)) {
    return false;
  }

  if (paymentRecord.tier === "document") {
    return (getDocumentEntitlementCount(paymentRecord.metadata) ?? 1) > 0;
  }

  return !paymentRecord.expires_at || new Date(paymentRecord.expires_at) > new Date();
}

export function resolveSubscriptionAccess(
  profileTier: string,
  subscription: SubscriptionCandidate,
  paymentRecords: PaymentRecordCandidate[] | null | undefined,
) {
  const activeSubscription = subscription
    ? ["active", "trialing", "past_due"].includes(subscription.status || "")
    : false;
  const activePaymentRecord = paymentRecords?.find(isActivePaymentRecord) || null;
  const activePayment = Boolean(activePaymentRecord);
  const profileFallback = profileTier !== "document" && PAID_TIERS.has(profileTier) && !subscription && !activePaymentRecord;
  const plan = activeSubscription
    ? subscription?.tier || profileTier
    : activePayment
      ? activePaymentRecord?.tier || profileTier
      : profileTier;

  return {
    activePayment,
    activePaymentRecord,
    activeSubscription,
    plan,
    profileFallback,
    entitled: (activeSubscription && PAID_TIERS.has(plan)) ||
      (activePayment && PAID_TIERS.has(plan)) ||
      profileFallback,
  };
}
