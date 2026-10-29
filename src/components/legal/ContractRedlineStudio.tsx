import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldAlert, ShieldCheck, FileCheck, ArrowRight, Sparkles, 
  AlertTriangle, Copy, Check, Download, FileText
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RedlineClause {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  original: string;
  recommended: string;
  explanation: string;
}

const SAMPLE_CONTRACT = `4. Intellectual Property & Non-Compete:
The Contractor agrees that all ideas, inventions, and works created at any time during the term of this Agreement shall belong solely and exclusively to the Client. Furthermore, for a period of twenty-four (24) months following termination, the Contractor shall not provide any services to any entity in the same industry anywhere in North America.

7. Indemnification & Liability:
The Contractor shall indemnify, defend, and hold harmless the Client from any and all damages, claims, or losses arising from this Agreement. The Contractor's liability under this Agreement shall be unlimited.

11. Termination:
The Client may terminate this Agreement immediately without cause. The Contractor may terminate only upon ninety (90) days written notice.`;

const REVIEW_LIMIT = 2000; // matches the chat hand-off limit

export function ContractRedlineStudio() {
  const [contractText, setContractText] = useState(SAMPLE_CONTRACT);
  const navigate = useNavigate();
  const isSample = contractText.trim() === SAMPLE_CONTRACT.trim();
  // The clause cards below are a worked example for the sample agreement only.
  const analyzed = isSample;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const riskScore = 84; // example score for the sample agreement
  const clauses: RedlineClause[] = [
    {
      id: "non-compete",
      title: "Overly Broad 24-Month Non-Compete",
      severity: "high",
      original: "for a period of twenty-four (24) months following termination, the Contractor shall not provide any services to any entity in the same industry anywhere in North America.",
      recommended: "for a period of six (6) months following termination, the Contractor shall not directly solicit the Client's active accounts with whom Contractor personally worked during the term.",
      explanation: "A 24-month nationwide ban on an independent contractor is often legally unenforceable in many states (and strictly void in California, Minnesota, etc.), and severely restricts your ability to earn a living."
    },
    {
      id: "unlimited-liability",
      title: "One-Sided Unlimited Indemnification",
      severity: "high",
      original: "The Contractor's liability under this Agreement shall be unlimited.",
      recommended: "Each party's maximum aggregate liability shall be capped at the total fees paid or payable to Contractor under this Agreement in the preceding six (6) months, except for gross negligence or willful misconduct.",
      explanation: "Unlimited liability exposes your personal and business assets to catastrophic risk. Standard industry practice requires mutual indemnification and an aggregate liability cap."
    },
    {
      id: "termination-imbalance",
      title: "Asymmetric Termination Notice",
      severity: "medium",
      original: "The Client may terminate immediately without cause. The Contractor may terminate only upon ninety (90) days written notice.",
      recommended: "Either party may terminate this Agreement without cause upon providing thirty (30) days prior written notice to the other party.",
      explanation: "90 days binds you to work while the client can drop you overnight. Equal 30-day notice is standard and fair."
    }
  ];

  const handleAnalyze = () => {
    if (!contractText.trim()) {
      toast.error("Please paste or upload a contract to analyze.");
      return;
    }
    if (isSample) {
      document.getElementById("redline-sample-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    // Real review: hand the user's text to Lee in the chat.
    const prompt = `Review this contract clause by clause. Flag one-sided or risky terms, explain why in plain English, and suggest fairer wording:\n\n`;
    const room = REVIEW_LIMIT - prompt.length;
    const text = contractText.trim();
    if (text.length > room) toast.info(`Lee will review the first ${room.toLocaleString()} characters. Paste the rest as a follow-up.`);
    navigate(`/chat?q=${encodeURIComponent(prompt + text.slice(0, room))}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Clause copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const report = `LEGALLYAI - SAMPLE CONTRACT REDLINE (example agreement)\nLegal information, not legal advice.\nExample risk score: ${riskScore}/100\n\n` +
      clauses.map(c => `[${c.severity.toUpperCase()} RISK] ${c.title}\nORIGINAL: ${c.original}\nRECOMMENDED: ${c.recommended}\nWHY: ${c.explanation}\n\n`).join("\n");
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LegallyAI_Contract_Redline_Report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Redline report downloaded!");
  };

  return (
    <Card className="glass-card border-neon-cyan/30 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.15)] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-neon-cyan/15 via-neon-purple/10 to-transparent border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="hidden sm:block shrink-0 rounded-xl bg-neon-cyan/20 p-2 text-neon-cyan">
              <FileCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl font-display flex flex-wrap items-center gap-x-2 gap-y-1 leading-snug">
                AI Contract Redline & Risk Analyzer
                <Badge className="bg-legal-gold/15 text-legal-gold border-legal-gold/40 text-xs whitespace-nowrap">
                  <Sparkles className="w-3 h-3 mr-1" /> AI redline
                </Badge>
              </CardTitle>
              <CardDescription>
                Paste any lease, NDA, employment, or freelance agreement. Lee highlights aggressive clauses and rewrites them into fair legal language.
              </CardDescription>
            </div>
          </div>
          {analyzed && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1.5" /> Export Redlines
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 shrink-0 text-neon-cyan" /> Paste your contract
            </label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setContractText(SAMPLE_CONTRACT)}
            >
              Reset to Sample Agreement
            </Button>
          </div>
          <Textarea 
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            rows={5}
            className="font-mono text-xs leading-relaxed bg-background/60 border-border/60 focus-visible:ring-neon-cyan"
            placeholder="Paste your contract clauses here..."
          />
          <div className="flex justify-end">
            <Button variant="neon" onClick={handleAnalyze} className="px-6">
              <Sparkles className="w-4 h-4 mr-2" /> {isSample ? "See the sample redline" : "Review my contract with Lee"}
            </Button>
          </div>
        </div>

        {!isSample && (
          <p className="text-sm text-muted-foreground">Lee will review your text in the chat, flag risky clauses and suggest fairer wording. The worked example below appears only for the sample agreement.</p>
        )}
        {analyzed && (
          <div id="redline-sample-results" className="space-y-6 pt-4 border-t border-border/40 animate-fade-in scroll-mt-20">
            <p role="note" className="rounded-lg border border-legal-gold/40 bg-legal-gold/10 px-3 py-2 text-sm">
              <strong>Sample analysis</strong> of the example agreement above, to show what a review looks like. Paste your own contract and choose &ldquo;Review my contract with Lee&rdquo; for a review of your text.
            </p>
            {/* Risk Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 flex items-center gap-4">
                <div className="rounded-full bg-destructive/20 p-3 text-destructive">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Example risk score</div>
                  <div className="text-2xl font-bold text-destructive font-display">{riskScore}/100</div>
                  <div className="text-xs text-destructive/90">High Risk · Severe Clauses Found</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center gap-4">
                <div className="rounded-full bg-amber-500/20 p-3 text-amber-400">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Flagged Clauses</div>
                  <div className="text-2xl font-bold text-amber-400 font-display">3 Critical</div>
                  <div className="text-xs text-muted-foreground">2 High Risk · 1 Medium</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neon-green/40 bg-neon-green/10 flex items-center gap-4">
                <div className="rounded-full bg-neon-green/20 p-3 text-neon-green">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Missing Protections</div>
                  <div className="text-2xl font-bold text-neon-green font-display">2 Missing</div>
                  <div className="text-xs text-muted-foreground">Severability · Dispute Cure Period</div>
                </div>
              </div>
            </div>

            {/* Mascot Lee Advice Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-neon-gold/15 via-background to-neon-purple/10 border border-neon-gold/30 flex items-start gap-4">
              <img 
                src="/lee-mascot.png" 
                alt="Lee Legal Mascot" 
                className="w-14 h-auto shrink-0 drop-shadow-md animate-lee-alive"
              />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <span>Lee&apos;s plain-English take on the sample:</span>
                  <Badge variant="outline" className="border-neon-gold text-neon-gold text-[10px]">
                    Sample
                  </Badge>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  &ldquo;Do not sign this draft as-is! The 2-year nationwide non-compete could prevent you from taking any other work in your field, and the unlimited liability clause puts your personal savings on the line. Use the redlined clauses below in your counter-offer.&rdquo;
                </p>
              </div>
            </div>

            {/* Redline comparison */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <span>Clause-by-Clause Redlines & Fair Alternatives</span>
              </h3>

              <div className="space-y-4">
                {clauses.map((clause) => (
                  <div key={clause.id} className="rounded-xl border border-border/70 overflow-hidden bg-background/50">
                    <div className="px-4 py-3 bg-muted/40 border-b border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={
                          clause.severity === "high" 
                            ? "bg-destructive/20 text-destructive border-destructive/40" 
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        }>
                          {clause.severity.toUpperCase()} RISK
                        </Badge>
                        <span className="font-semibold text-sm">{clause.title}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7 text-neon-cyan hover:text-neon-cyan/80"
                        onClick={() => handleCopy(clause.recommended, clause.id)}
                      >
                        {copiedId === clause.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-neon-green" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" /> Copy Fair Clause
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="p-4 grid md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <span className="font-bold text-destructive flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Original Aggressive Clause:
                        </span>
                        <p className="font-mono text-muted-foreground line-through decoration-destructive/70 leading-relaxed">
                          &ldquo;{clause.original}&rdquo;
                        </p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                        <span className="font-bold text-neon-green flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Lee&apos;s Fair Recommended Clause:
                        </span>
                        <p className="font-mono text-foreground font-medium leading-relaxed">
                          &ldquo;{clause.recommended}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2.5 bg-muted/20 border-t border-border/30 text-[11px] text-muted-foreground">
                      <strong className="text-foreground">Why this matters: </strong>
                      {clause.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContractRedlineStudio;
