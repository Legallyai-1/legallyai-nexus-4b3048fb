import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  MessageSquare, 
  FileText,
  Scale,
  Users,
  Shield,
  Clock,
  Target,
  Sparkles,
  Briefcase,
  Heart,
  Gavel,
  DollarSign,
  Building2,
  GraduationCap
} from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: () => void;
  actionLabel?: string;
}

interface WhereToStartProps {
  caseType: "custody" | "criminal" | "restraining" | "probation" | "loans" | "general" | "defense" | "workplace" | "employment" | "probono" | "lawfirm";
  colorVariant?: "purple" | "cyan" | "pink" | "green" | "orange" | "blue";
  onNavigate?: (section: string) => void;
}

export function WhereToStart({ caseType, colorVariant = "purple", onNavigate }: WhereToStartProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const stepsByType: Record<string, Step[]> = {
    custody: [
      { id: "understand", title: "Understand Your Rights", description: "Learn about custody types, parental rights, and what courts consider", icon: BookOpen, actionLabel: "Learn More" },
      { id: "gather", title: "Gather Information", description: "Collect details about children, living situations, and current arrangements", icon: FileText, actionLabel: "Start Intake" },
      { id: "documents", title: "Prepare Documents", description: "Upload relevant documents like school records, financial info, and existing orders", icon: FileText, actionLabel: "Upload Documents" },
      { id: "ai-help", title: "Get AI Assistance", description: "Chat with CustodiAI to get answers and generate custody plans", icon: MessageSquare, actionLabel: "Start Chat" },
      { id: "court-prep", title: "Prepare for Court", description: "Complete the court preparation checklist and know what to expect", icon: Scale, actionLabel: "View Checklist" }
    ],
    criminal: [
      { id: "rights", title: "Know Your Rights", description: "Understand your constitutional rights and legal protections", icon: Shield, actionLabel: "Learn Rights" },
      { id: "charges", title: "Understand Your Charges", description: "Learn what you're charged with and potential outcomes", icon: FileText, actionLabel: "Explain Charges" },
      { id: "timeline", title: "Know Your Timeline", description: "Important dates, deadlines, and court appearances", icon: Clock, actionLabel: "View Timeline" },
      { id: "ai-help", title: "Get Defense Guidance", description: "Chat with Defendr for legal guidance and preparation help", icon: MessageSquare, actionLabel: "Talk to Defendr" },
      { id: "court-prep", title: "Court Preparation", description: "Everything you need to know before your court date", icon: Scale, actionLabel: "Prepare" }
    ],
    defense: [
      { id: "rights", title: "Know Your Rights", description: "Understand your constitutional rights and legal protections", icon: Shield, actionLabel: "Learn Rights" },
      { id: "ticket", title: "Review Your Ticket/Charge", description: "Understand what you're charged with and possible defenses", icon: FileText, actionLabel: "Review" },
      { id: "evidence", title: "Gather Evidence", description: "Collect photos, receipts, witness info, and other evidence", icon: FileText, actionLabel: "Upload Evidence" },
      { id: "ai-help", title: "Get Defense Strategy", description: "Chat with Defendr AI for personalized defense guidance", icon: MessageSquare, actionLabel: "Talk to Defendr" },
      { id: "court-prep", title: "Court Preparation", description: "Learn what to expect and how to present your case", icon: Scale, actionLabel: "Prepare" }
    ],
    restraining: [
      { id: "safety", title: "Assess Your Safety", description: "Create a safety plan and understand emergency resources", icon: Shield, actionLabel: "Safety Resources" },
      { id: "evidence", title: "Document Everything", description: "Collect evidence of harassment, threats, or abuse", icon: FileText, actionLabel: "Upload Evidence" },
      { id: "timeline", title: "Create Timeline", description: "Build a chronological record of all incidents", icon: Clock, actionLabel: "Build Timeline" },
      { id: "ai-help", title: "Get AI Assistance", description: "Chat with our AI to help prepare your petition", icon: MessageSquare, actionLabel: "Start Chat" },
      { id: "court-prep", title: "Hearing Preparation", description: "Prepare for temporary and full hearing", icon: Scale, actionLabel: "Prepare" }
    ],
    probation: [
      { id: "terms", title: "Understand Your Terms", description: "Know exactly what your probation requires", icon: FileText, actionLabel: "View Terms" },
      { id: "compliance", title: "Track Compliance", description: "Document your progress meeting all requirements", icon: CheckCircle2, actionLabel: "Track Progress" },
      { id: "documents", title: "Collect Proof", description: "Gather certificates, employment records, and other proof", icon: FileText, actionLabel: "Upload Documents" },
      { id: "ai-help", title: "Get Guidance", description: "Ask questions about your rights and obligations", icon: MessageSquare, actionLabel: "Ask ProbAI" },
      { id: "court-prep", title: "Prepare for Review", description: "Get ready for probation review hearings", icon: Scale, actionLabel: "Prepare" }
    ],
    loans: [
      { id: "eligibility", title: "Check Eligibility", description: "Understand loan requirements and your qualifications", icon: Target, actionLabel: "Check Now" },
      { id: "calculate", title: "Calculate Payments", description: "Use our calculator to understand your payment options", icon: DollarSign, actionLabel: "Calculate" },
      { id: "apply", title: "Submit Application", description: "Complete your loan application with required information", icon: FileText, actionLabel: "Apply" },
      { id: "verify", title: "Verification", description: "Verify your identity and income for approval", icon: Shield, actionLabel: "Verify" },
      { id: "receive", title: "Receive Funds", description: "Get approved funds deposited to your account", icon: CheckCircle2, actionLabel: "Track Status" }
    ],
    workplace: [
      { id: "identify", title: "Identify Your Issue", description: "Understand what type of workplace violation you're facing", icon: Target, actionLabel: "Get Help" },
      { id: "rights", title: "Know Your Rights", description: "Learn about federal and state employment protections", icon: Shield, actionLabel: "View Rights" },
      { id: "document", title: "Document Everything", description: "Keep records of incidents, communications, and witnesses", icon: FileText, actionLabel: "Start Documentation" },
      { id: "ai-help", title: "Get AI Assistance", description: "Chat with WorkAI for guidance on your situation", icon: MessageSquare, actionLabel: "Chat Now" },
      { id: "action", title: "Take Action", description: "File complaints, contact labor boards, or seek legal help", icon: Gavel, actionLabel: "View Options" }
    ],
    employment: [
      { id: "identify", title: "Identify Your Issue", description: "Understand what type of workplace violation you're facing", icon: Target, actionLabel: "Get Help" },
      { id: "rights", title: "Know Your Rights", description: "Learn about federal and state employment protections", icon: Shield, actionLabel: "View Rights" },
      { id: "document", title: "Document Everything", description: "Keep records of incidents, communications, and witnesses", icon: FileText, actionLabel: "Start Documentation" },
      { id: "ai-help", title: "Get AI Assistance", description: "Chat with WorkAI for guidance on your situation", icon: MessageSquare, actionLabel: "Chat Now" },
      { id: "action", title: "Take Action", description: "File complaints, contact labor boards, or seek legal help", icon: Gavel, actionLabel: "View Options" }
    ],
    probono: [
      { id: "understand", title: "Understand Pro Bono Work", description: "Learn what qualifies as pro bono and its benefits", icon: Heart, actionLabel: "Learn More" },
      { id: "find", title: "Find Opportunities", description: "Browse available pro bono cases matching your expertise", icon: Briefcase, actionLabel: "Browse Cases" },
      { id: "track", title: "Track Your Hours", description: "Log pro bono hours for tax documentation", icon: Clock, actionLabel: "Log Hours" },
      { id: "tax", title: "Tax Documentation", description: "Generate IRS-compliant documentation for tax benefits", icon: FileText, actionLabel: "Generate Docs" },
      { id: "impact", title: "Measure Impact", description: "See how your contributions have helped the community", icon: Users, actionLabel: "View Impact" }
    ],
    lawfirm: [
      { id: "setup", title: "Set Up Your Firm", description: "Configure your organization, roles, and departments", icon: Building2, actionLabel: "Start Setup" },
      { id: "team", title: "Add Team Members", description: "Invite lawyers, paralegals, and staff to your firm", icon: Users, actionLabel: "Add Members" },
      { id: "clients", title: "Manage Clients", description: "Set up client intake and portal access", icon: Briefcase, actionLabel: "Client Setup" },
      { id: "cases", title: "Create Cases", description: "Start managing cases and assign team members", icon: FileText, actionLabel: "Create Case" },
      { id: "billing", title: "Set Up Billing", description: "Configure time tracking, invoicing, and payments", icon: DollarSign, actionLabel: "Billing Setup" }
    ],
    general: [
      { id: "identify", title: "Identify Your Legal Issue", description: "Understand what type of legal matter you're facing", icon: Target, actionLabel: "Get Help" },
      { id: "gather", title: "Gather Information", description: "Collect relevant documents and facts about your case", icon: FileText, actionLabel: "Start" },
      { id: "ai-help", title: "Get AI Assistance", description: "Chat with our AI legal assistant for guidance", icon: MessageSquare, actionLabel: "Chat Now" },
      { id: "documents", title: "Prepare Documents", description: "Generate and organize legal documents", icon: FileText, actionLabel: "Create" },
      { id: "next-steps", title: "Plan Next Steps", description: "Understand your options and timeline", icon: ArrowRight, actionLabel: "View Plan" }
    ]
  };

  const steps = stepsByType[caseType] || stepsByType.general;
  const colorClass = `neon-${colorVariant}`;

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
    onNavigate?.(stepId);
  };

  return (
    <Card className={`glass-card border-${colorClass}/30 p-4`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg bg-${colorClass}/20`}>
          <Sparkles className={`w-5 h-5 text-${colorClass}`} />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Where to Start</h3>
          <p className="text-xs text-muted-foreground">Follow these steps to get started</p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isPast = idx < currentStep || isCompleted;

          return (
            <div
              key={step.id}
              className={`relative flex items-start gap-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? `bg-${colorClass}/10 border border-${colorClass}/30` 
                  : isCompleted
                    ? "bg-neon-green/10 border border-neon-green/30"
                    : "bg-background/30 border border-transparent"
              }`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                isCompleted
                  ? "bg-neon-green text-background"
                  : isActive
                    ? `bg-${colorClass} text-background`
                    : "bg-muted text-muted-foreground"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <step.icon className={`w-4 h-4 ${
                    isCompleted ? "text-neon-green" : isActive ? `text-${colorClass}` : "text-muted-foreground"
                  }`} />
                  <p className={`font-medium ${isCompleted ? "text-neon-green" : "text-foreground"}`}>
                    {step.title}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                
                {isActive && (
                  <Button 
                    size="sm" 
                    variant={isActive ? "neon-purple" : "outline"}
                    onClick={() => handleStepComplete(step.id)}
                    className="mt-1"
                  >
                    {step.actionLabel || "Continue"}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              {idx < steps.length - 1 && (
                <div className={`absolute left-[19px] top-[52px] w-0.5 h-[calc(100%-20px)] ${
                  isPast ? `bg-${colorClass}/50` : "bg-border"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}