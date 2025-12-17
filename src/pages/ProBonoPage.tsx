import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, Scale, Users, DollarSign, FileText, 
  MapPin, Clock, ArrowRight, Search, ExternalLink,
  GraduationCap, Building2, CheckCircle, Download, Calculator,
  Receipt, MessageSquare, FolderOpen, HelpCircle, Percent, Brain
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HubAssistant } from "@/components/hub/HubAssistant";
import { DocumentManager } from "@/components/hub/DocumentManager";

import { HubNotifications } from "@/components/hub/HubNotifications";
import { AIVolunteerMatcher } from "@/components/probono/AIVolunteerMatcher";

const proBonoOpportunities = [
  {
    id: "1",
    title: "Family Law Assistance",
    organization: "Legal Aid Society",
    location: "New York, NY",
    type: "Ongoing",
    hours: "10+ hours/month",
    description: "Help low-income families with custody, divorce, and domestic violence matters.",
    skills: ["Family Law", "Client Interviews", "Court Filings"],
    taxDeductible: true,
    estimatedDeduction: "$2,500-5,000/year"
  },
  {
    id: "2",
    title: "Immigration Clinic",
    organization: "Immigrant Defense Project",
    location: "Remote / Nationwide",
    type: "Project-based",
    hours: "5-10 hours/case",
    description: "Assist asylum seekers with applications, interviews, and court representation.",
    skills: ["Immigration Law", "Spanish/Other Languages", "Asylum Procedures"],
    taxDeductible: true,
    estimatedDeduction: "$1,500-3,000/case"
  },
  {
    id: "3",
    title: "Small Business Legal Clinic",
    organization: "Volunteer Lawyers for the Arts",
    location: "Los Angeles, CA",
    type: "Weekly",
    hours: "4 hours/week",
    description: "Provide transactional legal services to artists, musicians, and creative entrepreneurs.",
    skills: ["Contract Law", "Business Formation", "IP Basics"],
    taxDeductible: true,
    estimatedDeduction: "$3,000-6,000/year"
  },
  {
    id: "4",
    title: "Expungement Project",
    organization: "Clean Slate Initiative",
    location: "Chicago, IL",
    type: "Event-based",
    hours: "Full day events",
    description: "Help eligible individuals clear their criminal records at community expungement clinics.",
    skills: ["Criminal Law", "Record Review", "Client Counseling"],
    taxDeductible: true,
    estimatedDeduction: "$500-1,000/event"
  },
];

const taxBenefits = [
  {
    title: "Mileage Deduction",
    description: "Deduct travel to and from pro bono work at the IRS standard rate.",
    rate: "$0.67/mile (2024)",
    irsForm: "Schedule A, Line 11",
    documentation: ["Mileage log", "Date & purpose of travel", "Starting/ending locations"]
  },
  {
    title: "Out-of-Pocket Expenses",
    description: "Deduct court fees, copying costs, and other expenses you pay for pro bono clients.",
    rate: "100% deductible",
    irsForm: "Schedule A, Line 11",
    documentation: ["Receipts", "Proof of payment", "Client case reference"]
  },
  {
    title: "CLE Credits",
    description: "Many states offer CLE credit for pro bono service hours.",
    rate: "Varies by state",
    irsForm: "N/A (not tax but licensing)",
    documentation: ["Certificate of completion", "Hours log", "Program verification"]
  },
];

const whereToStartStepsLawyer = [
  {
    title: "Find Opportunities",
    description: "Browse pro bono opportunities that match your practice area and availability",
    action: "Browse Opportunities"
  },
  {
    title: "Understand Tax Benefits",
    description: "Learn what expenses you can deduct and how to document them",
    action: "Tax Guide"
  },
  {
    title: "Register & Apply",
    description: "Sign up for opportunities that interest you",
    action: "Register"
  },
  {
    title: "Track Your Hours",
    description: "Keep detailed records of time and expenses for tax purposes",
    action: "Start Tracking"
  },
  {
    title: "Generate Tax Documents",
    description: "Create documentation for your tax deductions at year end",
    action: "Generate Forms"
  }
];

const whereToStartStepsClient = [
  {
    title: "Check Eligibility",
    description: "See if you qualify for free legal help based on income and case type",
    action: "Check Eligibility"
  },
  {
    title: "Find Local Help",
    description: "Locate legal aid organizations and law school clinics near you",
    action: "Find Help"
  },
  {
    title: "Prepare Your Case",
    description: "Gather documents and information about your legal issue",
    action: "Prepare"
  },
  {
    title: "Apply for Assistance",
    description: "Submit your application for free legal representation",
    action: "Apply Now"
  },
  {
    title: "Work with Your Attorney",
    description: "Collaborate with your pro bono lawyer to resolve your case",
    action: "Learn More"
  }
];

export default function ProBonoPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState<"lawyer" | "client">("lawyer");
  const [activeTab, setActiveTab] = useState("assistant");
  const [trackedHours, setTrackedHours] = useState(0);
  const [trackedMiles, setTrackedMiles] = useState(0);
  const [trackedExpenses, setTrackedExpenses] = useState(0);

  const filteredOpportunities = proBonoOpportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignUp = (oppId: string) => {
    toast.success("Interest submitted! The organization will contact you soon.");
  };

  const calculateTaxSavings = () => {
    const mileageDeduction = trackedMiles * 0.67;
    const totalDeductions = mileageDeduction + trackedExpenses;
    const estimatedSavings = totalDeductions * 0.25; // Assuming 25% tax bracket
    return { mileageDeduction, totalDeductions, estimatedSavings };
  };

  const { mileageDeduction, totalDeductions, estimatedSavings } = calculateTaxSavings();

  const lawyerSystemPrompt = `You are ProBonoAI, helping lawyers maximize the impact of their pro bono work and understand tax benefits.
  
  KEY TOPICS:
  - Finding pro bono opportunities matching practice areas
  - Understanding IRS rules for charitable deductions
  - Documenting expenses and time for tax purposes
  - State bar pro bono requirements and CLE credits
  - Generating year-end tax documentation
  
  TAX DEDUCTION RULES (2024):
  - Mileage: $0.67/mile for travel to pro bono work
  - Out-of-pocket expenses: 100% deductible (court fees, copying, postage)
  - Time/services: NOT deductible (only expenses)
  - Must have written records with dates, amounts, purposes
  - Report on Schedule A, Line 11 (Charitable Contributions)
  
  Help lawyers document their work properly and maximize legitimate tax deductions.`;

  const clientSystemPrompt = `You are ProBonoAI, helping people find free legal assistance.
  
  KEY TOPICS:
  - Determining eligibility for free legal services
  - Finding local legal aid organizations
  - Understanding what to expect from pro bono representation
  - Preparing documentation for your case
  - Rights when working with volunteer attorneys
  
  Help clients navigate the process of getting free legal help and understand what quality of service they should expect.`;

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero */}
        <section className="relative py-12 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <AnimatedAIHead variant="pink" size="lg" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/30 mb-6">
                <Heart className="h-4 w-4 text-neon-pink" />
                <span className="text-sm font-medium text-neon-pink">Pro Bono Legal Services Hub</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Legal Help for <span className="text-neon-pink">Everyone</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Connecting lawyers who want to give back with people who need legal help.
                Pro bono work benefits everyone - with real tax deductions for attorneys.
              </p>

              {/* User Type Toggle */}
              <div className="inline-flex rounded-full p-1 bg-muted/50">
                <button
                  onClick={() => setUserType("lawyer")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    userType === "lawyer" 
                      ? "bg-neon-pink text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I'm a Lawyer
                </button>
                <button
                  onClick={() => setUserType("client")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    userType === "client" 
                      ? "bg-neon-pink text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  I Need Help
                </button>
              </div>
            </div>
          </div>
        </section>

        {userType === "lawyer" ? (
          <section className="py-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 glass-card p-1">
                  <TabsTrigger value="assistant" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="ai-match" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                    <Brain className="w-4 h-4" /> AI Match
                  </TabsTrigger>
                  <TabsTrigger value="opportunities" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan gap-2">
                    <Heart className="w-4 h-4" /> Browse
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                    <Receipt className="w-4 h-4" /> Tax
                  </TabsTrigger>
                  <TabsTrigger value="tracker" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange gap-2">
                    <Calculator className="w-4 h-4" /> Track
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-match">
                  <AIVolunteerMatcher />
                </TabsContent>

                <TabsContent value="opportunities">
                  <div className="space-y-6">
                    <div className="relative max-w-xl mx-auto">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search pro bono opportunities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredOpportunities.map((opp) => (
                        <Card key={opp.id} className="glass-card-hover border-neon-pink/20">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-foreground mb-1">{opp.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{opp.organization}</p>
                              </div>
                              {opp.taxDeductible && (
                                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                                  Tax Deductible
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                            <div className="flex flex-wrap gap-3 text-sm mb-3">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" /> {opp.location}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" /> {opp.hours}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-neon-green/10 border border-neon-green/20 mb-4">
                              <p className="text-xs text-neon-green flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Estimated tax deduction: {opp.estimatedDeduction}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {opp.skills.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <Button 
                              variant="neon-purple" 
                              className="w-full gap-2"
                              onClick={() => handleSignUp(opp.id)}
                            >
                              Express Interest <ArrowRight className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tax">
                  <div className="space-y-6">
                    <Card className="glass-card p-6 border-neon-green/30">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        Pro Bono Tax Deductions - IRS Guidelines
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        While you cannot deduct the value of your time, you CAN deduct out-of-pocket expenses 
                        incurred while providing pro bono legal services. These are treated as charitable contributions.
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        {taxBenefits.map((benefit, i) => (
                          <div key={i} className="p-4 rounded-xl bg-background/30 border border-neon-green/20">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-neon-green" />
                              </div>
                              <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 mb-3">
                              {benefit.rate}
                            </Badge>
                            <div className="text-xs space-y-1">
                              <p className="text-muted-foreground font-medium">IRS Form: {benefit.irsForm}</p>
                              <p className="text-muted-foreground">Required docs:</p>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {benefit.documentation.map((doc, idx) => (
                                  <li key={idx}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="glass-card p-6 border-neon-cyan/30">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                        Generate Tax Documentation
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
                          <Download className="w-5 h-5" />
                          <span>Download Mileage Log Template</span>
                          <span className="text-xs text-muted-foreground">Excel/PDF format</span>
                        </Button>
                        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
                          <Download className="w-5 h-5" />
                          <span>Download Expense Tracker</span>
                          <span className="text-xs text-muted-foreground">Track all deductible expenses</span>
                        </Button>
                        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
                          <FileText className="w-5 h-5" />
                          <span>Generate Year-End Summary</span>
                          <span className="text-xs text-muted-foreground">For Schedule A filing</span>
                        </Button>
                        <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
                          <Receipt className="w-5 h-5" />
                          <span>Organization Acknowledgment Letter</span>
                          <span className="text-xs text-muted-foreground">Required for deductions over $250</span>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tracker">
                  <Card className="glass-card p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                      Track Hours & Expenses for Tax Deductions
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <label className="text-sm text-muted-foreground">Pro Bono Hours (for CLE credit)</label>
                        <Input
                          type="number"
                          value={trackedHours}
                          onChange={(e) => setTrackedHours(Number(e.target.value))}
                          className="mt-2 text-2xl font-bold"
                        />
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <label className="text-sm text-muted-foreground">Miles Driven</label>
                        <Input
                          type="number"
                          value={trackedMiles}
                          onChange={(e) => setTrackedMiles(Number(e.target.value))}
                          className="mt-2 text-2xl font-bold"
                        />
                        <p className="text-xs text-neon-green mt-1">= ${mileageDeduction.toFixed(2)} deduction</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <label className="text-sm text-muted-foreground">Out-of-Pocket Expenses ($)</label>
                        <Input
                          type="number"
                          value={trackedExpenses}
                          onChange={(e) => setTrackedExpenses(Number(e.target.value))}
                          className="mt-2 text-2xl font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-r from-neon-green/10 to-emerald-500/10 border border-neon-green/30">
                      <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Deductions</p>
                          <p className="text-3xl font-display font-bold text-foreground">${totalDeductions.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Tax Savings (25% bracket)</p>
                          <p className="text-3xl font-display font-bold text-neon-green">${estimatedSavings.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CLE Hours Logged</p>
                          <p className="text-3xl font-display font-bold text-neon-cyan">{trackedHours}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="assistant">
                  <HubAssistant
                    assistantName="ProBonoAI"
                    assistantVariant="pink"
                    systemPrompt={lawyerSystemPrompt}
                    placeholderText="Ask about pro bono opportunities, tax deductions, or documentation requirements..."
                    welcomeMessage="I'm ProBonoAI, here to help you find meaningful pro bono opportunities and maximize your legitimate tax deductions. Ask me about IRS rules, documentation requirements, or finding opportunities in your practice area."
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        ) : (
          <section className="py-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 glass-card p-1">
                  <TabsTrigger value="assistant" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                    <MessageSquare className="w-4 h-4" /> AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="find" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                    <Search className="w-4 h-4" /> Find Help
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                    <FolderOpen className="w-4 h-4" /> My Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="find">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="glass-card-hover border-neon-pink/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-4">
                          <Scale className="h-6 w-6 text-neon-pink" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Legal Aid Societies</h3>
                        <p className="text-sm text-muted-foreground mb-4">Free legal help for low-income individuals. Income limits apply.</p>
                        <Button variant="outline" className="gap-2">
                          Find Local Legal Aid <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="glass-card-hover border-neon-pink/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-6 w-6 text-neon-pink" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Law School Clinics</h3>
                        <p className="text-sm text-muted-foreground mb-4">Free representation by law students under attorney supervision.</p>
                        <Button variant="outline" className="gap-2">
                          Find Law School Clinics <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="glass-card-hover border-neon-pink/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-4">
                          <Building2 className="h-6 w-6 text-neon-pink" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Bar Association Referrals</h3>
                        <p className="text-sm text-muted-foreground mb-4">Many bar associations offer free consultations and reduced-fee programs.</p>
                        <Button variant="outline" className="gap-2">
                          Contact Your Bar <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="glass-card p-6 mt-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">What to Expect from Pro Bono Help</h3>
                    <div className="space-y-3">
                      {[
                        "Free legal representation from a licensed attorney",
                        "Same quality service as paid clients",
                        "Confidential attorney-client relationship",
                        "Help with documents, court appearances, and negotiations",
                        "Referrals to other resources if needed"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                          <CheckCircle className="h-5 w-5 text-neon-green shrink-0" />
                          <span className="text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  <DocumentManager colorVariant="pink" />
                </TabsContent>

                <TabsContent value="assistant">
                  <HubAssistant
                    assistantName="ProBonoAI"
                    assistantVariant="pink"
                    systemPrompt={clientSystemPrompt}
                    placeholderText="Tell me about your legal issue or ask how to find free legal help..."
                    welcomeMessage="I'm ProBonoAI, here to help you find free legal assistance. Tell me about your legal issue and I'll help you understand your options and find resources near you."
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        )}

        {/* Back */}
        <section className="py-8">
          <div className="container mx-auto px-4 text-center">
            <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>
              ← Back to AI Assistants
            </Button>
          </div>
        </section>
      </FuturisticBackground>
    </Layout>
  );
}
