import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, Check, FileSearch, Info, Lock, MessageSquare, Scale, UserCheck } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";
import { TOOL_CATALOG } from "@/lib/toolCatalog";
import { TOOL_ICONS } from "@/components/layout/toolIcons";

// About LegallyAI. Plain facts about the product only: no stats, testimonials, logos, team or dates.
const publicPoints = [
  "Ask legal questions in plain English and get next steps to check",
  "Draft letters, agreements and court forms, then review and edit them",
  "Topic hubs for custody, divorce, tickets, DUI, probation, wills and work",
  "Find legal aid and court resources when you need a person",
];

const firmPoints = [
  "Case files, client portal and deadlines in one workspace",
  "AI drafting, contract redlines and research with sources",
  "Billing, time tracking and trust accounting in the Business Hub",
  "Plans sized for solo attorneys, firms and enterprise teams",
];

const principles = [
  { icon: MessageSquare, title: "Plain English first", description: "Lee explains legal steps without jargon, so you know what to ask and what to check." },
  { icon: BookOpenCheck, title: "Point to the source", description: "Research answers link to official sources wherever possible, so you can verify them yourself." },
  { icon: UserCheck, title: "You stay in control", description: "Every draft is a starting point. Review it, edit it, and have an attorney check it before you rely on it." },
  { icon: Lock, title: "Respect for your data", description: "Card payments go through Stripe, and our Privacy Policy explains what we collect and why." },
];

const hubs = TOOL_CATALOG.filter((t) => t.group === "Legal help hubs" || t.featured).slice(0, 9);

export default function AboutPage() {
  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-10 pb-10 sm:pt-16" aria-labelledby="about-heading">
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-8 items-center">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <GlowScales className="h-4 w-4" sparkles={false} /> About LegallyAI
              </p>
              <h1 id="about-heading" className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight break-words">
                Legal help in plain English, <span className="gold-text">for people and the firms that serve them</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                LegallyAI has two sides. Ask Lee is an AI assistant for everyday people handling their own legal matters.
                The firm hubs give law practices of every size one AI workspace for cases, clients, drafting and billing.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="gold-tile border-0 font-semibold">
                  <Link to="/chat">Ask Lee a question <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/70">
                  <Link to="/lawyers"><Scale className="mr-1.5 h-4 w-4" aria-hidden="true" />For law firms</Link>
                </Button>
              </div>
            </div>
            <img
              src="/lee-mascot.png"
              alt="Lee, the LegallyAI assistant, holding the scales of justice"
              width={320}
              height={480}
              loading="lazy"
              className="hidden lg:block mx-auto h-80 w-auto animate-lee-alive"
            />
          </div>
        </section>

        <section className="px-4 py-8" aria-labelledby="sides-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="sides-heading" className="font-display text-2xl sm:text-3xl font-bold">What LegallyAI does</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="glass-panel rounded-3xl p-6 flex flex-col">
                <span className="metal-icon-well h-11 w-11"><MessageSquare className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-3 font-display text-xl font-bold">Ask Lee, for everyday people</h3>
                <p className="mt-1 text-sm text-muted-foreground">For anyone handling a legal matter on their own, from a lease dispute to a custody hearing.</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {publicPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm"><Check className="metal-icon mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{point}</li>
                  ))}
                </ul>
                <Link to="/chat" className="mt-5 inline-flex items-center gap-1 font-semibold text-[hsl(36_85%_30%)] hover:underline">
                  Start with Ask Lee <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
              <article className="glass-panel rounded-3xl p-6 flex flex-col">
                <span className="metal-icon-well h-11 w-11"><Scale className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-3 font-display text-xl font-bold">Hubs for law firms</h3>
                <p className="mt-1 text-sm text-muted-foreground">Solo, Firm and Enterprise plans for attorneys, paralegals and legal teams.</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {firmPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm"><Check className="metal-icon mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{point}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  <Link to="/lawyers" className="inline-flex items-center gap-1 font-semibold text-[hsl(36_85%_30%)] hover:underline">
                    Explore the firm hubs <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link to="/pricing#firm-plans" className="inline-flex items-center gap-1 font-semibold text-[hsl(36_85%_30%)] hover:underline">
                    See firm plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 py-8" aria-labelledby="tools-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="tools-heading" className="font-display text-2xl sm:text-3xl font-bold">Tools and help hubs</h2>
            <p className="mt-1 text-muted-foreground">Every tool is also one tap away from the apps launcher at the top of each page.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hubs.map((tool) => {
                const Icon = TOOL_ICONS[tool.icon];
                return (
                  <Link key={tool.path} to={tool.path} className="metal-card rounded-2xl p-4 flex items-center gap-3">
                    <span className="metal-icon-well h-10 w-10 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{tool.title}</span>
                      <span className="block text-sm text-[hsl(218_22%_30%)]">{tool.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-8" aria-labelledby="principles-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="principles-heading" className="font-display text-2xl sm:text-3xl font-bold">How we build it</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {principles.map((item) => (
                <div key={item.title} className="glass-panel rounded-2xl p-4">
                  <item.icon className="metal-icon h-5 w-5" aria-hidden="true" />
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pt-8 pb-14" aria-labelledby="disclaimer-heading">
          <div className="container mx-auto max-w-6xl grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
            <aside className="glass-panel rounded-3xl p-6 border-l-4 border-l-[hsl(43_95%_52%)]">
              <h2 id="disclaimer-heading" className="font-display text-xl font-bold flex items-center gap-2">
                <Info className="metal-icon h-5 w-5" aria-hidden="true" /> Legal information, not legal advice
              </h2>
              <p className="mt-2 text-sm text-foreground/90">
                LegallyAI is a technology platform, not a law firm. Lee's answers and the documents LegallyAI produces are
                general legal information, not legal advice, and using LegallyAI does not create an attorney-client
                relationship. AI output can be incomplete or wrong, and laws differ by state and court. Have a licensed
                attorney in your jurisdiction review anything before you sign, file or rely on it.
              </p>
              <p className="mt-3 text-sm">
                Read the full <Link to="/disclaimer" className="underline font-medium">Legal Disclaimer</Link>,{" "}
                <Link to="/terms" className="underline font-medium">Terms of Service</Link> and{" "}
                <Link to="/privacy" className="underline font-medium">Privacy Policy</Link>.
              </p>
            </aside>
            <div className="metal-card rounded-3xl p-6 flex flex-col justify-center">
              <span className="metal-icon-well h-10 w-10"><FileSearch className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-3 font-display text-xl font-bold">Questions about LegallyAI?</h2>
              <p className="mt-1 text-sm text-[hsl(218_22%_30%)]">Reach the team about your account, billing or firm plans.</p>
              <Button asChild className="mt-4 gold-tile border-0 font-semibold w-full sm:w-auto">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
