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

function ensureAdsenseScriptLoaded() {
  if (typeof document === 'undefined') {
    return;
  }

  const scriptSrc = `${ADSENSE_SCRIPT_BASE_URL}?client=${encodeURIComponent(getAdsenseClientId())}`;
  const existingScript = document.getElementById(ADSENSE_SCRIPT_ID);

  if (existingScript instanceof HTMLScriptElement) {
    if (existingScript.src === scriptSrc) {
      return;
    }

    existingScript.remove();
  }

  const script = document.createElement('script');
  script.id = ADSENSE_SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = scriptSrc;
  document.head.appendChild(script);
}

export function queueAdsenseSlot() {
  if (typeof window === 'undefined') {
    return false;
  }

  ensureAdsenseScriptLoaded();
  window.adsbygoogle = window.adsbygoogle || [];

  if (!Array.isArray(window.adsbygoogle)) {
    window.adsbygoogle = [];
  }

  window.adsbygoogle.push({});
  return true;
}
