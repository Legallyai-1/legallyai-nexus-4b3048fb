import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Bot, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Ask Lee", path: "/chat", icon: Bot },
  { name: "My cases", path: "/cases", icon: Briefcase },
  { name: "Docs", path: "/generate", icon: FileText },
  { name: "Account", path: "/dashboard", icon: User },
];

// Mobile-only tab bar. The browser/OS already provides back and forward, so the bar holds
// just the five main destinations, each at least 44px tall and wide.
export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav aria-label="Main" className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/90 backdrop-blur-xl border-t border-border/70 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5 px-1">
          {navItems.map((item) => {
            const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <li key={item.path} className="min-w-0">
                <Link
                  to={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-[56px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "text-legal-gold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive && <span aria-hidden="true" className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-legal-gold" />}
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="max-w-full truncate text-[11px] font-medium leading-tight">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomNavigation;
