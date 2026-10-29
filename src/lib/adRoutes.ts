import type { AdEligibility } from "./subscription";
import { GUIDES } from "./guides.ts";

// Public content pages where display ads (manual slots and AdSense Auto ads) may appear. Everything
// else (Ask Lee chat, the self-help and firm hubs, document tools, pricing/checkout, sign-in/sign-up,
// account and legal pages) stays ad-free.
export const AD_ROUTES: readonly string[] = [
  "/",
  "/ai-assistants",
  "/templates",
  "/legal-academy",
  "/pro-bono",
  "/guides",
  "/about",
  "/contact",
];

// Published guide articles (/guides/<slug>); unknown slugs render the 404 page and stay ad-free.
const GUIDE_PATHS = new Set(GUIDES.map((guide) => `/guides/${guide.slug}`.toLowerCase()));

export function areAdsAllowedOnPath(pathname: string): boolean {
  const path = (pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname).toLowerCase();
  if (AD_ROUTES.includes(path)) return true;
  return GUIDE_PATHS.has(path);
}

/** Single ad gate: an allowed page and a visitor confirmed to be on the free plan. */
export function canShowAdOn(pathname: string, eligibility: AdEligibility): boolean {
  return eligibility === "free" && areAdsAllowedOnPath(pathname);
}
