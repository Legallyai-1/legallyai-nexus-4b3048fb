import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { ToolLauncher } from "./ToolLauncher";
import { HubBrand } from "@/components/brand/HubBrand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActiveOrganizationSwitcher } from "./ActiveOrganizationSwitcher";
import { getActiveOrganizationId, setActiveOrganizationId } from "@/lib/organizations";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export function MainLayout({ children, showSidebar = true, showHeader = true }: MainLayoutProps) {
  const [userRole, setUserRole] = useState<string>("client");
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);

      // Get user role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role, organization_id")
        .eq("user_id", user.id);

      if (error) return;

      const activeOrganizationId = getActiveOrganizationId();
      const roleData = activeOrganizationId
        ? roles?.find(({ organization_id }) => organization_id === activeOrganizationId)
        : roles?.length === 1
          ? roles[0]
          : null;

      if (roleData?.role) {
        if (!activeOrganizationId && roleData.organization_id) {
          setActiveOrganizationId(roleData.organization_id);
        }
        setUserRole(roleData.role);
      }
    };

    loadUserRole();
  }, []);

  if (!showSidebar) {
    return <div className="hub-theme hub-bg min-h-screen">{children}</div>;
  }

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  return (
    <div className="hub-theme hub-bg min-h-screen flex w-full text-foreground">
      <div className="hidden md:flex">
        <AppSidebar userRole={userRole} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {showHeader && (
          <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_-18px_hsl(218_45%_25%/0.5)]">
            <div className="flex h-16 items-center gap-2 px-3 sm:px-5">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger
                  aria-label="Open navigation"
                  className="md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-white/70 text-foreground"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </SheetTrigger>
                <SheetContent side="left" className="hub-theme w-72 p-0 border-r-0 bg-transparent">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <div onClick={(e) => { if ((e.target as HTMLElement).closest("button[data-nav-item]")) setMobileNavOpen(false); }}>
                    <AppSidebar userRole={userRole} />
                  </div>
                </SheetContent>
              </Sheet>
              <HubBrand className="md:hidden shrink-0" compact />

              <form onSubmit={search} role="search" className="relative min-w-0 flex-1 max-w-2xl">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search or ask Lee"
                  placeholder="Search or ask Lee about cases, laws and drafts..."
                  className="h-10 rounded-full border-white/80 bg-white/80 pl-10 text-sm shadow-inner placeholder:text-muted-foreground/80"
                />
              </form>

              <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                <ActiveOrganizationSwitcher containerClassName="hidden lg:block" />
                <ToolLauncher className="border-border bg-white/70 hover:bg-white" />
                <NotificationCenter />
                {user && (
                  <span
                    className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[hsl(46_95%_80%)] to-[hsl(40_88%_58%)] text-sm font-semibold text-[hsl(222_52%_12%)] shadow"
                    aria-label="Signed in"
                  >
                    {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 min-w-0 overflow-x-clip">
          {children}
        </main>
      </div>
    </div>
  );
}
