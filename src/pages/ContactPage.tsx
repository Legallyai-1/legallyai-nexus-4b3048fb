import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Headphones, Info, Mail, MessageSquare, Scale, ShieldAlert } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";

// Contact options. Only the support address already published across the site (Terms, Privacy,
// Pricing, Support) is used; there is no new form or backend.
const SUPPORT_EMAIL = "support@legallyai.ai";
const mailto = (subject: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

const channels = [
  {
    icon: Mail,
    title: "Account and general questions",
    description: "Sign-in trouble, settings, documents or anything else about using LegallyAI.",
    cta: "Email support",
    href: mailto("LegallyAI support request"),
  },
  {
    icon: CreditCard,
    title: "Billing and refunds",
    description: "Subscriptions, charges and refund requests. Refunds are reviewed case by case.",
    cta: "Email billing",
    href: mailto("LegallyAI billing question"),
  },
  {
    icon: Scale,
    title: "Law firms and demos",
    description: "Questions about Solo, Firm or Enterprise plans, seats, or a walkthrough of the firm hubs.",
    cta: "Ask about firm plans",
    href: mailto("LegallyAI firm demo"),
  },
];

export default function ContactPage() {
  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-10 pb-8 sm:pt-16" aria-labelledby="contact-heading">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <GlowScales className="h-4 w-4" sparkles={false} /> Contact
            </p>
            <h1 id="contact-heading" className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight">
              Get in touch with <span className="gold-text">LegallyAI</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Questions about your account, billing or firm plans? Email us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[hsl(36_85%_30%)] underline-offset-4 hover:underline break-all">
                {SUPPORT_EMAIL}
              </a>
              . For a legal question, Ask Lee is the fastest place to start.
            </p>
          </div>
        </section>

        <section className="px-4 py-6" aria-labelledby="channels-heading">
          <div className="container mx-auto max-w-5xl">
            <h2 id="channels-heading" className="sr-only">Ways to reach us</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {channels.map((channel) => (
                <article key={channel.title} className="metal-card rounded-3xl p-6 flex flex-col">
                  <span className="metal-icon-well h-11 w-11"><channel.icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-3 font-display text-lg font-bold">{channel.title}</h3>
                  <p className="mt-1 text-sm text-[hsl(218_22%_30%)] flex-1">{channel.description}</p>
                  <Button asChild variant="outline" className="mt-5 bg-white/70">
                    <a href={channel.href}><Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />{channel.cta}</a>
                  </Button>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Link to="/chat" className="metal-card rounded-3xl p-6 flex items-center gap-4" aria-label="Ask Lee a legal question">
                <span className="metal-icon-well h-12 w-12 shrink-0"><MessageSquare className="h-6 w-6" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">Have a legal question?</span>
                  <span className="block text-sm text-[hsl(218_22%_30%)]">Ask Lee in plain English and get next steps, forms and deadlines to check.</span>
                </span>
                <ArrowRight className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
              <Link to="/support" className="metal-card rounded-3xl p-6 flex items-center gap-4" aria-label="Open the support center">
                <span className="metal-icon-well h-12 w-12 shrink-0"><Headphones className="h-6 w-6" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">Support center</span>
                  <span className="block text-sm text-[hsl(218_22%_30%)]">Answers to common questions, plus AI help with your account once you sign in.</span>
                </span>
                <ArrowRight className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pt-6 pb-14" aria-labelledby="before-heading">
          <div className="container mx-auto max-w-5xl grid gap-4 md:grid-cols-2">
            <aside className="glass-panel rounded-3xl p-6 border-l-4 border-l-[hsl(43_95%_52%)]">
              <h2 id="before-heading" className="font-display text-lg font-bold flex items-center gap-2">
                <Info className="metal-icon h-5 w-5" aria-hidden="true" /> Before you write
              </h2>
              <p className="mt-2 text-sm text-foreground/90">
                LegallyAI is a technology platform, not a law firm. Our team can help with the product, but we can't give
                legal advice, and contacting us does not create an attorney-client relationship. Please don't email
                confidential case details.
              </p>
              <p className="mt-3 text-sm">
                See the <Link to="/disclaimer" className="underline font-medium">Legal Disclaimer</Link> and{" "}
                <Link to="/privacy" className="underline font-medium">Privacy Policy</Link>.
              </p>
            </aside>
            <aside className="glass-panel rounded-3xl p-6">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="metal-icon h-5 w-5" aria-hidden="true" /> Emergencies and deadlines
              </h2>
              <p className="mt-2 text-sm text-foreground/90">
                If you are in immediate danger, call your local emergency number. If you have an urgent legal deadline,
                contact a licensed attorney right away. For free or low-cost help, try our{" "}
                <Link to="/pro-bono" className="underline font-medium">Pro Bono and legal aid</Link> finder.
              </p>
            </aside>
          </div>
        </section>
      </div>
    </Layout>
  );
}
