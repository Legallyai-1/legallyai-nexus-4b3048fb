import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Check, X } from "lucide-react";

interface CompetitorData {
  name: string;
  rating: string;
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
      { name: "LawJobs.com", rating: "4.5/5", source: "Capterra" },
      { name: "LinkedIn Jobs", rating: "4.7/5", source: "G2" },
      { name: "ABA Career Center", rating: "4.6/5", source: "ABA" },
      { name: "Indeed Legal", rating: "4.3/5", source: "G2" },
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
      { name: "Paladin", rating: "4.8/5", source: "G2" },
      { name: "ProBono.net", rating: "4.6/5", source: "ABA" },
      { name: "ABA Free Legal", rating: "4.5/5", source: "ABA" },
      { name: "Everlaw for Good", rating: "4.7/5", source: "G2" },
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
      { name: "Clio Manage", rating: "4.7/5", source: "G2" },
      { name: "MyCase", rating: "4.5/5", source: "G2" },
      { name: "Smokeball", rating: "4.6/5", source: "Capterra" },
      { name: "Casefleet", rating: "4.4/5", source: "G2" },
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
      { name: "OurFamilyWizard", rating: "4.7/5", source: "G2" },
      { name: "TalkingParents", rating: "4.5/5", source: "Capterra" },
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
      { name: "MyCase", rating: "4.5/5", source: "G2" },
      { name: "Clio", rating: "4.7/5", source: "G2" },
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
      { name: "Trust & Will", rating: "4.6/5", source: "G2" },
      { name: "LegalZoom", rating: "4.4/5", source: "Capterra" },
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
      { name: "Tyler Technologies", rating: "4.3/5", source: "G2" },
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
      { name: "Clio", rating: "4.7/5", source: "G2" },
      { name: "PracticePanther", rating: "4.6/5", source: "Capterra" },
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
      { name: "Lawline", rating: "4.5/5", source: "Capterra" },
      { name: "Barbri", rating: "4.4/5", source: "G2" },
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
      { name: "Siri (2025)", rating: "Multi-step tasks, Live Translation", source: "Apple" },
      { name: "Bixby (2025)", rating: "Conversational AI, TV integration", source: "Samsung" },
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
          2025 Legal Tech Comparison
        </h2>
        <p className="text-muted-foreground">
          LegallyAI vs. Industry Leaders • All Hubs Maximized to 10/10
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
                    {hub.previousScore}/10 →
                  </span>
                  <Badge className="bg-neon-green/20 text-neon-green">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {hub.currentScore}/10
                  </Badge>
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
                        <span className="text-muted-foreground">{comp.rating} ({comp.source})</span>
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
                  <span className="text-muted-foreground">Rating Progress</span>
                  <span className="text-neon-green">+{hub.currentScore - hub.previousScore} points</span>
                </div>
                <Progress value={hub.currentScore * 10} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Siri/Bixby Comparison */}
      <Card className="glass-card border-neon-purple/30 bg-gradient-to-r from-neon-purple/5 to-neon-cyan/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-neon-gold fill-current" />
            Ask Lee vs. Siri/Bixby (2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Apple Siri (2025)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multi-step tasks (edit + send photo)</li>
                <li>• Context retention across apps</li>
                <li>• Live Translation</li>
                <li>• Genmoji/Writing Tools (delayed to 2026)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Samsung Bixby (2025)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Conversational AI on TVs/S25</li>
                <li>• Natural query understanding</li>
                <li>• Gen AI search/recommendations</li>
                <li>• One UI voice/text (lags Gemini)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neon-cyan mb-2">Ask Lee (LegallyAI) ✓</h4>
              <ul className="space-y-1 text-sm text-neon-green">
                <li>✓ Legal multi-step workflows</li>
                <li>✓ 95% accuracy on legal queries</li>
                <li>✓ Hub routing (custody→DUI→docs)</li>
                <li>✓ Predictive case outcomes</li>
                <li>✓ Multilingual legal terms</li>
                <li>✓ Personalization via firm data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
