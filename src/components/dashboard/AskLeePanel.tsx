import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeeAvatar, GoldWave } from "@/components/brand/LeeAvatar";

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
    <aside aria-labelledby="ask-lee-title" className={`lee-partner min-w-0 rounded-3xl p-4 sm:p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="ask-lee-title" className="font-display text-lg font-semibold">Ask Lee <span className="text-muted-foreground">·</span> <span className="lee-partner-title-accent">AI Legal Info Assistant</span></h2>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" aria-hidden="true" />Online</span>
      </div>

      <div className="relative mt-3 flex flex-1 flex-col items-center justify-center py-4">
        <LeeAvatar heightClass="h-44 sm:h-52" alt="Lee, the LegallyAI assistant, holding the scales of justice" />
        <p className="relative mt-3 font-display text-lg font-bold">Ask Lee <span className="text-muted-foreground">·</span> <span className="lee-partner-title-accent">AI Legal Info Assistant</span></p>
        <p className="relative text-sm text-muted-foreground">How can I assist you today?</p>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="lee-chip max-w-full">
            {s}
          </button>
        ))}
      </div>

      <GoldWave className="mt-4" />

      <form className="lee-partner-input mt-3 flex items-center gap-1.5 rounded-full pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-ring" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Lee anything..." aria-label="Ask Lee a legal question" maxLength={500} className="h-9 min-w-0 flex-1 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground" aria-label="Voice input (opens chat)" onClick={() => navigate("/chat")}><Mic className="h-4 w-4" /></Button>
        <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full gold-tile border-0" aria-label="Send to Lee"><Send className="h-4 w-4" /></Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Legal information, not legal advice. <Link to="/chat" className="underline underline-offset-2">Open full chat</Link></p>
    </aside>
  );
}

export default AskLeePanel;
