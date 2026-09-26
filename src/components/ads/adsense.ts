import { getAdsenseClientId, isAdsenseEnabled } from '@/lib/env';

export type AdPerformanceEvent = 'requested' | 'rendered' | 'empty' | 'error';

export function getAdClient() {
  return getAdsenseClientId();
}

export function canRenderAds() {
  return isAdsenseEnabled();
}

export function trackAdPerformance(slot: string, event: AdPerformanceEvent, details?: string) {
  if (import.meta.env.DEV) {
    console.info(`[adsense:${event}]`, slot, details ?? '');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('legallyai:adsense', {
      detail: {
        slot,
        event,
        details,
        timestamp: new Date().toISOString(),
      },
    }));
  }
}

export function queueAdsenseSlot() {
  if (typeof window === 'undefined' || !Array.isArray(window.adsbygoogle)) {
    return false;
  }

  window.adsbygoogle.push({});
  return true;
}
