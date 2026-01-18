import { useEffect, useRef } from "react";

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
    // Only load ad once
    if (isAdLoaded.current) return;
    
    // Wait for container to have width before loading ad
    const checkAndLoadAd = () => {
      if (!adRef.current) return;
      
      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth <= 0) {
        // Retry after a short delay if container has no width yet
        setTimeout(checkAndLoadAd, 100);
        return;
      }
      
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          window.adsbygoogle.push({});
          isAdLoaded.current = true;
        }
      } catch (err) {
        // Silently ignore ad errors in development
        if (process.env.NODE_ENV === 'production') {
          console.error("AdSense error:", err);
        }
      }
    };
    
    // Small delay to ensure DOM is ready
    setTimeout(checkAndLoadAd, 200);
  }, []);

  const adClient = "ca-pub-4991947741196600";

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
