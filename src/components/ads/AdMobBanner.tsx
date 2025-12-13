import { useEffect, useState } from "react";

interface AdMobBannerProps {
  adUnitId?: string; // Replace with your AdMob ad unit ID
  size?: "banner" | "largeBanner" | "mediumRectangle" | "fullBanner" | "leaderboard";
  className?: string;
}

// AdMob Ad Unit IDs - Replace these with your actual AdMob IDs
export const ADMOB_AD_UNITS = {
  // Banner ads
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
  // Interstitial ads
  INTERSTITIAL: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
  // Rewarded ads
  REWARDED: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
};

export default function AdMobBanner({ 
  adUnitId = ADMOB_AD_UNITS.HOME_BANNER, 
  size = "banner",
  className = "" 
}: AdMobBannerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor/mobile environment
    const checkMobile = () => {
      const isCapacitor = !!(window as any).Capacitor;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isCapacitor || isMobileDevice);
    };
    checkMobile();
  }, []);

  // Only show placeholder on mobile - AdSense handles web
  if (!isMobile) return null;

  const sizeClasses = {
    banner: "h-[50px]",
    largeBanner: "h-[100px]",
    mediumRectangle: "h-[250px]",
    fullBanner: "h-[60px]",
    leaderboard: "h-[90px]",
  };

  return (
    <div 
      className={`w-full bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center ${sizeClasses[size]} ${className}`}
      data-admob-unit={adUnitId}
    >
      <span className="text-xs text-muted-foreground/50">
        AdMob: {adUnitId.includes("XXXX") ? "Configure Ad Unit ID" : "Ad Loading..."}
      </span>
    </div>
  );
}
