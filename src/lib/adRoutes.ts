// Pages where display ads may appear. Everything else (Ask Lee chat, the self-help and firm hubs,
// document tools, pricing/checkout, sign-in/sign-up and legal pages) stays ad-free.
export const AD_ROUTES: readonly string[] = [
  "/",
  "/ai-assistants",
  "/templates",
  "/legal-academy",
  "/pro-bono",
  "/jobs",
];

export function areAdsAllowedOnPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return AD_ROUTES.includes(path.toLowerCase());
}
