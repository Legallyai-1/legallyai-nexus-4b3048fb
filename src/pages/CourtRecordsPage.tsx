import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ExternalLink, Info, Landmark, MessageSquare, Scale, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Official court-record portals. LegallyAI does not host or scrape court records; these
// links go straight to the courts' own search tools (each URL checked to load, Oct 29 2026).
interface Portal {
  name: string;
  description: string;
  href: string;
}

const federalPortals: Portal[] = [
  {
    name: "PACER",
    description: "Official U.S. federal court records: district, bankruptcy and appeals cases. Free account; small per-page fees, waived under $30 a quarter.",
    href: "https://pacer.uscourts.gov/",
  },
  {
    name: "PACER Case Locator",
    description: "Search every federal court at once by party name or case number.",
    href: "https://pcl.uscourts.gov/pcl/index.jsf",
  },
  {
    name: "CourtListener (Free Law Project)",
    description: "Free archive of federal dockets, filings and opinions collected from PACER.",
    href: "https://www.courtlistener.com/",
  },
  {
    name: "U.S. Supreme Court docket",
    description: "Look up Supreme Court cases and petitions by docket number or party.",
    href: "https://www.supremecourt.gov/docket/docket.aspx",
  },
];

const statePortals: Portal[] = [
  {
    name: "All 50 states: court websites directory",
    description: "National Center for State Courts directory of every state's official court site.",
    href: "https://www.ncsc.org/information-and-resources/state-court-websites",
  },
  { name: "California", description: "Find your county superior court and its case search.", href: "https://courts.ca.gov/find-your-court" },
  { name: "Florida", description: "How to get court records from Florida courts and county clerks.", href: "https://www.flcourts.gov/Resources-Services/Court-Records" },
  { name: "Illinois (re:SearchIL)", description: "Statewide search of Illinois circuit court filings.", href: "https://researchil.tylerhost.net/" },
  { name: "North Carolina (eCourts)", description: "Public portal for North Carolina court cases.", href: "https://portal-nc.tylertech.cloud/Portal/" },
  { name: "Oklahoma (OSCN)", description: "Oklahoma State Courts Network docket search.", href: "https://www.oscn.net/dockets/" },
  { name: "Oregon (OECI)", description: "Oregon Judicial Department public case access.", href: "https://publicaccess.courts.oregon.gov/" },
  { name: "Pennsylvania (UJS Portal)", description: "Search Pennsylvania court cases by docket, name or citation.", href: "https://ujsportal.pacourts.us/CaseSearch" },
  { name: "Texas (re:SearchTX)", description: "Search Texas court filings across participating counties.", href: "https://research.txcourts.gov/" },
  { name: "Washington (JIS-Link)", description: "Washington Courts case records access.", href: "https://www.courts.wa.gov/jislink/" },
];

function PortalCard({ portal }: { portal: Portal }) {
  return (
    <a
      href={portal.href}
      target="_blank"
      rel="noopener noreferrer"
      className="metal-card rounded-3xl p-5 flex flex-col gap-1 hover:-translate-y-0.5 transition-transform"
    >
      <span className="flex items-center justify-between gap-2 font-display font-bold">
        {portal.name}
        <ExternalLink className="metal-icon h-4 w-4 shrink-0" aria-hidden="true" />
      </span>
      <span className="text-sm text-[hsl(218_22%_30%)]">{portal.description}</span>
      <span className="sr-only">(opens the official site in a new tab)</span>
    </a>
  );
}

export default function CourtRecordsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const [what, setWhat] = useState("");

  const askLee = (event: FormEvent) => {
    event.preventDefault();
    const where = state.trim() ? ` in ${state.trim()}` : "";
    const detail = what.trim() ? ` I'm looking for: ${what.trim()}.` : "";
    const q = `How do I find and get copies of court records${where}? Which official court website or clerk's office should I use, and what will it cost?${detail}`;
    navigate(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-10 pb-6 sm:pt-16" aria-labelledby="records-heading">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <GlowScales className="h-4 w-4" sparkles={false} /> Court records
            </p>
            <h1 id="records-heading" className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight">
              Find <span className="gold-text">court records</span> at the source
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Look up cases, dockets and filings on official court portals, or ask Lee which court and clerk to use for your
              situation.
            </p>
          </div>
        </section>

        <section className="px-4 py-4" aria-labelledby="ask-heading">
          <form onSubmit={askLee} className="container mx-auto max-w-3xl glass-panel rounded-3xl p-6 grid gap-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <h2 id="ask-heading" className="sm:col-span-3 font-display text-lg font-bold flex items-center gap-2">
              <MessageSquare className="metal-icon h-5 w-5" aria-hidden="true" /> Not sure where to look? Ask Lee
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="records-state">State or county</Label>
              <Input id="records-state" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Travis County, TX" className="bg-white/80" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="records-what">What record do you need?</Label>
              <Input id="records-what" value={what} onChange={(e) => setWhat(e.target.value)} placeholder="e.g. my divorce decree, an eviction case" className="bg-white/80" />
            </div>
            <Button type="submit" className="gap-1.5">
              <Search className="h-4 w-4" aria-hidden="true" /> Ask Lee
            </Button>
          </form>
        </section>

        <section className="px-4 py-6" aria-labelledby="federal-heading">
          <div className="container mx-auto max-w-5xl">
            <h2 id="federal-heading" className="font-display text-2xl font-bold flex items-center gap-2 mb-4">
              <Landmark className="metal-icon h-6 w-6" aria-hidden="true" /> Federal courts
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {federalPortals.map((p) => <PortalCard key={p.href} portal={p} />)}
            </div>
          </div>
        </section>

        <section className="px-4 py-6" aria-labelledby="state-heading">
          <div className="container mx-auto max-w-5xl">
            <h2 id="state-heading" className="font-display text-2xl font-bold flex items-center gap-2 mb-4">
              <Scale className="metal-icon h-6 w-6" aria-hidden="true" /> State and county courts
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Most cases (family, eviction, traffic, small claims, criminal) are in state court. Records are usually kept by the
              county clerk; start with the statewide directory if your state isn't listed.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statePortals.map((p) => <PortalCard key={p.href} portal={p} />)}
            </div>
          </div>
        </section>

        <section className="px-4 pt-6 pb-14">
          <div className="container mx-auto max-w-5xl grid gap-4 md:grid-cols-2">
            <aside className="glass-panel rounded-3xl p-6 border-l-4 border-l-[hsl(43_95%_52%)]">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Info className="metal-icon h-5 w-5" aria-hidden="true" /> Good to know
              </h2>
              <ul className="mt-2 text-sm text-foreground/90 list-disc pl-5 space-y-1">
                <li>These are official or nonprofit sites; LegallyAI doesn't store or sell court records.</li>
                <li>Sealed, juvenile and some family cases aren't public. The clerk's office can tell you what you can access.</li>
                <li>Certified copies usually have to be ordered from the clerk, often for a small fee.</li>
              </ul>
            </aside>
            <Link to="/guides/small-claims-court-step-by-step" className="metal-card rounded-3xl p-6 flex items-center gap-4">
              <span className="metal-icon-well h-12 w-12 shrink-0"><Scale className="h-6 w-6" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold">Going to court yourself?</span>
                <span className="block text-sm text-[hsl(218_22%_30%)]">Read our step-by-step small claims guide, then ask Lee about your case.</span>
              </span>
              <ArrowRight className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
