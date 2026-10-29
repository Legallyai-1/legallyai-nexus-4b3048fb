// Per-route search and share metadata. Pure data so it can be unit tested without a browser.
export const SITE_URL = "https://www.legallyai.ai";
export const SITE_NAME = "LegallyAI";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface RouteSeo {
  title: string;
  description: string;
  /** Listed in sitemap.xml and indexable. Private app screens are noindex. */
  indexable: boolean;
}

const pub = (title: string, description: string): RouteSeo => ({ title, description, indexable: true });
const app = (title: string): RouteSeo => ({
  title,
  description: "Sign in to LegallyAI to manage your cases, documents and firm with Lee, your AI legal partner.",
  indexable: false,
});

export const DEFAULT_SEO: RouteSeo = pub(
  "LegallyAI – Ask Lee, your AI legal partner",
  "Get legal help from Lee, organize your case and draft documents, plus an AI workspace for law firms. Legal information, not legal advice.",
);

export const ROUTE_SEO: Record<string, RouteSeo> = {
  "/": DEFAULT_SEO,
  "/chat": pub("Ask Lee – free AI legal help | LegallyAI", "Ask Lee a legal question in plain English and get next steps, forms and deadlines to check. Legal information, not legal advice."),
  "/lawyers": pub("AI for law firms, solo to enterprise | LegallyAI", "Case files, client portal, AI drafting, contract redlines, research, billing and trust accounting in one workspace for your firm."),
  "/pricing": pub("Pricing – free, Premium and Firm plans | LegallyAI", "Start free with Lee. Premium is $9.99/mo, documents $5, Firm $99/mo with a 7-day trial on your first subscription. Solo and Enterprise: waitlist."),
  "/generate": pub("AI legal document generator | LegallyAI", "Draft letters, motions, agreements and court forms with Lee, then review and edit before you file or send."),
  "/contract-review": pub("AI contract review and redline | LegallyAI", "Paste a lease, NDA or employment agreement. Lee flags risky clauses and suggests fairer wording you can export."),
  "/settlement-estimator": pub("Settlement estimator | LegallyAI", "Get a rough settlement range for your claim from the details you enter, with the factors that move the number."),
  "/research": pub("AI legal research with sources | LegallyAI", "Search laws and court rules in plain English and get answers with links to the official sources."),
  "/templates": pub("Legal document templates | LegallyAI", "Browse ready-to-edit legal templates for common situations and fill them in with help from Lee."),
  "/ai-assistants": pub("AI legal assistants for every situation | LegallyAI", "AI assistants for custody, divorce, traffic tickets, DUI, probation, wills and workplace issues."),
  "/custody": pub("Child custody help | LegallyAI", "Understand custody options, prepare parenting plans and get ready for hearings with step-by-step help from Lee."),
  "/tickets-defense": pub("Traffic ticket defense help | LegallyAI", "Learn your options for a traffic ticket, prepare your defense and get ready for court with Lee."),
  "/dui-hub": pub("DUI help and court prep | LegallyAI", "Understand DUI charges, deadlines and court steps, and prepare questions for your attorney with Lee."),
  "/probation-parole": pub("Probation and parole help | LegallyAI", "Track conditions, deadlines and hearings, and prepare for probation or parole meetings with Lee."),
  "/workplace-legal-aid": pub("Workplace legal help | LegallyAI", "Get help with wages, discrimination, leave and wrongful termination questions, and organize your evidence."),
  "/will-hub": pub("Wills and estate planning help | LegallyAI", "Plan a will, understand estate basics and prepare documents to review with Lee's help."),
  "/marriage-divorce": pub("Marriage and divorce help | LegallyAI", "Understand divorce steps, forms and timelines, and prepare for each stage with help from Lee."),
  "/court-records": pub("Court records and filing help | LegallyAI", "Find where to look up court records and how to prepare and file the paperwork for your case."),
  "/legal-academy": pub("Legal Academy – learn law with AI | LegallyAI", "Short courses and AI tutoring that explain legal basics in plain English."),
  "/pro-bono": pub("Free and low-cost legal aid | LegallyAI", "Find pro bono and legal aid resources and prepare your case before you reach out."),
  // Noindex until the job board is live (page is a placeholder).
  "/jobs": { title: "Legal job board | LegallyAI", description: "Browse legal jobs for attorneys, paralegals and legal staff.", indexable: false },
  "/support": pub("Support | LegallyAI", "Get help with your LegallyAI account, billing or features from the support team."),
  "/terms": pub("Terms of service | LegallyAI", "The terms that apply when you use LegallyAI and Lee, the AI legal assistant."),
  "/privacy": pub("Privacy policy | LegallyAI", "How LegallyAI collects, uses and protects your information."),
  "/disclaimer": pub("Legal disclaimer | LegallyAI", "LegallyAI and Lee provide legal information, not legal advice. Read what that means for you."),
  "/signup": pub("Create your free account | LegallyAI", "Sign up free to save your case, documents and conversations with Lee."),
  "/login": app("Sign in | LegallyAI"),
  "/dashboard": app("Dashboard | LegallyAI"),
  "/business-hub": app("Business Hub | LegallyAI"),
  "/cases": app("My cases | LegallyAI"),
  "/clients": app("Clients | LegallyAI"),
  "/settings": app("Settings | LegallyAI"),
  "/appointments": app("Appointments | LegallyAI"),
  "/invoices": app("Invoices | LegallyAI"),
  "/payroll": app("Payroll | LegallyAI"),
};

export function getRouteSeo(pathname: string): RouteSeo & { canonical: string } {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const seo = ROUTE_SEO[path] ?? { ...DEFAULT_SEO, title: SITE_NAME + " – AI legal help", indexable: false };
  return { ...seo, canonical: `${SITE_URL}${path === "/" ? "/" : path}` };
}

export const SITEMAP_PATHS = Object.entries(ROUTE_SEO).filter(([, v]) => v.indexable).map(([k]) => k);
