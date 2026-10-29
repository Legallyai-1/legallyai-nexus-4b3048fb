// Helpers for Google's certified consent tool (AdSense Privacy & messaging, a.k.a. Funding Choices / googlefc)
// and Google Consent Mode v2. Consent Mode defaults are set inline in index.html before any Google tag runs.

type GoogleFc = {
  callbackQueue?: unknown[];
  showRevocationMessage?: () => void;
};

declare global {
  interface Window {
    googlefc?: GoogleFc;
    __tcfapi?: (...args: unknown[]) => void;
  }
}

/** EEA + UK + CH region codes that get denied-by-default Consent Mode (kept in sync with index.html). */
export const CONSENT_DEFAULT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV',
  'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH',
] as const;

export const DO_NOT_SELL_ANCHOR = 'do-not-sell';

/** True when Google's consent tool (or any IAB TCF CMP) is running on the page; it then governs consent. */
export function isGoogleCmpActive(win: Partial<Window> | undefined = typeof window === 'undefined' ? undefined : window) {
  return Boolean(win && (win.googlefc || typeof win.__tcfapi === 'function'));
}

/** True when Google's own consent tool (googlefc) is loaded, so its privacy-choices message can be reopened. */
export function isGoogleFcLoaded(win: Partial<Window> | undefined = typeof window === 'undefined' ? undefined : window) {
  return Boolean(win?.googlefc);
}

/** True while Google's consent message is on screen. */
export function isGoogleConsentMessageVisible(doc: Document | undefined = typeof document === 'undefined' ? undefined : document) {
  return Boolean(doc?.querySelector('.fc-consent-root, .fc-dialog-container'));
}

/** Re-opens Google's consent message so the visitor can change their choices. Returns false if it isn't loaded. */
export function showGooglePrivacyChoices(win: Partial<Window> | undefined = typeof window === 'undefined' ? undefined : window) {
  const fc = win?.googlefc;
  if (!fc) return false;
  if (typeof fc.showRevocationMessage === 'function') {
    fc.showRevocationMessage();
    return true;
  }
  fc.callbackQueue = fc.callbackQueue || [];
  fc.callbackQueue.push(() => win?.googlefc?.showRevocationMessage?.());
  return true;
}
