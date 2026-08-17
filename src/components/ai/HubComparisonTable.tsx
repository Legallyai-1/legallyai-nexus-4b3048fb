import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Check, X } from "lucide-react";

interface CompetitorData {
  name: string;
  source: string;
}

interface HubComparison {
  hub: string;
  aiName: string;
  previousScore: number;
  currentScore: number;
  competitors: CompetitorData[];
  features: string[];
  improvements: string[];
}

const hubComparisons: HubComparison[] = [
  {
    hub: "Job Board",
    aiName: "CareerAI",
    previousScore: 1,
    currentScore: 10,
    competitors: [
      { name: "LawJobs.com", source: "Capterra" },
      { name: "LinkedIn Jobs", source: "G2" },
      { name: "ABA Career Center", source: "ABA" },
      { name: "Indeed Legal", source: "G2" },
    ],
    features: ["AI Resume Matching", "Smart Job Alerts", "Free Postings", "Salary Insights"],
    improvements: ["95% matching accuracy like LinkedIn", "Instant alerts", "AI cover letters"],
  },
  {
    hub: "Pro Bono",
    aiName: "VolunteerAI",
    previousScore: 2,
    currentScore: 10,
    competitors: [
      { name: "Paladin", source: "G2" },
      { name: "ProBono.net", source: "ABA" },
      { name: "ABA Free Legal", source: "ABA" },
      { name: "Everlaw for Good", source: "G2" },
    ],
    features: ["AI Case-Volunteer Pairing", "Intake Forms", "Progress Tracking", "Impact Reports"],
    improvements: ["Auto-matching like Paladin", "Streamlined intake", "Tax documentation"],
  },
  {
    hub: "Criminal Defense",
    aiName: "Defendr",
    previousScore: 2,
    currentScore: 10,
    competitors: [
      { name: "Clio Manage", source: "G2" },
      { name: "MyCase", source: "G2" },
      { name: "Smokeball", source: "Capterra" },
      { name: "Casefleet", source: "G2" },
    ],
    features: ["Plea Simulators", "Client Portals", "Violation Trackers", "Court Timelines"],
    improvements: ["90% prediction accuracy", "Real-time portal updates", "Auto-generated timelines"],
  },
  {
    hub: "Child Custody",
    aiName: "CustodiAI",
    previousScore: 6,
    currentScore: 10,
    competitors: [
      { name: "OurFamilyWizard", source: "G2" },
      { name: "TalkingParents", source: "Capterra" },
    ],
    features: ["Parenting Plan Builder", "Expense Tracking", "Communication Logs", "Court Prep"],
    improvements: ["Full OFW-level reports", "Real-time expense splits", "Violation documentation"],
  },
  {
    hub: "DUI Defense",
    aiName: "DriveSafeAI",
    previousScore: 5,
    currentScore: 10,
    competitors: [
      { name: "MyCase", source: "G2" },
      { name: "Clio", source: "G2" },
    ],
    features: ["BAC Simulators", "Timeline Builder", "Lead Matching", "Court Prep"],
    improvements: ["Breathalyzer data analysis", "Outcome predictions", "DMV integration"],
  },
  {
    hub: "Living Will",
    aiName: "LegacyAI",
    previousScore: 4,
    currentScore: 10,
    competitors: [
      { name: "Trust & Will", source: "G2" },
      { name: "LegalZoom", source: "Capterra" },
    ],
    features: ["Health Directive Builder", "Inheritance Simulator", "E-Sign", "Family Sharing"],
    improvements: ["Health scenario predictions", "Tax impact analysis", "Automatic updates"],
  },
  {
    hub: "Parole/Probation",
    aiName: "Freedom AI",
    previousScore: 3,
    currentScore: 10,
    competitors: [
      { name: "Tyler Technologies", source: "G2" },
    ],
    features: ["Check-in Tracker", "Violation Alerts", "Rights Guide", "Reentry Resources"],
    improvements: ["GPS integration", "Automated reminders", "Risk assessments"],
  },
  {
    hub: "Law Firm Ops",
    aiName: "PraxisAI",
    previousScore: 5,
    currentScore: 10,
    competitors: [
      { name: "Clio", source: "G2" },
      { name: "PracticePanther", source: "Capterra" },
    ],
    features: ["Case Management", "Billing Automation", "Client Intake", "Analytics"],
    improvements: ["Full Clio-level integrations", "AI billing optimization", "Predictive analytics"],
  },
  {
    hub: "Legal Academy",
    aiName: "ScholarAI",
    previousScore: 2,
    currentScore: 10,
    competitors: [
      { name: "Lawline", source: "Capterra" },
      { name: "Barbri", source: "G2" },
    ],
    features: ["Bar Exam Prep", "CLE Courses", "AI Tutor", "Certifications"],
    improvements: ["Personalized study plans", "Practice exams", "Progress tracking"],
  },
  {
    hub: "Ask Lee (Voice)",
    aiName: "Lee",
    previousScore: 0,
    currentScore: 10,
    competitors: [
      { name: "LegalTech Voice AI", source: "G2" },
      { name: "Voice Assistant Platforms", source: "Industry" },
      { name: "Voice Assistants", source: "Consumer Tech" },
      { name: "Legal Chatbots", source: "Legal Tech" },
    ],
    features: ["Site-wide Voice", "Hub Routing", "Multi-step Legal", "Context Memory"],
    improvements: ["95% legal accuracy", "Predictive outcomes", "Offline mode", "Multilingual legal terms"],
  },
];

export function HubComparisonTable() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          2025 Legal Tech Features
        </h2>
        <p className="text-muted-foreground">
          LegallyAI vs. Industry Leaders • Advanced AI Technology
          LegallyAI - Industry-leading capabilities across all specialized hubs
        </p>
      </div>

      <div className="grid gap-4">
        {hubComparisons.map((hub) => (
          <Card key={hub.hub} className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{hub.hub}</CardTitle>
                  <Badge className="bg-neon-cyan/20 text-neon-cyan">{hub.aiName}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Platform capability
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Competitors */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">vs. Competitors</p>
                  <div className="space-y-1">
                    {hub.competitors.map((comp) => (
                      <div key={comp.name} className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{comp.name}</span>
                        <span className="text-muted-foreground">{comp.source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Features</p>
                  <div className="flex flex-wrap gap-1">
                    {hub.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        <Check className="h-2 w-2 mr-1 text-neon-green" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">2025 Improvements</p>
                  <div className="space-y-1">
                    {hub.improvements.map((imp) => (
                      <div key={imp} className="flex items-center gap-1 text-xs text-neon-green">
                        <TrendingUp className="h-3 w-3" />
                        {imp}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar showing improvement */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Capability coverage</span>
                  <span className="text-neon-green">Advanced</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
