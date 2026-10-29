import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdEligibility } from '@/hooks/useAdEligibility';
import { canShowAdOn } from '@/lib/adRoutes';
import { canRenderAds, getAdClient, isValidAdSlot, queueAdsenseSlot, trackAdPerformance } from './adsense';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  /** Called when no ad fills, so the frame can collapse instead of showing an empty box. */
  onUnfilled?: () => void;
}

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

export default function AdBanner({ slot, format = 'auto', className = '', onUnfilled }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { pathname } = useLocation();
  const eligibility = useAdEligibility();
  // Second safety net; AdContainer applies the same gate before rendering this.
  const adsenseEnabled = canShowAdOn(pathname, eligibility) && canRenderAds() && isValidAdSlot(slot);

  useEffect(() => {
    if (loadFailed) onUnfilled?.();
  }, [loadFailed, onUnfilled]);

  useEffect(() => {
    if (!adsenseEnabled || isAdLoaded.current || loadFailed) return;

    let cancelled = false;
    let statusObserver: MutationObserver | undefined;
    let statusTimeout: ReturnType<typeof setTimeout> | undefined;

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
              if (statusTimeout) {
                clearTimeout(statusTimeout);
              }
            }
          });
          statusObserver.observe(adElement, {
            attributes: true,
            attributeFilter: ['data-ad-status'],
          });
          statusTimeout = setTimeout(() => {
            statusObserver?.disconnect();
            if (cancelled || handleStatusChange()) return;
            setLoadFailed(true);
            trackAdPerformance(slot, 'empty', 'ad-status-timeout');
          }, 10000);
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
      if (statusTimeout) {
        clearTimeout(statusTimeout);
      }
    };
  }, [adsenseEnabled, loadFailed, slot]);

  if (!adsenseEnabled) {
    return null;
  }

  if (loadFailed) return null;

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
