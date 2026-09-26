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
  const adsenseEnabled = canRenderAds() && shouldShowAds();

  useEffect(() => {
    if (!adsenseEnabled || isAdLoaded.current || loadFailed) return;

    let cancelled = false;
    let statusObserver: MutationObserver | undefined;

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
        const adElement = adRef.current?.querySelector('ins');
        if (!adElement) {
          setLoadFailed(true);
          trackAdPerformance(slot, 'empty', 'ad-element-missing');
          return;
        }

        const handleStatusChange = () => {
          if (cancelled) return true;

          const adStatus = adElement.getAttribute('data-ad-status');
          if (adStatus === 'filled') {
            trackAdPerformance(slot, 'rendered');
            return true;
          }

          if (adStatus === 'unfilled') {
            setLoadFailed(true);
            trackAdPerformance(slot, 'empty', 'ad-status-unfilled');
            return true;
          }

          return false;
        };

        if (!handleStatusChange()) {
          statusObserver = new MutationObserver(() => {
            if (handleStatusChange()) {
              statusObserver?.disconnect();
            }
          });
          statusObserver.observe(adElement, {
            attributes: true,
            attributeFilter: ['data-ad-status'],
          });
        }
      } catch (error) {
        setLoadFailed(true);
        trackAdPerformance(slot, 'error', error instanceof Error ? error.message : 'unknown');
      }
    };

    const timer = setTimeout(() => attemptLoad(), 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      statusObserver?.disconnect();
    };
  }, [adsenseEnabled, loadFailed, slot]);

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
