import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

// Public page shell. The document generator is reachable from the tools launcher, the menu and
// the home page, so there's no floating action button covering content any more.
export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    // Bottom padding keeps the footer and last content clear of the fixed mobile bottom nav.
    <div className="min-h-screen flex flex-col overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Navbar />
      <main className="flex-1 min-w-0 pt-16">
        {children}
      </main>
      {showFooter && <Footer />}
      <BottomNavigation />
    </div>
  );
}
