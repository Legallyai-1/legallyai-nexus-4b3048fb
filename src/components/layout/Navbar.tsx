import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Scale, Sparkles, Zap, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Generate", path: "/generate" },
  { name: "AI Assistants", path: "/ai-assistants" },
  { name: "Templates", path: "/templates" },
  { name: "For Lawyers", path: "/lawyers" },
  { name: "Pricing", path: "/pricing" },
];

const moreLinks = [
  { name: "Custody Helper", path: "/custody" },
  { name: "Workplace Legal Aid", path: "/workplace-legal-aid" },
  { name: "Pro Bono", path: "/pro-bono" },
  { name: "Job Board", path: "/jobs" },
  { name: "Client Portal", path: "/client-portal" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-legal-cyan to-transparent" />
      
      {/* Main navbar container */}
      <div className="bg-background/60 backdrop-blur-xl border-b border-white/10">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 bg-legal-gold/20 rounded-full blur-md group-hover:bg-legal-gold/40 transition-all duration-300" />
              <div className="relative bg-background/50 p-2 rounded-xl border border-legal-gold/30 group-hover:border-legal-gold/60 transition-all duration-300">
                <Scale className="h-6 w-6 text-legal-gold transition-transform group-hover:scale-110" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-legal-cyan animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold leading-none">
                <span className="text-foreground">Legally</span>
                <span className="text-legal-gold">AI</span>
              </span>
              <span className="text-[9px] text-legal-cyan/70 tracking-widest uppercase">Legal Intelligence</span>
            </div>
          </Link>

          {/* Back/Forward Navigation Buttons */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-muted-foreground hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleForward}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-muted-foreground hover:text-foreground"
              aria-label="Go forward"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-legal-cyan"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {location.pathname === link.path && (
                  <>
                    <div className="absolute inset-0 bg-legal-cyan/10 rounded-full" />
                    <div className="absolute inset-0 rounded-full border border-legal-cyan/30" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-legal-cyan shadow-[0_0_10px_hsl(var(--legal-cyan))]" />
                  </>
                )}
                <span className="relative">{link.name}</span>
              </Link>
            ))}
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-1">
                More <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link to={link.path} className="w-full cursor-pointer">
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button 
                size="sm"
                className="relative overflow-hidden bg-gradient-to-r from-legal-gold to-legal-gold/80 text-background hover:from-legal-gold/90 hover:to-legal-gold/70 border-0 shadow-[0_0_20px_hsl(var(--legal-gold)/0.3)]"
              >
                <Zap className="h-4 w-4 mr-1" />
                Get Started
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden relative p-2 text-foreground"
            aria-label="Toggle menu"
          >
            <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
            {isOpen ? <X className="relative h-6 w-6" /> : <Menu className="relative h-6 w-6" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 animate-fade-in">
          {/* Decorative grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="relative container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  "animate-fade-in",
                  location.pathname === link.path
                    ? "text-legal-cyan bg-legal-cyan/10 border border-legal-cyan/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {location.pathname === link.path && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-legal-cyan rounded-r-full shadow-[0_0_10px_hsl(var(--legal-cyan))]" />
                )}
                {link.name}
              </Link>
            ))}
            
            {/* More Links in Mobile */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground px-4 mb-2">More</p>
              {moreLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button 
                  className="w-full bg-gradient-to-r from-legal-gold to-legal-gold/80 text-background hover:from-legal-gold/90 hover:to-legal-gold/70"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
