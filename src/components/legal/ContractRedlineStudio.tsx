import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileCheck, Sparkles,
  AlertTriangle, Copy, Check, Download, FileText
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CONTRACT_EXCERPT_LIMIT, prepareContractExcerpt } from "@/lib/contract-review-input";

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

export function ContractRedlineStudio() {
  const [contractText, setContractText] = useState(SAMPLE_CONTRACT);
  const navigate = useNavigate();
  const isSample = contractText.trim() === SAMPLE_CONTRACT.trim();
  // The clause cards below are a worked example for the sample agreement only.
  const analyzed = isSample;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const clauses: RedlineClause[] = [
    {
      id: "non-compete",
      title: "Overly Broad 24-Month Non-Compete",
      severity: "high",
      original: "for a period of twenty-four (24) months following termination, the Contractor shall not provide any services to any entity in the same industry anywhere in North America.",
      recommended: "for a period of six (6) months following termination, the Contractor shall not directly solicit the Client's active accounts with whom Contractor personally worked during the term.",
      explanation: "This example limits future work by duration, geography and industry. Ask a licensed attorney whether any restriction or proposed alternative is permitted in your jurisdiction."
    },
    {
      id: "unlimited-liability",
      title: "One-Sided Unlimited Indemnification",
      severity: "high",
      original: "The Contractor's liability under this Agreement shall be unlimited.",
      recommended: "Each party's maximum aggregate liability shall be capped at the total fees paid or payable to Contractor under this Agreement in the preceding six (6) months, except for gross negligence or willful misconduct.",
      explanation: "This example states no liability cap. The proposed cap is an illustration, not a recommended amount; ask an attorney which limits and exceptions fit the agreement."
    },
    {
      id: "termination-imbalance",
      title: "Asymmetric Termination Notice",
      severity: "medium",
      original: "The Client may terminate immediately without cause. The Contractor may terminate only upon ninety (90) days written notice.",
      recommended: "Either party may terminate this Agreement without cause upon providing thirty (30) days prior written notice to the other party.",
      explanation: "The example gives the parties different notice periods. Discuss termination rights, payment obligations and a suitable notice period with an attorney."
    }
  ];

  const handleAnalyze = () => {
    if (!contractText.trim()) {
      setInputError("Paste a contract excerpt to discuss with Lee.");
      return;
    }
    if (isSample) {
      document.getElementById("redline-sample-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const result = prepareContractExcerpt(contractText);
    if (!result.ok) {
      setInputError(result.error);
      return;
    }
    setInputError(null);
    navigate(`/chat?q=${encodeURIComponent(result.prompt)}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        toast.success("Clause copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => toast.error("Couldn't copy. Select the clause text and copy it manually."));
  };

  const handleExport = () => {
    const report = `LEGALLYAI - SAMPLE CONTRACT REDLINE (example agreement)\nLegal information, not legal advice. Not a review of your contract. Consult a licensed attorney before using any example wording.\n\n` +
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
                Contract excerpt review
                <Badge className="bg-legal-gold/15 text-legal-gold border-legal-gold/40 text-xs whitespace-nowrap">
                  <Sparkles className="w-3 h-3 mr-1" /> AI redline
                </Badge>
              </CardTitle>
              <CardDescription>
                Discuss a short contract excerpt with Lee in chat. This is not a full-document review or a legal risk assessment.
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
            <label htmlFor="contract-excerpt" className="text-sm font-semibold text-foreground flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 shrink-0 text-neon-cyan" /> Paste a contract excerpt
            </label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setContractText(SAMPLE_CONTRACT); setInputError(null); }}
            >
              Reset to Sample Agreement
            </Button>
          </div>
          <Textarea 
            id="contract-excerpt"
            aria-describedby="contract-excerpt-help"
            aria-invalid={Boolean(inputError)}
            value={contractText}
            onChange={(e) => { setContractText(e.target.value); setInputError(null); }}
            rows={5}
            className="font-mono text-xs leading-relaxed bg-background/60 border-border/60 focus-visible:ring-neon-cyan"
            placeholder="Paste your contract clauses here..."
          />
          <p id="contract-excerpt-help" className="text-sm text-muted-foreground">
            {contractText.trim().length.toLocaleString()} / {CONTRACT_EXCERPT_LIMIT.toLocaleString()} characters for chat.
            Remove names and confidential information. AI chats are not attorney-client privileged.
          </p>
          {inputError && <p role="alert" className="text-sm text-destructive">{inputError}</p>}
          <div className="flex justify-end">
            <Button variant="neon" onClick={handleAnalyze} className="px-6">
              <Sparkles className="w-4 h-4 mr-2" /> {isSample ? "See the sample redline" : "Discuss excerpt with Lee"}
            </Button>
          </div>
        </div>

        {!isSample && (
          <p className="text-sm text-muted-foreground">Your entire excerpt will open in chat. Oversized drafts stay here so you can choose what to send; nothing is silently removed.</p>
        )}
        {analyzed && (
          <div id="redline-sample-results" className="space-y-6 pt-4 border-t border-border/40 animate-fade-in scroll-mt-20">
            <p role="note" className="rounded-lg border border-legal-gold/40 bg-legal-gold/10 px-3 py-2 text-sm">
              <strong>Sample analysis</strong> of the example agreement above, not a review of your document. Example wording requires attorney review for your circumstances and jurisdiction.
            </p>
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
                  This example raises questions about future work, liability and termination notice.
                  The wording below is illustrative only. A licensed attorney should review the full agreement
                  and applicable law before you rely on any change.
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
                    <div className="px-4 py-3 bg-muted/40 border-b border-border/40 flex flex-wrap items-center justify-between gap-2">
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
