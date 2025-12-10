import { Link } from "react-router-dom";
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
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="relative">
                <Scale className="h-8 w-8 text-legal-gold" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-legal-cyan" />
              </div>
              <span className="font-display text-2xl font-bold">
                <span className="text-primary-foreground">Legally</span>
                <span className="text-legal-gold">AI</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              AI-powered legal document generation and assistance. Get professional legal 
              documents in seconds, not hours.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@legallyai.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1-800-LEGALLY</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
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
                    className="text-primary-foreground/70 hover:text-legal-gold transition-colors"
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
                    className="text-primary-foreground/70 hover:text-legal-gold transition-colors"
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
                    className="text-primary-foreground/70 hover:text-legal-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} LegallyAI. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40 max-w-md text-center md:text-right">
            LegallyAI provides AI-generated legal templates for informational purposes only. 
            This is not legal advice. Consult a licensed attorney for legal matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
