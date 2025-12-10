import { ReactNode } from "react";
import SidebarAd from "@/components/ads/SidebarAd";

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebarAd?: boolean;
  adSlot?: string;
}

export default function DashboardLayout({ 
  children, 
  showSidebarAd = true,
  adSlot = "DASHBOARD_SIDEBAR_SLOT"
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Right Sidebar Ad */}
      {showSidebarAd && (
        <aside className="hidden xl:block w-[160px] shrink-0 p-4 border-l border-border bg-card/50">
          <div className="sticky top-4">
            <SidebarAd slot={adSlot} />
          </div>
        </aside>
      )}
    </div>
  );
}
