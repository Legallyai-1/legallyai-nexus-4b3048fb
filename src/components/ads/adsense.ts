import { getAdsenseClientId, isAdsenseEnabled } from '@/lib/env';

export type AdPerformanceEvent = 'requested' | 'rendered' | 'empty' | 'error';

const ADSENSE_SCRIPT_ID = 'legallyai-adsense-script';
const ADSENSE_SCRIPT_BASE_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

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

export function ensureAdsenseScriptLoaded() {
  if (typeof document === 'undefined') {
    return;
  }

  // Loaded on demand (AdsenseRouteLoader / first ad slot). Google only allows ONE copy per page; a second tag makes the
  // loader bail out and queued slots stay "pending" forever. Reuse any existing tag, whatever its id.
  const existing = document.querySelector<HTMLScriptElement>(`script[src^="${ADSENSE_SCRIPT_BASE_URL}"]`);
  if (existing) {
    return;
  }

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `${ADSENSE_SCRIPT_BASE_URL}?client=${encodeURIComponent(getAdsenseClientId())}`;
  document.head.appendChild(script);
}

export function queueAdsenseSlot() {
  if (typeof window === 'undefined') {
    return false;
  }

  ensureAdsenseScriptLoaded();
  // Never replace window.adsbygoogle once Google's loader owns it; just queue onto whatever is there.
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
  return true;
}

export { isValidAdSlot } from '@/lib/adSlots';
