import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAdEligibility } from "@/hooks/useAdEligibility";
import { canShowAdOn } from "@/lib/adRoutes";
import { canRenderAds, ensureAdsenseScriptLoaded } from "./adsense";

const AUTO_ADS_GUARD_STYLE_ID = "legallyai-auto-ads-guard";

// Once adsbygoogle.js is on the page it stays for the whole SPA session, and AdSense Auto ads can
// place in-page, anchor or side-rail units on later client-side routes. Hide anything it placed
// whenever the current page is not ad-eligible (chat, hubs, auth, checkout, account, paid users).
function ensureAutoAdsGuardStyle() {
  if (typeof document === "undefined" || document.getElementById(AUTO_ADS_GUARD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = AUTO_ADS_GUARD_STYLE_ID;
  style.textContent =
    'body:not([data-ad-page="true"]) ins.adsbygoogle,' +
    'body:not([data-ad-page="true"]) .google-auto-placed{display:none!important;visibility:hidden!important}';
  document.head.appendChild(style);
}

// Loads AdSense (manual slots + Auto ads) only for free-plan visitors on ad-eligible public pages, so
// paying users, chat, hubs, pricing, sign-in, account and legal pages never download it.
export function AdsenseRouteLoader() {
  const { pathname } = useLocation();
  const eligibility = useAdEligibility();
  useEffect(() => {
    const allowed = canShowAdOn(pathname, eligibility) && canRenderAds();
    if (typeof document !== "undefined" && document.body) {
      document.body.dataset.adPage = String(allowed);
      ensureAutoAdsGuardStyle();
    }
    if (allowed) ensureAdsenseScriptLoaded();
  }, [pathname, eligibility]);
  return null;
}
