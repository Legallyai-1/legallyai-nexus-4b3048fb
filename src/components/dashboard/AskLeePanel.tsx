import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileSearch, Gavel, Scale, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  userName?: string;
  userType?: "lawyer" | "individual";
}

// "Ask Lee · AI Partner" panel inspired by the LegallyAI dashboard mockup.
// Lee is the one in-house legal AI; every hub assistant is a version of Lee.
export function AskLeePanel({ userName = "there", userType = "lawyer" }: Props) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const prompts = userType === "lawyer"
    ? [
        { label: "Draft a client engagement letter", to: "/generate" },
        { label: "Summarize deadlines on my active cases", to: "/cases" },
        { label: "Research a statute in my state", to: "/chat" },
      ]
    : [
        { label: "What should I do first about my case?", to: "/chat" },
        { label: "Which forms do I need and where do I file?", to: "/chat" },
        { label: "Find free legal aid near me", to: "/pro-bono" },
      ];

  const ask = (text?: string) => {
    const q = (text ?? question).trim();
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  const workflows = [
    { icon: Gavel, title: "AI Document Drafting", text: "Letters, motions, agreements", to: "/generate" },
    { icon: Upload, title: "Document Review & Upload", text: "Upload a file for Lee to summarize", to: "/custody" },
    { icon: FileSearch, title: "Court & Statute Research", text: "Official sources for your state", to: "/court-records" },
  ];

  return (
    <section aria-labelledby="ask-lee-title" className="relative overflow-hidden rounded-2xl border border-legal-gold/30 bg-gradient-to-br from-[hsl(222_47%_9%)] via-[hsl(222_40%_12%)] to-[hsl(222_47%_9%)] p-6 shadow-[0_0_40px_hsl(var(--legal-gold)/0.08)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px] items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-legal-gold/80">Ask Lee · AI Partner</p>
          <h2 id="ask-lee-title" className="mt-1 text-2xl font-display font-bold text-foreground">Hi {userName}, what are we working on today?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Lee researches official sources for your state, drafts documents, and keeps every matter, deadline and appointment in one case file.</p>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(); }}>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Lee anything legal…" aria-label="Ask Lee a legal question" className="bg-background/60 border-legal-gold/30 focus-visible:ring-legal-gold" maxLength={500} />
            <Button type="submit" className="bg-legal-gold text-[hsl(222_47%_9%)] hover:bg-legal-gold/90 font-semibold" aria-label="Send to Lee"><Send className="h-4 w-4" /></Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button key={p.label} type="button" onClick={() => (p.to === "/chat" ? ask(p.label) : navigate(p.to))} className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-foreground hover:border-legal-gold/60 hover:bg-legal-gold/10 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <img src="/lee-mascot.png" alt="Lee, the LegallyAI assistant, waving" width={220} height={330} loading="lazy" className="drop-shadow-[0_0_30px_hsl(var(--legal-gold)/0.35)]" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {workflows.map((w) => (
          <button key={w.title} type="button" onClick={() => navigate(w.to)} className="group flex items-start gap-3 rounded-xl border border-border bg-background/40 p-4 text-left hover:border-legal-gold/60 hover:bg-legal-gold/5 transition-colors">
            <span className="rounded-lg bg-legal-gold/15 p-2 text-legal-gold"><w.icon className="h-5 w-5" aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{w.title}</span>
              <span className="block text-xs text-muted-foreground">{w.text}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-legal-gold transition-colors" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground"><Scale className="h-3 w-3" aria-hidden="true" /> Lee provides legal information, not legal advice. Review important matters with a licensed attorney.</p>
    </section>
  );
}

export default AskLeePanel;
