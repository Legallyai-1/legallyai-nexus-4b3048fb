import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function MainLayout({ children, showSidebar = true, showHeader = true }: MainLayoutProps) {
  const [userRole, setUserRole] = useState<string>("client");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleData?.role) {
        setUserRole(roleData.role);
      }
    };

    loadUserRole();
  }, []);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar userRole={userRole} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {showHeader && (
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search cases, clients, documents..." 
                  className="pl-10 h-9"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter />
              {user && (
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="w-8 h-8 rounded-full bg-legal-gold/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-legal-gold">
                      {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </header>
        )}
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
