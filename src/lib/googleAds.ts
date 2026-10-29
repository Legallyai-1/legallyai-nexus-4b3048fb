// Google Ads site tag + conversion events. Inert unless VITE_GOOGLE_ADS_ID (e.g. "AW-123456789") is set
// AND the visitor accepted ad measurement in the consent banner (src/components/AdsConsentBanner.tsx).
// Conversion labels come from Google Ads > Goals > Conversions > (action) > Tag setup.
import type { PurchaseConversion } from './purchaseConversion';

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

// Only call with a conversion from getPurchaseConversion() (src/lib/purchaseConversion.ts), i.e. after
// verify-payment proved server-side that this Checkout Session belongs to the user and was paid.
export function trackPurchaseConversion(conversion: PurchaseConversion) {
  const key = `legallyai-ads-purchase-${conversion.transactionId}`;
  try { if (window.sessionStorage.getItem(key)) return false; } catch { /* storage unavailable */ }
  const sent = sendConversion(import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL, {
    transaction_id: conversion.transactionId,
    ...(conversion.value !== undefined ? { value: conversion.value, currency: conversion.currency } : {}),
  });
  if (sent) { try { window.sessionStorage.setItem(key, '1'); } catch { /* storage unavailable */ } }
  return sent;
}
