// AdSense ad-unit ids are numeric. Placeholder names like "CASES_SIDEBAR_SLOT" make Google
// answer 400 and log a console error, so such units are not rendered at all.
export function isValidAdSlot(slot: string | null | undefined): slot is string {
  return typeof slot === 'string' && /^\d{6,}$/.test(slot.trim());
}

type AdSlotEnv = Record<string, string | undefined>;

/** Slot ids not reported failing; used when the env var is unset or not numeric. */
const SLOT_FALLBACKS = {
  HOME_MID: '9777464779',
  HOME_LOWER: '3466389052',
} as const;

function pickSlot(value: string | undefined, fallback?: string): string | undefined {
  if (isValidAdSlot(value)) return value.trim();
  return fallback;
}

/**
 * Builds the page slot map from VITE_ADSENSE_SLOT_* vars. AI_ASSISTANTS has no fallback:
 * its old unit (5824691357) returns 400, so /ai-assistants shows no ad until a real id is set.
 */
export function resolveAdSlots(env: AdSlotEnv) {
  return {
    AI_ASSISTANTS: pickSlot(env.VITE_ADSENSE_SLOT_AI_ASSISTANTS),
    HOME_MID: pickSlot(env.VITE_ADSENSE_SLOT_HOME_MID, SLOT_FALLBACKS.HOME_MID),
    HOME_LOWER: pickSlot(env.VITE_ADSENSE_SLOT_HOME_LOWER, SLOT_FALLBACKS.HOME_LOWER),
  };
}

// import.meta.env is undefined outside Vite (node tests), hence the guard.
export const AD_SLOTS = resolveAdSlots(
  (import.meta as { env?: AdSlotEnv }).env ?? {},
);
