import { useEffect, useState } from "react";

interface AdMobBannerProps {
  adUnitId?: string;
  size?: "banner" | "largeBanner" | "mediumRectangle" | "fullBanner" | "leaderboard";
  className?: string;
}

export const ADMOB_AD_UNITS = {
  HOME_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  CHAT_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  ASSISTANTS_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  CUSTODY_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  DUI_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  DEFENSE_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  MARRIAGE_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  WILL_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  PROBATION_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  WORKPLACE_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  GENERATE_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  INTERSTITIAL: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  REWARDED: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
};

export default function AdMobBanner({ 
  adUnitId = ADMOB_AD_UNITS.HOME_BANNER, 
  size = "banner",
  className = "" 
}: AdMobBannerProps) {
  // AdMob cannot serve ads in a regular mobile web browser.
  // AdSense handles all web traffic; this component remains for a future
  // native Capacitor build, where a configured AdMob unit can be used.
  return null;
}
