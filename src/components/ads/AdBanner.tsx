import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once
    if (isAdLoaded.current) return;
    
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
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
