import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DO_NOT_SELL_ANCHOR, isGoogleCmpActive, showGooglePrivacyChoices } from "@/lib/consent";
import { GlowScales } from "@/components/brand/GlowScales";
import { Scale, Sparkles, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Document Generator", path: "/generate" },
    { name: "AI Assistants", path: "/ai-assistants" },
    { name: "Templates", path: "/templates" },
    { name: "Custody Helper", path: "/custody" },
    { name: "Pricing", path: "/pricing" },
  ],
  resources: [
    { name: "Workplace Legal Aid", path: "/workplace-legal-aid" },
    { name: "Pro Bono", path: "/pro-bono" },
    { name: "Job Board", path: "/jobs" },
    { name: "For Lawyers", path: "/lawyers" },
    { name: "Client Portal", path: "/client-portal" },
  ],
  legal: [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Disclaimer", path: "/disclaimer" },
    { name: "Do Not Sell or Share My Personal Information", path: `/privacy#${DO_NOT_SELL_ANCHOR}` },
  ],
};

// Google's consent tool loads with the AdSense script, so it can appear after the footer renders.
function useGoogleCmpAvailable() {
  const [available, setAvailable] = useState(() => isGoogleCmpActive());
  useEffect(() => {
    if (available) return;
    let checks = 0;
    const timer = window.setInterval(() => {
      checks += 1;
      if (isGoogleCmpActive()) setAvailable(true);
      if (isGoogleCmpActive() || checks >= 10) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [available]);
  return available;
}

export function Footer() {
  const googleCmpAvailable = useGoogleCmpAvailable();
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <GlowScales className="h-8 w-8 text-legal-gold" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-legal-cyan" />
              </div>
              <span className="font-display text-2xl font-bold">
                <span className="text-foreground">Legally</span>
                <span className="text-legal-gold">AI</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              AI-powered legal document generation and assistance. Get professional legal 
              documents in seconds, not hours.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@legallyai.ai</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-legal-gold">
              Product
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-legal-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-legal-gold">
              Resources
            </h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-legal-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4 text-legal-gold">
              Legal
            </h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-legal-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {googleCmpAvailable && (
                <li>
                  <button
                    type="button"
                    onClick={() => showGooglePrivacyChoices()}
                    className="text-left text-muted-foreground hover:text-legal-gold transition-colors"
                  >
                    Privacy choices
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LegallyAI. All rights reserved.
          </p>
          <p className="text-xs text-foreground/40 max-w-md text-center md:text-right">
            LegallyAI provides AI-generated legal templates for informational purposes only. 
            This is not legal advice. Consult a licensed attorney for legal matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
