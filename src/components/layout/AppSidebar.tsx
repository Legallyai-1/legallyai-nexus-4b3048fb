import { useLocation, useNavigate } from "react-router-dom";
import { 
  Home, MessageSquare, FileText, Users, Calendar, Clock, 
  DollarSign, Briefcase, Shield, GraduationCap, Phone, 
  Headphones, Settings, LogOut, Scale, BarChart3, Gavel,
  Heart, Building2, Banknote, Search, Bell, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: number;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home, roles: ["owner", "admin", "manager", "lawyer", "paralegal"] },
      { title: "AI Assistants", href: "/ai-assistants", icon: MessageSquare },
      { title: "Generate Docs", href: "/generate", icon: FileText },
      { title: "Legal Chat", href: "/chat", icon: MessageSquare },
    ]
  },
  {
    title: "Law Firm",
    items: [
      { title: "Cases", href: "/cases", icon: Briefcase, roles: ["owner", "admin", "manager", "lawyer", "paralegal"] },
      { title: "Clients", href: "/clients", icon: Users, roles: ["owner", "admin", "manager", "lawyer"] },
      { title: "Appointments", href: "/appointments", icon: Calendar },
      { title: "Messages", href: "/messages", icon: MessageSquare },
      { title: "Invoices", href: "/invoices", icon: DollarSign, roles: ["owner", "admin", "manager"] },
    ]
  },
  {
    title: "Specialized AI",
    items: [
      { title: "Custody Helper", href: "/custody", icon: Heart },
      { title: "Tickets Defense", href: "/tickets-defense", icon: Gavel },
      { title: "Probation/Parole", href: "/probation-parole", icon: Shield },
      { title: "Workplace Rights", href: "/workplace-legal-aid", icon: Building2 },
    ]
  },
  {
    title: "Learning & Tools",
    items: [
      { title: "Legal Academy", href: "/legal-academy", icon: GraduationCap },
      { title: "Court Records", href: "/court-records", icon: Search },
      { title: "Templates", href: "/templates", icon: FileText },
      { title: "Pro Bono", href: "/pro-bono", icon: Heart },
    ]
  },
  {
    title: "Business",
    items: [
      { title: "Time Clock", href: "/timeclock", icon: Clock, roles: ["owner", "admin", "manager", "lawyer", "paralegal", "employee"] },
      { title: "Payroll", href: "/payroll", icon: DollarSign, roles: ["owner", "admin"] },
      { title: "Monetization", href: "/monetization", icon: BarChart3, roles: ["owner", "admin"] },
      { title: "Loans", href: "/loans", icon: Banknote },
      { title: "Job Board", href: "/jobs", icon: Briefcase },
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Telephony", href: "/telephony", icon: Phone },
      { title: "Support", href: "/support", icon: Headphones },
      { title: "Consultations", href: "/consultations", icon: Calendar },
    ]
  },
  {
    title: "Portals",
    items: [
      { title: "Client Portal", href: "/client-portal", icon: Users, roles: ["client"] },
      { title: "Employee Portal", href: "/employee", icon: Building2, roles: ["employee", "paralegal"] },
      { title: "Admin Panel", href: "/admin", icon: Shield, roles: ["owner", "admin"] },
    ]
  },
];

interface AppSidebarProps {
  userRole?: string;
  notificationCount?: number;
}

export function AppSidebar({ userRole = "client", notificationCount = 0 }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (href: string) => location.pathname === href;

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.roles || item.roles.includes(userRole) || userRole === "owner" || userRole === "admin"
    )
  })).filter(section => section.items.length > 0);

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-legal-gold" />
            <span className="font-display font-semibold text-lg">LegallyAI</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? "mx-auto" : ""}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        {filteredSections.map((section, idx) => (
          <div key={section.title} className={cn("px-3", idx > 0 && "mt-4")}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all",
                    isActive(item.href) 
                      ? "bg-legal-gold/20 text-legal-gold font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
