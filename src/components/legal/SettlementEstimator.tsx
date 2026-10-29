import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, DollarSign, TrendingUp, AlertCircle, FileText, 
  ArrowRight, Sparkles, CheckCircle2, Shield
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function SettlementEstimator() {
  const [medicalBills, setMedicalBills] = useState("4500");
  const [propertyDamage, setPropertyDamage] = useState("2800");
  const [lostWages, setLostWages] = useState("1800");
  const [severityMultiplier, setSeverityMultiplier] = useState<number>(2.5);
  const [disputeType, setDisputeType] = useState("Auto Accident / Personal Injury");

  const numMedical = parseFloat(medicalBills) || 0;
  const numProperty = parseFloat(propertyDamage) || 0;
  const numWages = parseFloat(lostWages) || 0;

  const specialDamages = numMedical + numProperty + numWages; // Economic damages
  const painAndSuffering = numMedical * severityMultiplier; // Non-economic damages
  const totalMedian = specialDamages + painAndSuffering;
  const totalLow = Math.round(totalMedian * 0.75);
  const totalHigh = Math.round(totalMedian * 1.35);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Card className="glass-card border-neon-gold/30 shadow-[0_0_30px_hsl(var(--neon-gold)/0.15)] overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-neon-gold/15 via-neon-cyan/10 to-transparent border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-neon-gold/20 p-2 text-neon-gold">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                Settlement & Damages Claim Estimator
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/40 text-xs">
                  <Calculator className="w-3 h-3 mr-1" aria-hidden="true" /> Transparent calculator
                </Badge>
              </CardTitle>
              <CardDescription>
                A rough, rule-of-thumb starting point for an injury or damages claim. You can see exactly how the number is calculated.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="med-bills" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-neon-gold" /> Medical & Treatment Costs (\$)
            </Label>
            <Input 
              id="med-bills"
              type="number"
              value={medicalBills}
              onChange={(e) => setMedicalBills(e.target.value)}
              className="bg-background/60 font-mono"
              placeholder="e.g. 5000"
            />
            <p className="text-[11px] text-muted-foreground">Emergency room, doctors, PT, prescriptions</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prop-damage" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-neon-gold" /> Property Damage / Repair Costs (\$)
            </Label>
            <Input 
              id="prop-damage"
              type="number"
              value={propertyDamage}
              onChange={(e) => setPropertyDamage(e.target.value)}
              className="bg-background/60 font-mono"
              placeholder="e.g. 2500"
            />
            <p className="text-[11px] text-muted-foreground">Vehicle repair, damaged property, out-of-pocket</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost-wages" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-neon-gold" /> Lost Wages / Missed Income (\$)
            </Label>
            <Input 
              id="lost-wages"
              type="number"
              value={lostWages}
              onChange={(e) => setLostWages(e.target.value)}
              className="bg-background/60 font-mono"
              placeholder="e.g. 1500"
            />
            <p className="text-[11px] text-muted-foreground">Documented days or hours missed from employment</p>
          </div>
        </div>

        {/* Severity Multiplier Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-neon-cyan" /> Injury / Severity Multiplier:
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { multiplier: 1.5, label: "Minor / Soft Tissue", desc: "Whiplash, minor bruising, full fast recovery" },
              { multiplier: 2.5, label: "Moderate / Ongoing", desc: "Fractures, physical therapy, lasting pain" },
              { multiplier: 4.5, label: "Severe / Permanent", desc: "Surgery, permanent impairment, prolonged trauma" },
            ].map((option) => (
              <button
                key={option.multiplier}
                type="button"
                onClick={() => setSeverityMultiplier(option.multiplier)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  severityMultiplier === option.multiplier
                    ? "border-neon-gold bg-neon-gold/15 shadow-sm"
                    : "border-border/60 bg-background/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">{option.label}</span>
                  <Badge variant="outline" className={severityMultiplier === option.multiplier ? "border-neon-gold text-neon-gold" : ""}>
                    {option.multiplier}x
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settlement Results Card */}
        <div className="rounded-xl border border-neon-gold/40 bg-gradient-to-br from-neon-gold/10 via-background to-neon-cyan/5 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-neon-gold tracking-wider">Rough illustrative range</span>
              <div className="text-3xl md:text-4xl font-extrabold font-display text-foreground mt-1">
                {formatCurrency(totalLow)} – {formatCurrency(totalHigh)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Midpoint of the formula: <strong className="text-neon-green">{formatCurrency(totalMedian)}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/generate">
                <Button variant="neon" className="w-full sm:w-auto">
                  <FileText className="w-4 h-4 mr-1.5" /> Draft Demand Letter with Lee
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground">Economic Losses (Specials):</span>
              <div className="font-bold text-foreground">{formatCurrency(specialDamages)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Pain & Suffering (General):</span>
              <div className="font-bold text-foreground">{formatCurrency(painAndSuffering)}</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-muted-foreground">Multiplier Applied:</span>
              <div className="font-bold text-neon-cyan">{severityMultiplier}x Medical Costs</div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground space-y-1.5">
            <p><strong className="text-foreground">How this is calculated:</strong> economic losses (medical + property + lost wages) plus medical costs × the severity multiplier you chose. The range is 75%–135% of that total.</p>
            <p><strong className="text-foreground">This is not a prediction or legal advice.</strong> Real outcomes depend on liability, evidence, insurance limits, your state&apos;s law and deadlines, and negotiation. Many claims settle for less, and some for nothing. Talk to a licensed attorney about your situation.</p>
          </div>

          {/* Lee Advice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/80 border border-border/50 text-xs text-muted-foreground">
            <img src="/lee-mascot.png" alt="Lee" className="w-10 h-auto shrink-0 animate-lee-alive" />
            <div>
              <strong className="text-foreground">Lee&apos;s Settlement Strategy: </strong>
              Insurance adjusters will demand proof for every penny of medical expenses and lost wages. Be sure to gather doctor notes, itemized billing records, and police crash reports before sending your demand packet.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SettlementEstimator;
