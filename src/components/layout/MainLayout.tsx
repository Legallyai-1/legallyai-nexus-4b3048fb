import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { ToolLauncher } from "./ToolLauncher";
import { HubBrand } from "@/components/brand/HubBrand";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, Settings, X } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ActiveOrganizationSwitcher } from "./ActiveOrganizationSwitcher";
import { getActiveOrganizationId, setActiveOrganizationId } from "@/lib/organizations";

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  /** Replaces the app-wide sidebar on desktop (e.g. the Business Hub section nav). The mobile drawer keeps the app nav. */
  sidebar?: React.ReactNode;
}

export function MainLayout({ children, showSidebar = true, showHeader = true, sidebar }: MainLayoutProps) {
  const [userRole, setUserRole] = useState<string>("client");
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Below md the search bar collapses to an icon; tapping it expands the field over the header row.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const closeMobileSearch = () => { setMobileSearchOpen(false); requestAnimationFrame(() => searchToggleRef.current?.focus()); };
  const navigate = useNavigate();

  useEffect(() => {
    if (mobileSearchOpen) searchInputRef.current?.focus();
  }, [mobileSearchOpen]);

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
        {sidebar ?? <AppSidebar userRole={userRole} />}
      </div>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {showHeader && (
          <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_8px_24px_-18px_hsl(218_45%_25%/0.5)]">
            <div className="relative flex h-16 items-center gap-1 px-2 sm:gap-2 sm:px-5">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger
                  aria-label="Open navigation"
                  className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white/70 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(43_95%_52%)]"
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
              <HubBrand className="md:hidden shrink-0 min-h-[44px] min-w-[44px] justify-center" compact />

              <form
                onSubmit={search}
                role="search"
                className={cn(
                  "min-w-0 items-center gap-1 md:static md:z-auto md:mx-auto md:flex md:max-w-2xl md:flex-1 md:bg-transparent md:p-0",
                  mobileSearchOpen ? "absolute inset-0 z-10 flex bg-white px-2" : "hidden",
                )}
                onKeyDown={(e) => { if (e.key === "Escape" && mobileSearchOpen) closeMobileSearch(); }}
              >
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search or ask Lee"
                    placeholder="Search or ask Lee about cases, laws and drafts..."
                    className="h-11 rounded-full border-slate-200 bg-white/80 pl-11 text-sm shadow-inner placeholder:text-muted-foreground/80 focus-visible:border-[hsl(43_80%_52%)] focus-visible:ring-[hsl(43_80%_52%/0.35)] focus-visible:ring-offset-0"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeMobileSearch}
                  className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(43_95%_52%)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>

              <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  ref={searchToggleRef}
                  type="button"
                  aria-label="Open search"
                  aria-expanded={mobileSearchOpen}
                  onClick={() => setMobileSearchOpen(true)}
                  className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(43_95%_52%)]"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                <ActiveOrganizationSwitcher containerClassName="hidden lg:block" />
                <ToolLauncher className="h-11 w-11 md:h-10 md:w-10 border-border bg-white/70 hover:bg-white" />
                <NotificationCenter triggerClassName="h-11 w-11 md:h-10 md:w-10 rounded-full" />
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Account menu"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full p-0.5 sm:pr-1.5 md:min-h-0 md:min-w-0 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(43_95%_52%)]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[hsl(46_95%_80%)] to-[hsl(40_88%_58%)] text-sm font-semibold text-[hsl(222_52%_12%)] shadow ring-2 ring-[hsl(43_95%_52%/0.7)]">
                        {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </span>
                      <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="hub-theme w-56">
                      <DropdownMenuLabel className="truncate font-normal text-xs text-muted-foreground">{user.email}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate("/dashboard")}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate("/settings")}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={async () => {
                          await supabase.auth.signOut();
                          toast.success("Logged out successfully");
                          navigate("/");
                        }}
                      ><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
