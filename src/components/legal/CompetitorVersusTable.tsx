import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Scale, Trophy } from "lucide-react";

interface FeatureRow {
  feature: string;
  legallyAi: boolean | string;
  aiLawyer: boolean | string;
  coCounsel: boolean | string;
  spellbook: boolean | string;
}

const COMPARISONS: FeatureRow[] = [
  {
    feature: "Free Daily Tier (No Credit Card)",
    legallyAi: "5 Daily Queries + Rewarded Video",
    aiLawyer: "Hard Paywall ($9.99/wk)",
    coCounsel: false,
    spellbook: false
  },
  {
    feature: "Friendly Plain-English Mascot (Lee)",
    legallyAi: true,
    aiLawyer: false,
    coCounsel: false,
    spellbook: false
  },
  {
    feature: "Perplexity-Style Grounded Statutory Citations",
    legallyAi: true,
    aiLawyer: false,
    coCounsel: true,
    spellbook: false
  },
  {
    feature: "10+ Specialized Hubs (Custody, DUI, Wills, etc.)",
    legallyAi: true,
    aiLawyer: false,
    coCounsel: false,
    spellbook: false
  },
  {
    feature: "In-Depth Contract Redline & Risk Scoring",
    legallyAi: true,
    aiLawyer: "Summary Only",
    coCounsel: true,
    spellbook: true
  },
  {
    feature: "Settlement & Personal Injury Damages Calculator",
    legallyAi: true,
    aiLawyer: false,
    coCounsel: false,
    spellbook: false
  },
  {
    feature: "Complete Law Firm Suite (Cases, Billing, Portal)",
    legallyAi: true,
    aiLawyer: false,
    coCounsel: "Thomson Reuters Ecosystem",
    spellbook: false
  },
  {
    feature: "Starting Price",
    legallyAi: "$0 / $9.99 / mo",
    aiLawyer: "$40+/mo ($9.99/wk)",
    coCounsel: "$300+/mo per seat",
    spellbook: "$120+/mo per seat"
  }
];

export function CompetitorVersusTable() {
  const renderValue = (val: boolean | string, isLegallyAi = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${isLegallyAi ? "bg-neon-cyan/20 text-neon-cyan" : "bg-neon-green/20 text-neon-green"}`}>
          <Check className="w-4 h-4" />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive/70">
          <X className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className={`text-xs font-semibold ${isLegallyAi ? "text-neon-cyan" : "text-muted-foreground"}`}>
        {val}
      </span>
    );
  };

  return (
    <Card className="glass-card border-neon-cyan/30 shadow-2xl overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-b from-neon-cyan/10 to-transparent border-b border-border/40 pb-8">
        <Badge className="mx-auto mb-3 bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40">
          <Trophy className="w-3.5 h-3.5 mr-1 text-neon-gold" /> Market Dominance Comparison
        </Badge>
        <CardTitle className="text-2xl md:text-3xl font-display font-bold">
          Why <span className="gold-text">LegallyAI Nexus</span> Crushes The Competition
        </CardTitle>
        <CardDescription className="max-w-2xl mx-auto text-sm text-muted-foreground">
          Built for everyday people, trusted by law firms. See how LegallyAI compares head-to-head with single-purpose legal tools.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30 text-xs uppercase text-muted-foreground font-semibold">
              <th className="py-4 px-6 min-w-[200px]">Capabilities</th>
              <th className="py-4 px-4 min-w-[170px] bg-neon-cyan/10 text-neon-cyan font-bold">
                LegallyAI Nexus (Lee)
              </th>
              <th className="py-4 px-4 min-w-[140px]">AI Lawyer</th>
              <th className="py-4 px-4 min-w-[140px]">CoCounsel (TR)</th>
              <th className="py-4 px-4 min-w-[140px]">Spellbook</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-sm">
            {COMPARISONS.map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">
                  {row.feature}
                </td>
                <td className="py-4 px-4 bg-neon-cyan/5 border-x border-neon-cyan/20">
                  {renderValue(row.legallyAi, true)}
                </td>
                <td className="py-4 px-4">
                  {renderValue(row.aiLawyer)}
                </td>
                <td className="py-4 px-4">
                  {renderValue(row.coCounsel)}
                </td>
                <td className="py-4 px-4">
                  {renderValue(row.spellbook)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default CompetitorVersusTable;
