import { ReactNode } from "react";
import SidebarAd from "@/components/ads/SidebarAd";
import { ActiveOrganizationSwitcher } from "./ActiveOrganizationSwitcher";
import { MainLayout } from "./MainLayout";

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebarAd?: boolean;
  adSlot?: string;
}

// Hub pages (Cases, Appointments, Payroll) share the hub shell: sidebar, search, tools launcher.
export default function DashboardLayout({
  children,
  showSidebarAd = true,
  adSlot = "DASHBOARD_SIDEBAR_SLOT"
}: DashboardLayoutProps) {
  return (
    <MainLayout>
      <div className="flex min-h-full">
        <div className="flex-1 min-w-0">
          {/* The header shows the organization switcher on large screens; show it here otherwise. */}
          <ActiveOrganizationSwitcher containerClassName="lg:hidden flex justify-end px-4 pt-3" />
          {children}
        </div>

        {showSidebarAd && (
          <aside className="hidden xl:block w-[160px] shrink-0 p-4 border-l border-border/60" aria-label="Advertisement">
            <div className="sticky top-20">
              <SidebarAd slot={adSlot} />
            </div>
          </aside>
        )}
      </div>
    </MainLayout>
  );
}
