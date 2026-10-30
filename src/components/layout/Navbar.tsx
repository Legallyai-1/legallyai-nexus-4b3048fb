import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeft, ArrowRight, MessageSquare, Briefcase } from "lucide-react";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActiveOrganizationSwitcher } from "./ActiveOrganizationSwitcher";
import { ToolLauncher } from "./ToolLauncher";

// Two audiences, two links: people who need legal help, and law firms.
const audienceLinks = [
  { name: "Get legal help", path: "/chat", icon: MessageSquare },
  { name: "For law firms", path: "/lawyers", icon: Briefcase },
];

// Everything else lives in the menu (and in the tools launcher).
const menuLinks = [
  { name: "Home", path: "/" },
  { name: "My cases", path: "/cases" },
  { name: "Document generator", path: "/generate" },
  { name: "AI assistants", path: "/ai-assistants" },
  { name: "Templates", path: "/templates" },
  { name: "Pricing", path: "/pricing" },
  { name: "Custody helper", path: "/custody" },
  { name: "Workplace legal aid", path: "/workplace-legal-aid" },
  { name: "Pro bono", path: "/pro-bono" },
  { name: "Client portal", path: "/client-portal" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setIsOpen(false), [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-background/70 backdrop-blur-xl border-b border-white/10">
        <nav aria-label="Main" className="container mx-auto px-3 sm:px-4 h-16 flex items-center gap-2">
          {location.pathname !== "/" && (
            <button
              type="button"
              onClick={() => {
                const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
                if (idx > 0) navigate(-1); else navigate("/");
              }}
              aria-label="Go back"
              data-testid="header-back"
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(43_75%_55%/0.6)] bg-white/80 text-foreground hover:bg-white"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 shrink-0 font-display font-bold text-lg sm:text-xl hover:opacity-90"
            aria-label="LegallyAI home"
          >
            <GlowScales className="h-7 w-7" />
            <span className="text-foreground">
              legally<span className="text-legal-gold">ai</span><span className="hidden sm:inline">.ai</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-4">
            {audienceLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={location.pathname === link.path ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-legal-gold/15 text-legal-gold ring-1 ring-legal-gold/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.name}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ActiveOrganizationSwitcher containerClassName="hidden xl:block" />
            <ToolLauncher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-white/5">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="hidden lg:inline-flex gold-tile border-0 font-semibold hover:brightness-105">
              <Link to="/signup">Start free</Link>
            </Button>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-foreground hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="site-menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {isOpen && (
        <>
          <button type="button" aria-label="Close menu" tabIndex={-1} className="fixed inset-0 top-16 bg-black/30" onClick={() => setIsOpen(false)} />
          <div id="site-menu" className="absolute right-0 top-16 w-full sm:w-80 sm:right-4 sm:top-[4.5rem] max-h-[calc(100dvh-5rem)] overflow-y-auto bg-background/95 backdrop-blur-xl border border-white/10 sm:rounded-2xl shadow-2xl animate-fade-in">
            <div className="p-4 flex flex-col gap-1">
              <div className="grid grid-cols-2 gap-2 mb-2 md:hidden">
                {audienceLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-legal-gold/40 bg-legal-gold/10 px-3 py-3 text-sm font-semibold text-legal-gold">
                    <link.icon className="h-4 w-4" aria-hidden="true" /> {link.name}
                  </Link>
                ))}
              </div>
              <ActiveOrganizationSwitcher className="px-2 xl:hidden" />
              {menuLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={location.pathname === link.path ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm",
                    location.pathname === link.path ? "bg-legal-gold/10 text-legal-gold font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => navigate(1)} aria-label="Go forward" className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /></button>
                <Link to="/login" className="ml-auto"><Button variant="outline" size="sm" className="bg-white/5 border-white/20">Sign in</Button></Link>
                <Link to="/signup"><Button size="sm" className="gold-tile border-0 font-semibold">Start free</Button></Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
