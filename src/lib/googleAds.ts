// Google Ads site tag + conversion events. Inert unless VITE_GOOGLE_ADS_ID (e.g. "AW-123456789") is set
// AND the visitor accepted ad measurement in the consent banner (src/components/AdsConsentBanner.tsx).
// Conversion labels come from Google Ads > Goals > Conversions > (action) > Tag setup.
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

const adsId = (import.meta.env.VITE_GOOGLE_ADS_ID || '').trim();
const enabled = /^AW-\d+$/.test(adsId);
const CONSENT_KEY = 'legallyai-ads-consent';
export type AdsConsent = 'granted' | 'denied';

export const isGoogleAdsConfigured = () => enabled;

export function getAdsConsent(): AdsConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch { return null; }
}

export function setAdsConsent(value: AdsConsent) {
  try { window.localStorage.setItem(CONSENT_KEY, value); } catch { /* storage unavailable */ }
  if (value === 'granted') initGoogleAds();
}

export function initGoogleAds() {
  if (!enabled || typeof window === 'undefined' || window.gtag || getAdsConsent() !== 'granted') return;
  window.dataLayer = window.dataLayer || [];
  // gtag.js requires the `arguments` object, not a spread array.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', adsId);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsId)}`;
  document.head.appendChild(script);
}

function sendConversion(label: string | undefined, params: Record<string, unknown> = {}) {
  const cleanLabel = (label || '').trim();
  if (!enabled || !cleanLabel || typeof window === 'undefined' || !window.gtag || getAdsConsent() !== 'granted') return false;
  window.gtag('event', 'conversion', { send_to: `${adsId}/${cleanLabel}`, ...params });
  return true;
}

export function trackSignUpConversion() {
  return sendConversion(import.meta.env.VITE_GOOGLE_ADS_SIGNUP_LABEL);
}

// A purchase conversion is intentionally NOT sent from the browser yet: /payment-success cannot prove
// that a specific Checkout Session was paid. Add it once verify-payment validates the session_id server-side.
