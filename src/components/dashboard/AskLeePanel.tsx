import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <aside aria-labelledby="ask-lee-title" className={`glass-panel rounded-3xl p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <h2 id="ask-lee-title" className="font-display text-lg font-semibold text-white">Ask Lee <span className="text-white/50">·</span> <span className="gold-text">AI Partner</span></h2>
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" aria-label="Lee is online" />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-white/0 py-6">
        <div className="absolute inset-x-8 top-6 h-40 rounded-full bg-[hsl(45_90%_60%/0.18)] blur-3xl" aria-hidden="true" />
        <img src="/lee-mascot.png" alt="Lee, the LegallyAI assistant" width={240} height={360} className="relative w-44 sm:w-52 drop-shadow-[0_20px_40px_hsl(222_60%_5%/0.6)]" />
        <p className="relative mt-4 font-display text-xl font-semibold text-white">Ask Lee <span className="text-white/50">·</span> <span className="gold-text">AI Partner</span></p>
        <p className="relative text-sm text-white/70">Analyze case documents</p>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 hover:border-[hsl(45_90%_60%/0.6)] transition-colors">
            {s}
          </button>
        ))}
      </div>

      {/* Waveform accent */}
      <div className="mt-5 flex h-8 items-end justify-center gap-[3px]" aria-hidden="true">
        {[3, 6, 10, 16, 22, 28, 20, 12, 26, 18, 9, 14, 24, 30, 16, 8, 20, 12, 6, 3].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-gradient-to-t from-[hsl(40_90%_52%)] to-[hsl(46_95%_78%)] opacity-80" style={{ height: `${h}px` }} />
        ))}
      </div>

      <form className="mt-3 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 pl-4 pr-1 py-1" onSubmit={(e) => { e.preventDefault(); ask(); }}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type a message..." aria-label="Ask Lee a legal question" maxLength={500} className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none" />
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/10" aria-label="Voice input (opens chat)" onClick={() => navigate("/chat")}><Mic className="h-4 w-4" /></Button>
        <Button type="submit" size="icon" className="h-8 w-8 rounded-full gold-tile border-0" aria-label="Send to Lee"><Send className="h-4 w-4" /></Button>
      </form>
      <p className="mt-3 text-center text-[11px] text-white/50">Legal information, not legal advice.</p>
    </aside>
  );
}

export default AskLeePanel;
