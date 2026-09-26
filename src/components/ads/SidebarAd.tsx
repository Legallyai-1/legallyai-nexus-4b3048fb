import { useEffect, useRef, useState } from 'react';
import { canRenderAds, getAdClient, queueAdsenseSlot, trackAdPerformance } from './adsense';

interface SidebarAdProps {
  slot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function SidebarAd({ slot, className = '' }: SidebarAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!canRenderAds() || isAdLoaded.current || loadFailed) return;

    try {
      const queued = queueAdsenseSlot();
      if (!queued) {
        throw new Error('adsbygoogle is not available on window');
      }

      isAdLoaded.current = true;
      trackAdPerformance(slot, 'requested');
    } catch (error) {
      setLoadFailed(true);
      trackAdPerformance(slot, 'error', error instanceof Error ? error.message : 'unknown');
    }
  }, [loadFailed, slot]);

  if (!canRenderAds() || loadFailed) {
    return null;
  }

  return (
    <div ref={adRef} className={`sidebar-ad ${className}`}>
      <span className="text-xs text-muted-foreground/50 block mb-1 text-center">Sponsored</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={getAdClient()}
        data-ad-slot={slot}
        data-ad-format="vertical"
        data-full-width-responsive="false"
      />
    </div>
  );
}
