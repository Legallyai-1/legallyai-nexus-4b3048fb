import { useEffect, useRef } from "react";
import { shouldShowAds } from '@/lib/subscription';

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (!shouldShowAds() || isAdLoaded.current) return;

    const checkAndLoadAd = () => {
      if (!adRef.current) return;

      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth <= 0) {
        setTimeout(checkAndLoadAd, 100);
        return;
      }

      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          window.adsbygoogle.push({});
          isAdLoaded.current = true;
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'production') {
          console.error("AdSense error:", err);
        }
      }
    };

    setTimeout(checkAndLoadAd, 200);
  }, []);

  const adClient = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-4991947741196600";
  const adsenseEnabled = import.meta.env.VITE_ENABLE_ADSENSE !== "false" && shouldShowAds();

  if (!adsenseEnabled) {
    return null;
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
