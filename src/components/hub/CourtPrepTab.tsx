import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Scale, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Shirt,
  MessageSquare,
  Shield,
  Calendar,
  Gavel,
  ChevronRight
} from "lucide-react";

interface CourtPrepTabProps {
  caseType: "custody" | "criminal" | "restraining" | "probation" | "general";
  colorVariant?: "purple" | "cyan" | "pink" | "green" | "orange";
}

export function CourtPrepTab({ caseType, colorVariant = "purple" }: CourtPrepTabProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const prepSteps = {
    custody: [
      { id: "docs", title: "Gather Documents", desc: "Custody agreement, school records, financial statements", icon: FileText },
      { id: "dress", title: "Court Attire", desc: "Dress professionally - business casual minimum", icon: Shirt },
      { id: "arrive", title: "Arrive Early", desc: "Plan to arrive 30 minutes before your hearing", icon: Clock },
      { id: "speak", title: "How to Address the Judge", desc: "Say 'Your Honor' and wait to be acknowledged", icon: MessageSquare },
      { id: "evidence", title: "Organize Evidence", desc: "Have 3 copies of each document (judge, opposing party, yourself)", icon: FileText },
      { id: "children", title: "Child Care", desc: "Arrange care for children - they typically shouldn't attend", icon: Shield }
    ],
    criminal: [
      { id: "docs", title: "Gather Documents", desc: "Bail paperwork, any relevant evidence or witnesses", icon: FileText },
      { id: "dress", title: "Court Attire", desc: "Conservative, professional clothing", icon: Shirt },
      { id: "arrive", title: "Arrive Early", desc: "Security screening can take 15-30 minutes", icon: Clock },
      { id: "speak", title: "Courtroom Etiquette", desc: "Stand when judge enters, speak only when addressed", icon: MessageSquare },
      { id: "rights", title: "Know Your Rights", desc: "Right to remain silent, right to counsel", icon: Shield },
      { id: "plea", title: "Understand Your Plea Options", desc: "Guilty, Not Guilty, No Contest - know the differences", icon: Gavel }
    ],
    restraining: [
      { id: "docs", title: "Evidence Documentation", desc: "Photos, messages, police reports, witness statements", icon: FileText },
      { id: "timeline", title: "Create Timeline", desc: "Chronological list of all incidents with dates", icon: Calendar },
      { id: "dress", title: "Court Attire", desc: "Dress conservatively and professionally", icon: Shirt },
      { id: "safety", title: "Safety Plan", desc: "Have someone accompany you, know courthouse layout", icon: Shield },
      { id: "speak", title: "Prepare Your Statement", desc: "Practice what you'll say, focus on facts", icon: MessageSquare },
      { id: "arrive", title: "Arrive Early", desc: "Request to wait in a different area if needed", icon: Clock }
    ],
    probation: [
      { id: "docs", title: "Gather Documents", desc: "Proof of compliance, program certificates, employment records", icon: FileText },
      { id: "dress", title: "Court Attire", desc: "Professional appearance shows respect", icon: Shirt },
      { id: "compliance", title: "Document Compliance", desc: "Bring proof of all completed requirements", icon: CheckCircle2 },
      { id: "arrive", title: "Arrive Early", desc: "Never be late to probation hearings", icon: Clock },
      { id: "speak", title: "Speak Honestly", desc: "Be truthful about your progress and any challenges", icon: MessageSquare },
      { id: "plan", title: "Have a Plan", desc: "Show the court your continued rehabilitation plan", icon: Shield }
    ],
    general: [
      { id: "docs", title: "Gather All Documents", desc: "Bring all relevant paperwork and evidence", icon: FileText },
      { id: "dress", title: "Dress Appropriately", desc: "Business casual to formal attire", icon: Shirt },
      { id: "arrive", title: "Arrive 30 Minutes Early", desc: "Account for parking and security", icon: Clock },
      { id: "speak", title: "Courtroom Protocol", desc: "Address judge as 'Your Honor', stand when they enter", icon: MessageSquare },
      { id: "location", title: "Know the Location", desc: "Confirm courthouse address and courtroom number", icon: MapPin },
      { id: "phone", title: "Silence Electronics", desc: "Turn off or silence all devices", icon: Shield }
    ]
  };

  const steps = prepSteps[caseType];
  const progress = (completedSteps.length / steps.length) * 100;
  const colorClass = `neon-${colorVariant}`;

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const whatToExpect = {
    custody: [
      "Both parents will have opportunity to present their case",
      "Judge may ask about parenting plans and child's needs",
      "A guardian ad litem may be assigned to represent the child's interests",
      "Mediator may attempt to help parents reach agreement",
      "Final decision based on child's best interests"
    ],
    criminal: [
      "Your case may be called at any time - be prepared to wait",
      "Prosecutor will present charges",
      "You or your attorney can present your defense",
      "Judge may ask questions directly",
      "Sentencing may happen same day or scheduled separately"
    ],
    restraining: [
      "Temporary order may be granted same day",
      "Full hearing scheduled within 2-3 weeks typically",
      "Present evidence of harassment, threats, or violence",
      "Respondent will have opportunity to contest",
      "Order can include distance requirements, no contact provisions"
    ],
    probation: [
      "Review of compliance with all conditions",
      "Discussion of any violations",
      "Updates on treatment programs or community service",
      "Possible modification of conditions",
      "Early termination may be requested if eligible"
    ],
    general: [
      "Cases are called in order - be patient",
      "Present your side clearly and concisely",
      "Answer questions directly and honestly",
      "Decisions may be made same day or later",
      "You may need to return for additional hearings"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className={`glass-card border-${colorClass}/30 p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className={`w-5 h-5 text-${colorClass}`} />
            <h3 className="font-display font-semibold text-foreground">Court Preparation</h3>
          </div>
          <Badge className={`bg-${colorClass}/20 text-${colorClass} border-${colorClass}/30`}>
            {completedSteps.length}/{steps.length} Complete
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Preparation Checklist */}
      <Card className={`glass-card border-${colorClass}/30 p-4`}>
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 text-${colorClass}`} />
          Preparation Checklist
        </h4>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                completedSteps.includes(step.id)
                  ? "bg-neon-green/10 border border-neon-green/30"
                  : "bg-background/30 hover:bg-background/50"
              }`}
            >
              <Checkbox
                checked={completedSteps.includes(step.id)}
                onCheckedChange={() => toggleStep(step.id)}
                className="mt-1"
              />
              <div className={`p-2 rounded-lg ${
                completedSteps.includes(step.id) 
                  ? "bg-neon-green/20 text-neon-green" 
                  : `bg-${colorClass}/20 text-${colorClass}`
              }`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  completedSteps.includes(step.id) 
                    ? "text-neon-green line-through" 
                    : "text-foreground"
                }`}>
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* What to Expect */}
      <Card className={`glass-card border-${colorClass}/30 p-4`}>
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-orange" />
          What to Expect in Court
        </h4>
        <div className="space-y-2">
          {whatToExpect[caseType].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2">
              <ChevronRight className={`w-4 h-4 mt-0.5 text-${colorClass} shrink-0`} />
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Tips */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card border-neon-green/30 p-4">
          <h5 className="font-semibold text-neon-green mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            DO
          </h5>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Stay calm and composed</li>
            <li>• Speak clearly and politely</li>
            <li>• Stick to the facts</li>
            <li>• Listen carefully</li>
          </ul>
        </Card>
        <Card className="glass-card border-destructive/30 p-4">
          <h5 className="font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            DON'T
          </h5>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Interrupt the judge</li>
            <li>• Argue with opposing party</li>
            <li>• Show frustration</li>
            <li>• Bring weapons or prohibited items</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
