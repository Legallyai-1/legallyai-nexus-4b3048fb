import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Users, ArrowRight, ArrowLeft, CheckCircle, 
  FileText, AlertCircle, Loader2, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";

interface FormData {
  parentName: string;
  otherParentName: string;
  childrenCount: string;
  childrenNames: string;
  currentCustody: string;
  desiredCustody: string;
  state: string;
  concerns: string;
}

const steps = [
  { id: 1, title: "Your Information" },
  { id: 2, title: "Children Details" },
  { id: 3, title: "Custody Preferences" },
  { id: 4, title: "Additional Details" },
];

const custodyOptions = [
  { value: "joint", label: "Joint Custody", desc: "Both parents share decision-making and time equally" },
  { value: "primary", label: "Primary Custody", desc: "One parent has primary physical custody" },
  { value: "sole", label: "Sole Custody", desc: "One parent has full legal and physical custody" },
  { value: "visitation", label: "Visitation Rights", desc: "Non-custodial parent has scheduled visits" },
];

export default function CustodyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    parentName: "",
    otherParentName: "",
    childrenCount: "",
    childrenNames: "",
    currentCustody: "",
    desiredCustody: "",
    state: "",
    concerns: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    setTimeout(() => {
      const mockPlan = `
CHILD CUSTODY PLAN

Prepared for: ${formData.parentName} & ${formData.otherParentName}
State: ${formData.state}
Children: ${formData.childrenNames}

---

CUSTODY ARRANGEMENT: ${custodyOptions.find(o => o.value === formData.desiredCustody)?.label || "Joint Custody"}

PARENTING SCHEDULE:
• Week 1-2: Parent A (${formData.parentName})
• Week 3-4: Parent B (${formData.otherParentName})
• Holidays: Alternating annually

DECISION MAKING:
• Educational decisions: Joint
• Medical decisions: Joint
• Religious upbringing: Joint

COMMUNICATION:
• Regular check-ins between parents
• Child's access to both parents via phone/video

MODIFICATIONS:
This plan may be modified with mutual consent or court approval.

---

DISCLAIMER: This is an AI-generated template for informational purposes.
Please consult with a family law attorney before finalizing any custody agreement.

---

Unlock the full custody plan with detailed schedules, legal clauses, and state-specific provisions for $29.
      `.trim();

      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
      toast.success("Custody plan preview generated!");
    }, 2500);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="parentName" className="text-foreground">Your Full Name</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => updateField("parentName", e.target.value)}
                placeholder="Enter your full legal name"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherParentName" className="text-foreground">Other Parent's Full Name</Label>
              <Input
                id="otherParentName"
                value={formData.otherParentName}
                onChange={(e) => updateField("otherParentName", e.target.value)}
                placeholder="Enter the other parent's full legal name"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-foreground">State of Residence</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="e.g., California, Texas, New York"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="childrenCount" className="text-foreground">Number of Children</Label>
              <Input
                id="childrenCount"
                type="number"
                min="1"
                value={formData.childrenCount}
                onChange={(e) => updateField("childrenCount", e.target.value)}
                placeholder="Enter number of children"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenNames" className="text-foreground">Children's Names & Ages</Label>
              <Input
                id="childrenNames"
                value={formData.childrenNames}
                onChange={(e) => updateField("childrenNames", e.target.value)}
                placeholder="e.g., Emma (8), Michael (5)"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-foreground">Current Custody Arrangement</Label>
              <RadioGroup
                value={formData.currentCustody}
                onValueChange={(value) => updateField("currentCustody", value)}
                className="space-y-3"
              >
                {custodyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl glass-card cursor-pointer transition-all",
                      formData.currentCustody === option.value
                        ? "border-neon-purple/50 shadow-glow-purple"
                        : "border-border/30 hover:border-neon-purple/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-foreground">Desired Custody Arrangement</Label>
              <RadioGroup
                value={formData.desiredCustody}
                onValueChange={(value) => updateField("desiredCustody", value)}
                className="space-y-3"
              >
                {custodyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl glass-card cursor-pointer transition-all",
                      formData.desiredCustody === option.value
                        ? "border-neon-purple/50 shadow-glow-purple"
                        : "border-border/30 hover:border-neon-purple/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="concerns" className="text-foreground">Any Special Concerns?</Label>
              <Input
                id="concerns"
                value={formData.concerns}
                onChange={(e) => updateField("concerns", e.target.value)}
                placeholder="e.g., work schedules, school districts, health concerns"
                className="bg-muted/50 border-border/50 focus:border-neon-purple/50 focus:shadow-glow-purple transition-all"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (generatedPlan) {
    return (
      <Layout>
        <FuturisticBackground>
          <section className="py-12 md:py-20 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-4">
                  <CheckCircle className="h-4 w-4 text-neon-green" />
                  <span className="text-sm font-medium text-neon-green">Plan Generated</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Your Custody Plan
                </h1>
              </div>

              <div className="glass-card p-6 rounded-2xl border-neon-purple/20 mb-6">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {generatedPlan}
                </pre>
              </div>

              <div className="glass-card p-6 rounded-2xl border-neon-purple/30 mb-6 bg-gradient-to-r from-neon-purple/10 to-neon-pink/10">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-neon-purple/20">
                    <FileText className="h-6 w-6 text-neon-purple" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Unlock Complete Custody Plan
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get the full document with detailed parenting schedules, holiday arrangements, 
                      decision-making provisions, and state-specific legal clauses.
                    </p>
                    <Button variant="neon-purple">
                      Pay $29 – Unlock Now
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="glass"
                onClick={() => {
                  setGeneratedPlan(null);
                  setCurrentStep(1);
                }}
                className="w-full"
              >
                Start Over
              </Button>
            </div>
          </section>
        </FuturisticBackground>
      </Layout>
    );
  }

  return (
    <Layout>
      <FuturisticBackground>
        <section className="py-12 md:py-20 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              {/* Animated AI Head */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-purple/20 blur-3xl rounded-full scale-150" />
                  <AnimatedAIHead variant="purple" size="lg" />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 mb-6">
                <Users className="h-4 w-4 text-neon-purple" />
                <span className="text-sm font-medium text-neon-purple">Family Law</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Child Custody <span className="text-neon-purple">Helper</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions and get a personalized custody plan draft instantly. 
                Our AI helps you navigate this challenging time.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {/* Progress */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                        currentStep >= step.id
                          ? "bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-glow-purple"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-16 md:w-24 h-1 mx-2 rounded-full transition-all",
                          currentStep > step.id 
                            ? "bg-gradient-to-r from-neon-purple to-neon-pink" 
                            : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="glass-card p-6 md:p-8 rounded-2xl border-neon-purple/20">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neon-purple" />
                  {steps[currentStep - 1].title}
                </h2>

                {renderStep()}

                <div className="flex gap-3 mt-8 pt-6 border-t border-border/30">
                  {currentStep > 1 && (
                    <Button variant="glass" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  )}
                  {currentStep < 4 ? (
                    <Button variant="neon-purple" onClick={nextStep} className="flex-1">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="neon-purple"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        <>
                          Generate Custody Plan
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 flex items-start gap-3 p-4 rounded-xl glass-card border-neon-purple/10">
                <AlertCircle className="h-5 w-5 text-neon-purple shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  This tool provides general guidance only. Child custody matters are complex 
                  and vary by state. Please consult with a family law attorney for legal advice.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
