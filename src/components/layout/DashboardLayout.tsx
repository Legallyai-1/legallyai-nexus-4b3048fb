import { ReactNode } from "react";
import { ActiveOrganizationSwitcher } from "./ActiveOrganizationSwitcher";
import { MainLayout } from "./MainLayout";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Hub pages (Cases, Appointments, Payroll) share the hub shell: sidebar, search, tools launcher.
// Hubs are ad-free, so there is no ad rail here.
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <MainLayout>
      <div className="min-h-full min-w-0">
        {/* The header shows the organization switcher on large screens; show it here otherwise. */}
        <ActiveOrganizationSwitcher containerClassName="lg:hidden flex justify-end px-4 pt-3" />
        {children}
      </div>
    </MainLayout>
  );
}
