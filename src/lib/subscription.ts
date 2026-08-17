export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise' | 'document';

const STORAGE_KEY = 'legallyai_subscription_tier';

export const PAID_TIER_VALUES: SubscriptionTier[] = [
  'premium',
  'pro',
  'enterprise',
  'document',
];

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

export function isPaidSubscriptionTier(tier: string | null): boolean {
  if (!tier) return false;
  return PAID_TIER_VALUES.includes(tier.toLowerCase() as SubscriptionTier);
}

export function shouldShowAds(): boolean {
  return !isPaidSubscriptionTier(getStoredSubscriptionTier());
}
