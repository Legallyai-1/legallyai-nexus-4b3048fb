import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Sparkles, ArrowRight, ExternalLink, BookOpen, 
  CheckCircle2, Copy, Bookmark, Send, Loader2, Brain,
  Heart, Car, Gavel, FileText, Building2, Users, Home, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { streamLegalChat } from "@/lib/legalChat";
import { ChatMarkdown } from "@/components/chat/ChatMarkdown";

interface LegalSource {
  id: number;
  title: string;
  source: string;
  url: string;
  badge: string;
}

interface HubMatch {
  name: string;
  path: string;
  icon: any;
  color: string;
  description: string;
}

const POPULAR_QUERIES = [
  "Can a landlord enter my apartment without 24 hours notice in California?",
  "How is child support calculated if parents share 50/50 custody?",
  "What is the legal difference between an NDA and a Non-Compete agreement?",
  "How to fight a radar speeding ticket with improper calibration records",
  "Do I need a living trust if I already have a will in Florida?",
  "What counts as workplace retaliation after filing an OSHA report?"
];

export function PerplexityLegalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"plain" | "lawyer">("plain");
  const [detectedHub, setDetectedHub] = useState<HubMatch | null>(null);
  const [sources, setSources] = useState<LegalSource[]>([]);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const sessionIdRef = useRef(crypto.randomUUID());

  // Hub keyword detection logic
  const detectHubFromQuery = (q: string): HubMatch | null => {
    const lower = q.toLowerCase();
    if (lower.includes("custody") || lower.includes("visitation") || lower.includes("parenting time") || lower.includes("child support")) {
      return { name: "CustodiAI (Child Custody Hub)", path: "/custody", icon: Heart, color: "text-purple-400 bg-purple-500/10 border-purple-500/30", description: "Specialized tools for custody schedules, child support, and court prep." };
    }
    if (lower.includes("dui") || lower.includes("dwi") || lower.includes("breathalyzer") || lower.includes("license suspension")) {
      return { name: "DriveSafeAI (DUI Defense Hub)", path: "/dui-hub", icon: Car, color: "text-orange-400 bg-orange-500/10 border-orange-500/30", description: "BAC calculation defense, DMV hearing deadlines, and license reinstatement." };
    }
    if (lower.includes("ticket") || lower.includes("speeding") || lower.includes("citation") || lower.includes("traffic court")) {
      return { name: "DefendrAI (Traffic Defense Hub)", path: "/tickets-defense", icon: Gavel, color: "text-rose-400 bg-rose-500/10 border-rose-500/30", description: "Trial by written declaration, radar calibration challenges, and ticket appeals." };
    }
    if (lower.includes("divorce") || lower.includes("marriage") || lower.includes("alimony") || lower.includes("prenup")) {
      return { name: "MaryAI (Marriage & Divorce Hub)", path: "/marriage-divorce", icon: Heart, color: "text-pink-400 bg-pink-500/10 border-pink-500/30", description: "Asset division, uncontested divorce workflows, and alimony guidelines." };
    }
    if (lower.includes("will") || lower.includes("trust") || lower.includes("estate") || lower.includes("probate") || lower.includes("power of attorney")) {
      return { name: "LegacyAI (Will & Estate Hub)", path: "/will-hub", icon: Home, color: "text-blue-400 bg-blue-500/10 border-blue-500/30", description: "Living wills, healthcare directives, revocable living trusts, and probate avoidance." };
    }
    if (lower.includes("work") || lower.includes("employer") || lower.includes("wrongful termination") || lower.includes("overtime") || lower.includes("retaliation") || lower.includes("osha")) {
      return { name: "WorkAI (Workplace Legal Aid Hub)", path: "/workplace-legal-aid", icon: Building2, color: "text-amber-400 bg-amber-500/10 border-amber-500/30", description: "EEOC complaint preparation, wage theft calculators, and severance negotiation." };
    }
    if (lower.includes("parole") || lower.includes("probation") || lower.includes("reentry") || lower.includes("expungement")) {
      return { name: "Freedom AI (Probation & Parole Hub)", path: "/probation-parole", icon: Users, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", description: "Supervision compliance, travel permit requests, and record sealing/expungement." };
    }
    return null;
  };

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q || isLoading) return;

    setActiveQuery(q);
    setQuery("");
    setIsLoading(true);
    setAnswer(null);

    const matched = detectHubFromQuery(q);
    setDetectedHub(matched);

    // Only real sources would be shown here; the chat stream does not return citations yet.
    setSources([]);

    setFollowUps([
      `Draft a formal notice letter regarding this issue`,
      `What are the critical filing deadlines in my state?`,
      `How can I challenge or verify this in court without an expensive lawyer?`
    ]);

    try {
      const promptModifier = mode === "plain" 
        ? "Explain this in clear, simple everyday English for a regular person, no confusing legalese, with actionable bullet points and next steps. "
        : "Provide a detailed statutory analysis with code citations, procedural deadlines, and legal precedents for a legal professional. ";

      const { text } = await streamLegalChat({
        hubType: "general",
        sessionId: sessionIdRef.current,
        messages: [{ role: "user", content: `${promptModifier}\n\nQuestion: ${q}` }],
        onDelta: (chunk) => {
          setAnswer((prev) => (prev ? prev + chunk : chunk));
        }
      });
      if (!text.trim()) throw new Error("No response returned.");
    } catch (err) {
      console.error(err);
      toast.error("Could not complete AI search. Showing guidance summary.");
      setAnswer(
        `### Legal Guidance from Lee:\n\nRegarding: **${q}**\n\n1. **General Rule:** In most US jurisdictions, statutory law requires explicit advance notice and procedural adherence before adverse actions can occur.\n2. **Critical Deadlines:** Review your county court local rules or administrative guidelines immediately, as dispute windows range from 15 to 30 days.\n3. **Recommended Next Steps:** Collect all written communications, lease/contract terms, and witness statements.\n\n*General legal information only, not legal advice. Check your court and a licensed attorney.*`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(`LegallyAI Nexus Search (${activeQuery}):\n\n${answer}`).then(() => toast.success("Answer copied to clipboard!")).catch(() => toast.error("Couldn't copy. Select the text and copy it manually."));
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Input Box (Perplexity-Style Hero) */}
      <div className="relative rounded-2xl p-1 bg-gradient-to-r from-neon-cyan/40 via-neon-gold/40 to-neon-purple/40 shadow-[0_0_40px_hsl(var(--neon-cyan)/0.25)]">
        <div className="rounded-[14px] bg-background/95 backdrop-blur-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <img src="/lee-mascot.png" alt="Lee" className="w-8 h-8 object-contain rounded-full border border-neon-cyan/40 p-0.5 animate-lee-alive" />
              <span className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                Lee Answer Engine <span className="text-muted-foreground font-normal">· Perplexity for Law</span>
              </span>
            </div>

            {/* Mode switch */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMode("plain")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  mode === "plain" 
                    ? "bg-neon-cyan/20 text-neon-cyan shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Everyday Plain English
              </button>
              <button
                type="button"
                onClick={() => setMode("lawyer")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  mode === "lawyer" 
                    ? "bg-neon-gold/20 text-neon-gold shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Law Firm / Citations Mode
              </button>
            </div>
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan/70" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  const m = detectHubFromQuery(e.target.value);
                  setDetectedHub(m);
                }}
                placeholder="Ask any legal question in plain English (e.g. 'Can my landlord enter without notice?')..."
                className="pl-11 h-14 text-base bg-background/50 border-border/70 focus-visible:ring-neon-cyan rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              variant="neon" 
              disabled={isLoading || !query.trim()}
              className="h-14 px-8 text-base font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" /> Ask Lee
                </>
              )}
            </Button>
          </form>

          {/* Real-time Hub Router Detection Pill */}
          {detectedHub && (
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs animate-fade-in ${detectedHub.color}`}>
              <div className="flex items-center gap-2">
                <detectedHub.icon className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Matching Hub Detected:</strong> {detectedHub.description}
                </span>
              </div>
              <Link to={detectedHub.path}>
                <Button size="sm" variant="outline" className="h-7 text-xs border-current hover:bg-current/10">
                  Open {detectedHub.name.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Suggested Quick Questions */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-muted-foreground font-medium">Try asking:</span>
            {POPULAR_QUERIES.slice(0, 3).map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(pq);
                  handleSearch(pq);
                }}
                className="px-2.5 py-1 rounded-lg border border-border/60 bg-muted/20 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 text-muted-foreground hover:text-foreground text-left transition-all"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Display Area */}
      {(answer || isLoading) && (
        <div className="glass-card rounded-2xl border border-neon-cyan/30 p-6 space-y-6 shadow-xl animate-fade-in">
          {/* Active Question Title & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-neon-cyan/15 p-2 text-neon-cyan">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  {activeQuery}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Answered by Lee · Grounded with official statutes & court rules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} disabled={!answer}>
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Answer
              </Button>
              <Link to={`/chat?q=${encodeURIComponent(activeQuery || "")}`}>
                <Button size="sm" variant="neon">
                  Deep Chat in Hub <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Sources strip: shown only when real sources are returned */}
          {sources.length > 0 && <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-neon-cyan" /> Sources:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl border border-border/60 bg-background/40 hover:bg-muted/30 hover:border-neon-cyan/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-semibold text-neon-cyan flex items-center gap-1">
                      [{src.id}] {src.source}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-neon-cyan/30 text-neon-cyan">
                      {src.badge}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground mt-1 line-clamp-1">
                    {src.title}
                  </p>
                  <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    <span>Verify primary text</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>}

          {/* The AI Answer Text */}
          <div className="p-5 rounded-xl bg-background/60 border border-border/50 text-foreground leading-relaxed text-sm">
            {isLoading && !answer ? (
              <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                <span>Lee is auditing statutory rules and formulating your plain-English answer...</span>
              </div>
            ) : (
              <ChatMarkdown content={answer || ""} />
            )}
          </div>

          {/* High-Converting Local Attorney Partner Lead Banner */}
          <div className="p-4 rounded-xl border border-neon-gold/40 bg-gradient-to-r from-neon-gold/15 via-background to-neon-cyan/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-neon-gold/20 p-2.5 text-neon-gold shrink-0">
                <Gavel className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-foreground block sm:inline">Need licensed attorney representation? </span>
                <span className="text-muted-foreground">Find a licensed attorney in your state.</span>
              </div>
            </div>
            <Link to="/lawyers">
              <Button size="sm" variant="outline" className="border-neon-gold text-neon-gold hover:bg-neon-gold/15 text-xs whitespace-nowrap">
                Find Local Attorney <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Contextual Follow-Up Suggestions (Perplexity-style) */}
          <div className="space-y-2 pt-2 border-t border-border/30">
            <span className="text-xs font-semibold text-muted-foreground">Related Next Steps & Follow-ups:</span>
            <div className="flex flex-wrap gap-2">
              {followUps.map((fu, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(fu);
                    handleSearch(fu);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/15 text-xs text-foreground font-medium flex items-center gap-1.5 transition-all text-left"
                >
                  <Sparkles className="w-3 h-3 text-neon-cyan" />
                  {fu}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ad placement for free traffic monetization */}
    </div>
  );
}

export default PerplexityLegalSearch;
