import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAdEligibility } from "@/hooks/useAdEligibility";
import { canShowAdOn } from "@/lib/adRoutes";
import { canRenderAds, ensureAdsenseScriptLoaded } from "./adsense";

// Loads AdSense only for free-plan visitors on ad-eligible pages, so paying users, chat, hubs,
// pricing, sign-in and legal pages never download it.
export function AdsenseRouteLoader() {
  const { pathname } = useLocation();
  const eligibility = useAdEligibility();
  useEffect(() => {
    if (canShowAdOn(pathname, eligibility) && canRenderAds()) ensureAdsenseScriptLoaded();
  }, [pathname, eligibility]);
  return null;
}
