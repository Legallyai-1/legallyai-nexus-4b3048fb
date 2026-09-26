import { useEffect, useRef, useState } from 'react';
import { shouldShowAds } from '@/lib/subscription';
import { canRenderAds, getAdClient, queueAdsenseSlot, trackAdPerformance } from './adsense';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!canRenderAds() || !shouldShowAds() || isAdLoaded.current || loadFailed) return;

    let cancelled = false;
    let verificationTimer: ReturnType<typeof setTimeout> | undefined;

    const attemptLoad = (attempt = 0) => {
      if (cancelled || !adRef.current) return;

      if (adRef.current.offsetWidth <= 0) {
        if (attempt < 5) {
          setTimeout(() => attemptLoad(attempt + 1), 150);
          return;
        }

        setLoadFailed(true);
        trackAdPerformance(slot, 'empty', 'container-width-unavailable');
        return;
      }

      try {
        const queued = queueAdsenseSlot();
        if (!queued) {
          throw new Error('adsbygoogle is not available on window');
        }

        isAdLoaded.current = true;
        trackAdPerformance(slot, 'requested');
        verificationTimer = setTimeout(() => {
          if (cancelled) return;
          const adElement = adRef.current?.querySelector('ins');
          const rendered = Boolean(adElement && adElement.getAttribute('data-ad-status') !== 'unfilled');
          if (rendered) {
            trackAdPerformance(slot, 'rendered');
            return;
          }

          setLoadFailed(true);
          trackAdPerformance(slot, 'empty', 'ad-status-unfilled');
        }, 2000);
      } catch (error) {
        setLoadFailed(true);
        trackAdPerformance(slot, 'error', error instanceof Error ? error.message : 'unknown');
      }
    };

    const timer = setTimeout(() => attemptLoad(), 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (verificationTimer) {
        clearTimeout(verificationTimer);
      }
    };
  }, [loadFailed, slot]);

  const adsenseEnabled = canRenderAds() && shouldShowAds();

  if (!adsenseEnabled) {
    return null;
  }

  if (loadFailed) {
    return (
      <div
        className={`ad-container flex min-h-24 items-center justify-center rounded-md border border-dashed border-border/50 text-xs text-muted-foreground/70 ${className}`}
        data-ad-slot={slot}
      >
        Sponsored
      </div>
    );
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`} data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={getAdClient()}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
