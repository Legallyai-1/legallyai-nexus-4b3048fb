// AdSense ad-unit ids are numeric. Placeholder names like "CASES_SIDEBAR_SLOT" make Google
// answer 400 and log a console error, so such units are not rendered at all.
export function isValidAdSlot(slot: string | null | undefined): slot is string {
  return typeof slot === 'string' && /^\d{6,}$/.test(slot.trim());
}
