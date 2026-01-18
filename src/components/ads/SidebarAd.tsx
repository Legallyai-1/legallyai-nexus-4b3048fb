import { useEffect, useRef } from "react";

interface SidebarAdProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function SidebarAd({ slot, className = "" }: SidebarAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
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
    <div ref={adRef} className={`sidebar-ad ${className}`}>
      <span className="text-xs text-muted-foreground/50 block mb-1 text-center">Sponsored</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="vertical"
        data-full-width-responsive="false"
      />
    </div>
  );
}
