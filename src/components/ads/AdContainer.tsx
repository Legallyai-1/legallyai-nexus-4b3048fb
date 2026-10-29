import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAdEligibility } from "@/hooks/useAdEligibility";
import { canShowAdOn } from "@/lib/adRoutes";
import AdBanner from "./AdBanner";
import { canRenderAds, isValidAdSlot } from "./adsense";

interface AdContainerProps {
  slot: string;
  /** leaderboard = 728x90 / 320x100, rectangle = 300x250 on mobile. */
  size?: "leaderboard" | "rectangle";
  className?: string;
}

/**
 * The only ad component pages should use. It owns the whole gate (route allowlist,
 * free plan only, AdSense configured), so ineligible visitors get no label, frame or gap.
 */
export default function AdContainer({ slot, size = "leaderboard", className = "" }: AdContainerProps) {
  const { pathname } = useLocation();
  const eligibility = useAdEligibility();
  const [collapsed, setCollapsed] = useState(false);

  if (!canShowAdOn(pathname, eligibility) || !canRenderAds() || !isValidAdSlot(slot)) return null;

  return (
    <aside
      className={`ad-frame ad-frame--${size} ${className}`}
      aria-label="Advertisement"
      data-collapsed={collapsed ? "true" : undefined}
      aria-hidden={collapsed ? true : undefined}
    >
      {!collapsed && <span className="ad-frame__label">Advertisement</span>}
      <AdBanner
        slot={slot}
        format={size === "rectangle" ? "rectangle" : "horizontal"}
        onUnfilled={() => setCollapsed(true)}
      />
    </aside>
  );
}
