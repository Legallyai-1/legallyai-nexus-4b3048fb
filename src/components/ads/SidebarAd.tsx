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
  const adsenseEnabled = canRenderAds();

  useEffect(() => {
    if (!adsenseEnabled || isAdLoaded.current || loadFailed) return;

    let cancelled = false;
    const retryTimers: ReturnType<typeof setTimeout>[] = [];

    const attemptLoad = (attempt = 0) => {
      if (cancelled || isAdLoaded.current) return;

      try {
        const queued = queueAdsenseSlot();
        if (!queued) {
          if (attempt < 5) {
            retryTimers.push(setTimeout(() => attemptLoad(attempt + 1), 150));
            return;
          }

          throw new Error('adsbygoogle is not available on window');
        }

        isAdLoaded.current = true;
        trackAdPerformance(slot, 'requested');
      } catch (error) {
        setLoadFailed(true);
        trackAdPerformance(slot, 'error', error instanceof Error ? error.message : 'unknown');
      }
    };

    attemptLoad();

    return () => {
      cancelled = true;
      retryTimers.forEach(clearTimeout);
    };
  }, [adsenseEnabled, loadFailed, slot]);

  if (!adsenseEnabled || loadFailed) {
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
