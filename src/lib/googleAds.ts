// Google Ads site tag + conversion events. Inert unless VITE_GOOGLE_ADS_ID (e.g. "AW-123456789") is set.
// Conversion labels come from Google Ads > Goals > Conversions > (action) > Tag setup.
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

const adsId = (import.meta.env.VITE_GOOGLE_ADS_ID || '').trim();
const enabled = /^AW-\d+$/.test(adsId);

export function initGoogleAds() {
  if (!enabled || typeof window === 'undefined' || window.gtag) return;
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
  if (!enabled || !cleanLabel || typeof window === 'undefined' || !window.gtag) return false;
  window.gtag('event', 'conversion', { send_to: `${adsId}/${cleanLabel}`, ...params });
  return true;
}

export function trackSignUpConversion() {
  return sendConversion(import.meta.env.VITE_GOOGLE_ADS_SIGNUP_LABEL);
}

// Fires once per Checkout Session; transaction_id also lets Google Ads de-duplicate.
export function trackPurchaseConversion(sessionId: string) {
  const key = `gads-purchase:${sessionId}`;
  try { if (window.sessionStorage.getItem(key)) return false; } catch { /* storage unavailable */ }
  const sent = sendConversion(import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL, { transaction_id: sessionId });
  if (sent) { try { window.sessionStorage.setItem(key, '1'); } catch { /* storage unavailable */ } }
  return sent;
}
