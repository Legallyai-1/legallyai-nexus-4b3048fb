import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeeAvatar } from "@/components/brand/LeeAvatar";

interface Props {
  userName?: string;
  userType?: "lawyer" | "individual";
  className?: string;
}

// "Ask Lee · AI Partner" side panel, matching the LegallyAI dashboard mockup:
// frosted panel, Lee mascot, suggested actions, voice-style input. Every hub assistant is Lee.
export function AskLeePanel({ userType = "lawyer", className = "" }: Props) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const suggestions = userType === "lawyer"
    ? ["Run conflict of laws audit", "Draft global master service agreement", "Summarize deadlines on my active cases"]
    : ["What should I do first about my case?", "Which forms do I need and where do I file?", "Find free legal aid near me"];

  const ask = (text?: string) => {
    const q = (text ?? question).trim();
    navigate(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  };

  return (
    <aside aria-labelledby="ask-lee-title" className={`glass-panel rounded-3xl p-4 sm:p-5 flex flex-col text-foreground ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="ask-lee-title" className="font-display text-lg font-semibold">Ask Lee <span className="text-muted-foreground">·</span> <span className="gold-text">AI Partner</span></h2>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />Online</span>
      </div>

      <div className="relative mt-3 flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[hsl(210_60%_92%/0.8)] to-transparent py-5">
        <div className="absolute inset-x-8 top-6 h-36 rounded-full bg-[hsl(45_90%_60%/0.25)] blur-3xl" aria-hidden="true" />
        <div className="relative mb-2 rounded-2xl rounded-bl-sm border border-border/70 bg-white/90 px-3 py-1.5 text-sm font-medium shadow-sm">How can I assist you today?</div>
        <LeeAvatar heightClass="h-44 sm:h-52" alt="Lee, the LegallyAI assistant, holding the scales of justice" />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="metal-card w-full rounded-2xl px-4 py-2.5 text-left text-sm leading-snug">
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex h-7 items-end justify-center gap-[3px]" aria-hidden="true">
        {[3, 6, 10, 16, 22, 28, 20, 12, 26, 18, 9, 14, 24, 30, 16, 8, 20, 12, 6, 3].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-gradient-to-t from-[hsl(36_85%_40%)] to-[hsl(46_95%_65%)]" style={{ height: `${Math.round(h * 0.85)}px` }} />
        ))}
      </div>

      <form className="mt-3 flex items-center gap-1.5 rounded-full border border-border bg-white/85 pl-4 pr-1.5 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-ring" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Lee anything..." aria-label="Ask Lee a legal question" maxLength={500} className="h-9 min-w-0 flex-1 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground" aria-label="Voice input (opens chat)" onClick={() => navigate("/chat")}><Mic className="h-4 w-4" /></Button>
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full gold-tile border-0" aria-label="Send to Lee"><Send className="h-4 w-4" /></Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Legal information, not legal advice. <Link to="/chat" className="underline underline-offset-2">Open full chat</Link></p>
    </aside>
  );
}

export default AskLeePanel;
