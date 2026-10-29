import type { AdEligibility } from "./subscription";

// Pages where display ads may appear. Everything else (Ask Lee chat, the self-help and firm hubs,
// document tools, pricing/checkout, sign-in/sign-up and legal pages) stays ad-free.
export const AD_ROUTES: readonly string[] = [
  "/",
  "/ai-assistants",
  "/templates",
  "/legal-academy",
  "/pro-bono",
];

export function areAdsAllowedOnPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return AD_ROUTES.includes(path.toLowerCase());
}

/** Single ad gate: an allowed page and a visitor confirmed to be on the free plan. */
export function canShowAdOn(pathname: string, eligibility: AdEligibility): boolean {
  return eligibility === "free" && areAdsAllowedOnPath(pathname);
}
