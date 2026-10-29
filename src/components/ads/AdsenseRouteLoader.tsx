import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { areAdsAllowedOnPath } from "@/lib/adRoutes";
import { shouldShowAds } from "@/lib/subscription";
import { canRenderAds, ensureAdsenseScriptLoaded } from "./adsense";

// Loads AdSense only once a visitor reaches an ad-eligible page, so chat, hubs, pricing,
// sign-in and legal pages never load it on a direct visit.
export function AdsenseRouteLoader() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (areAdsAllowedOnPath(pathname) && canRenderAds() && shouldShowAds()) ensureAdsenseScriptLoaded();
  }, [pathname]);
  return null;
}
