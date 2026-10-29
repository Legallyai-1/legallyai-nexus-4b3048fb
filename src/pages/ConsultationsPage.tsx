import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, ExternalLink, HeartHandshake, Info, MessageSquare } from "lucide-react";
import { AuthAwareLayout } from "@/components/layout/AuthAwareLayout";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

// LegallyAI is not a law firm and has no lawyer marketplace, so this page doesn't pretend to
// book lawyers. It helps people prepare for a consultation with Lee, points to real free and
// low-cost legal help, and sends signed-in firm teams to their Appointments calendar.
const TOPICS = ["Family / custody", "Divorce", "Housing / eviction", "Employment", "Criminal / traffic", "Wills and estates", "Business", "Other"];

export default function ConsultationsPage() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [state, setState] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSignedIn(Boolean(session?.user)));
  }, []);

  const prepare = (event: FormEvent) => {
    event.preventDefault();
    const where = state.trim() ? ` I'm in ${state.trim()}.` : "";
    const facts = summary.trim() ? ` Here's my situation: ${summary.trim()}` : "";
    const q = `Help me prepare for a consultation with a lawyer about ${topic.toLowerCase()}.${where}${facts} Give me a short summary to bring, the documents to gather, the questions I should ask, and what a consultation usually costs.`;
    navigate(`/chat?q=${encodeURIComponent(q)}`);
  };

  return (
    <AuthAwareLayout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-10 pb-6 sm:pt-16" aria-labelledby="consult-heading">
          <div className="container mx-auto max-w-5xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <GlowScales className="h-4 w-4" sparkles={false} /> Consultations
            </p>
            <h1 id="consult-heading" className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight">
              Get ready for a <span className="gold-text">lawyer consultation</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell Lee what's going on and get a one-page summary, a document checklist and the questions to ask, so your
              consultation time goes further.
            </p>
          </div>
        </section>

        {signedIn && (
          <section className="px-4 pb-2">
            <Link to="/appointments" className="container mx-auto max-w-3xl metal-card rounded-3xl p-5 flex items-center gap-4">
              <span className="metal-icon-well h-11 w-11 shrink-0"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold">Law firm team?</span>
                <span className="block text-sm text-[hsl(218_22%_30%)]">Schedule and manage client consultations in Appointments.</span>
              </span>
              <ArrowRight className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          </section>
        )}

        <section className="px-4 py-4" aria-labelledby="prep-heading">
          <form onSubmit={prepare} className="container mx-auto max-w-3xl glass-panel rounded-3xl p-6 space-y-4">
            <h2 id="prep-heading" className="font-display text-lg font-bold flex items-center gap-2">
              <MessageSquare className="metal-icon h-5 w-5" aria-hidden="true" /> Prepare with Lee
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="consult-topic">Topic</Label>
                <select
                  id="consult-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-white/80 px-3 py-2 text-sm"
                >
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="consult-state">State</Label>
                <Input id="consult-state" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Ohio" className="bg-white/80" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="consult-summary">What happened? (optional, no names or case numbers)</Label>
              <Textarea id="consult-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} maxLength={1500} className="bg-white/80" placeholder="A few sentences about your situation and what you want to happen." />
            </div>
            <Button type="submit" className="gap-1.5">
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Build my consultation prep
            </Button>
          </form>
        </section>

        <section className="px-4 py-6" aria-labelledby="find-heading">
          <div className="container mx-auto max-w-5xl">
            <h2 id="find-heading" className="font-display text-2xl font-bold mb-4">Find a lawyer</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <a href="https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help" target="_blank" rel="noopener noreferrer" className="metal-card rounded-3xl p-6 flex items-center gap-4">
                <span className="metal-icon-well h-12 w-12 shrink-0"><HeartHandshake className="h-6 w-6" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">Free civil legal aid (LSC)</span>
                  <span className="block text-sm text-[hsl(218_22%_30%)]">Legal Services Corporation's finder for federally funded legal aid near you.</span>
                </span>
                <ExternalLink className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
              </a>
              <Link to="/pro-bono" className="metal-card rounded-3xl p-6 flex items-center gap-4">
                <span className="metal-icon-well h-12 w-12 shrink-0"><HeartHandshake className="h-6 w-6" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold">Pro bono and low-cost help</span>
                  <span className="block text-sm text-[hsl(218_22%_30%)]">Bar referral services, legal aid and law school clinics, explained.</span>
                </span>
                <ArrowRight className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pt-2 pb-14">
          <aside className="container mx-auto max-w-5xl glass-panel rounded-3xl p-6 border-l-4 border-l-[hsl(43_95%_52%)]">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Info className="metal-icon h-5 w-5" aria-hidden="true" /> Please note
            </h2>
            <p className="mt-2 text-sm text-foreground/90">
              LegallyAI is a technology platform, not a law firm, and doesn't book or recommend specific lawyers. Lee gives legal
              information, not legal advice. If you have an urgent deadline, contact a licensed attorney right away.
            </p>
          </aside>
        </section>
      </div>
    </AuthAwareLayout>
  );
}
