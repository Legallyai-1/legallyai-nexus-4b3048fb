// Display-only subscription state. Server-side functions remain the source of truth for access control.

const STORAGE_KEY = 'legallyai_subscription_tier';

export function getStoredSubscriptionTier(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredSubscriptionTier(tier: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    if (!tier) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, tier.toLowerCase());
  } catch {
    // Ignore storage write failures so app remains resilient in private browsing.
  }
}

/**
 * Ads are only for the free plan. Any other tier (premium, document, solo, firm, pro,
 * large_firm, enterprise, ...) or an active/trialing subscription is ad-free.
 */
export function isAdFreeTier(tier: string | null | undefined, status?: string | null): boolean {
  const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (normalizedStatus === 'active' || normalizedStatus === 'trialing') return true;
  const normalizedTier = typeof tier === 'string' ? tier.trim().toLowerCase() : '';
  return normalizedTier !== '' && normalizedTier !== 'free';
}

/** Kept for callers that only know the tier name. */
export function isPaidSubscriptionTier(tier: string | null): boolean {
  return isAdFreeTier(tier);
}

/** 'unknown' until we know the visitor's plan; ads render only for 'free'. */
export type AdEligibility = 'unknown' | 'free' | 'paid';

export function resolveAdEligibility(input: {
  signedIn: boolean;
  tier?: string | null;
  status?: string | null;
  failed?: boolean;
}): AdEligibility {
  if (!input.signedIn) return 'free';
  // If the plan lookup failed we cannot rule out a paying user, so show nothing.
  if (input.failed) return 'unknown';
  return isAdFreeTier(input.tier, input.status) ? 'paid' : 'free';
}

let adEligibility: AdEligibility = 'unknown';
const listeners = new Set<() => void>();

export function getAdEligibility(): AdEligibility {
  return adEligibility;
}

export function setAdEligibility(next: AdEligibility): void {
  if (next === adEligibility) return;
  adEligibility = next;
  if (typeof document !== 'undefined' && document.body) {
    document.body.dataset.adsEnabled = String(next === 'free');
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToAdEligibility(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function shouldShowAds(): boolean {
  return adEligibility === 'free';
}
