import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showFab?: boolean;
}

export function Layout({ children, showFooter = true, showFab = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-20 lg:pb-0">
        {children}
      </main>
      {showFooter && <Footer />}
      <BottomNavigation />
      {showFab && <FloatingActionButton />}
    </div>
  );
}
