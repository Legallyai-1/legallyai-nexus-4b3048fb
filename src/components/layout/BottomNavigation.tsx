import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Bot, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Generate", path: "/generate", icon: FileText },
  { name: "AI", path: "/ai-assistants", icon: Bot },
  { name: "Jobs", path: "/jobs", icon: Briefcase },
  { name: "Account", path: "/dashboard", icon: User },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-legal-cyan/20 via-transparent to-transparent blur-xl" />
      
      {/* Main container */}
      <div className="relative bg-background/80 backdrop-blur-xl border-t border-legal-cyan/30">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                  isActive 
                    ? "text-legal-cyan" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-legal-cyan/10 rounded-xl" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-legal-cyan rounded-full shadow-[0_0_10px_hsl(var(--legal-cyan))]" />
                  </>
                )}
                
                {/* Icon container with animation */}
                <div className={cn(
                  "relative p-1.5 rounded-lg transition-all duration-300",
                  isActive && "animate-pulse"
                )}>
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "drop-shadow-[0_0_8px_hsl(var(--legal-cyan))]"
                    )} 
                  />
                  
                  {/* Orbiting dot for active state */}
                  {isActive && (
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                      <div className="absolute -top-0.5 left-1/2 w-1 h-1 bg-legal-cyan rounded-full shadow-[0_0_4px_hsl(var(--legal-cyan))]" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive && "text-legal-cyan"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Bottom safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-background/80" />
      </div>
    </nav>
  );
}
