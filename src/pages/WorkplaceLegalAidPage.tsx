import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, Shield, AlertTriangle, FileText, Phone, 
  Scale, Search, ChevronRight, ExternalLink, 
  Users, Clock, DollarSign, Heart, Building2,
  MessageSquare, FolderOpen, HelpCircle, BookOpen
} from "lucide-react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { useNavigate } from "react-router-dom";
import { HubAssistant } from "@/components/hub/HubAssistant";
import { DocumentManager } from "@/components/hub/DocumentManager";
import { CourtPrepTab } from "@/components/hub/CourtPrepTab";

import { DocuAI } from "@/components/hub/DocuAI";
import { HubNotifications } from "@/components/hub/HubNotifications";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";

const topics = [
  {
    id: "discrimination",
    title: "Workplace Discrimination",
    icon: Shield,
    description: "Learn about protected classes, filing EEOC complaints, and your rights against discrimination.",
    color: "neon-orange",
    articles: ["What is workplace discrimination?", "How to file an EEOC complaint", "Proving discrimination in court"]
  },
  {
    id: "harassment",
    title: "Harassment & Hostile Work",
    icon: AlertTriangle,
    description: "Understand sexual harassment laws, hostile work environments, and reporting procedures.",
    color: "neon-pink",
    articles: ["Types of workplace harassment", "Documenting harassment incidents", "Employer liability"]
  },
  {
    id: "wages",
    title: "Wages & Overtime",
    icon: DollarSign,
    description: "Know your rights regarding minimum wage, overtime pay, and wage theft recovery.",
    color: "neon-green",
    articles: ["Federal minimum wage laws", "Overtime eligibility", "Filing a wage claim"]
  },
  {
    id: "termination",
    title: "Wrongful Termination",
    icon: Briefcase,
    description: "Understand at-will employment, wrongful termination claims, and severance negotiations.",
    color: "neon-cyan",
    articles: ["At-will employment explained", "Signs of wrongful termination", "Negotiating severance"]
  },
  {
    id: "leave",
    title: "Family & Medical Leave",
    icon: Heart,
    description: "Learn about FMLA rights, medical leave protections, and accommodation requirements.",
    color: "neon-purple",
    articles: ["FMLA eligibility requirements", "Requesting medical leave", "Returning from leave"]
  },
  {
    id: "safety",
    title: "Workplace Safety (OSHA)",
    icon: Building2,
    description: "Know your OSHA rights, how to report unsafe conditions, and retaliation protections.",
    color: "neon-blue",
    articles: ["Your OSHA rights", "Reporting safety violations", "Whistleblower protections"]
  },
];

const stateResources = [
  { state: "California", agency: "DIR - Division of Labor Standards", phone: "(844) 522-6734" },
  { state: "New York", agency: "NY Department of Labor", phone: "(888) 469-7365" },
  { state: "Texas", agency: "Texas Workforce Commission", phone: "(800) 832-9243" },
  { state: "Florida", agency: "FL Department of Economic Opportunity", phone: "(800) 204-2418" },
  { state: "Illinois", agency: "IL Department of Labor", phone: "(312) 793-2800" },
];

const whereToStartSteps = [
  {
    title: "Document Everything",
    description: "Keep records of incidents, communications, and any evidence of wrongdoing",
    action: "Start Documenting"
  },
  {
    title: "Know Your Rights",
    description: "Learn about federal and state labor laws that protect you",
    action: "Learn Rights"
  },
  {
    title: "Report Internally First",
    description: "Follow your company's HR procedures for reporting issues",
    action: "Report Guide"
  },
  {
    title: "File Government Complaint",
    description: "Contact EEOC, DOL, or OSHA depending on your issue",
    action: "File Complaint"
  },
  {
    title: "Consult an Attorney",
    description: "Get legal advice for complex situations or if internal reporting fails",
    action: "Find Attorney"
  }
];

const courtPrepChecklist = [
  { id: "evidence", label: "Gather all emails, texts, and written documentation", category: "Evidence" },
  { id: "witnesses", label: "List potential witnesses and their contact info", category: "Evidence" },
  { id: "timeline", label: "Create a detailed timeline of events", category: "Evidence" },
  { id: "policies", label: "Collect company policies and employee handbook", category: "Evidence" },
  { id: "complaint", label: "File EEOC/DOL complaint within deadlines", category: "Process" },
  { id: "righttodue", label: "Wait for Right to Sue letter if applicable", category: "Process" },
  { id: "attorney", label: "Consult with employment attorney", category: "Process" },
  { id: "deposition", label: "Prepare for deposition if case proceeds", category: "Court" },
  { id: "testimony", label: "Practice your testimony with attorney", category: "Court" },
  { id: "professional", label: "Maintain professional demeanor throughout", category: "Court" }
];

export default function WorkplaceLegalAidPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("assistant");

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const systemPrompt = `You are WorkplaceAI, an AI assistant specializing in employment law and worker rights in the U.S. (2025).
  
  YOUR MISSION:
  - Help workers understand their rights under federal and state labor laws
  - Guide users through filing complaints with EEOC, DOL, OSHA
  - Explain workplace protections against discrimination, harassment, and retaliation
  - Help users document workplace issues properly
  - Analyze employment documents (contracts, handbooks, termination letters)
  
  KEY AREAS:
  1. Discrimination (Title VII, ADA, ADEA)
  2. Sexual harassment and hostile work environment
  3. Wage and hour violations (FLSA)
  4. Family and Medical Leave (FMLA)
  5. Workplace safety (OSHA)
  6. Wrongful termination
  7. Whistleblower protections
  
  DOCUMENT ANALYSIS:
  - Review employment contracts for unfair clauses
  - Analyze termination letters for legal issues
  - Help users understand their rights under employee handbooks
  
  Always remind users of filing deadlines and recommend consulting with an employment attorney for specific legal advice.`;

  return (
    <Layout>
      <FuturisticBackground>
        {/* Hero */}
        <section className="relative py-12 overflow-hidden">
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <AnimatedAIHead variant="orange" size="lg" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-orange/10 border border-neon-orange/30 mb-6">
                <Briefcase className="h-4 w-4 text-neon-orange" />
                <span className="text-sm font-medium text-neon-orange">Workplace Legal Aid Hub</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Know Your <span className="text-neon-orange">Worker Rights</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complete hub for workplace legal issues. AI-powered guidance, document management, and complaint filing assistance.
              </p>
            </div>
          </div>
        </section>

        {/* Topic Cards */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto mb-8">
              {topics.map((topic) => (
                <Card 
                  key={topic.id} 
                  className={`glass-card cursor-pointer hover:border-${topic.color}/50 transition-all p-4 text-center`}
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${topic.color}/10 flex items-center justify-center mx-auto mb-2`}>
                    <topic.icon className={`h-5 w-5 text-${topic.color}`} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{topic.title}</h3>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Hub */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4 glass-card p-1">
                <TabsTrigger value="assistant" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange gap-2">
                  <MessageSquare className="w-4 h-4" /> AI Assistant
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                  <FolderOpen className="w-4 h-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="court" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                  <Scale className="w-4 h-4" /> Case Prep
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                  <BookOpen className="w-4 h-4" /> Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="assistant">
                <HubAssistant
                  assistantName="WorkplaceAI"
                  colorVariant="orange"
                  systemPrompt={systemPrompt}
                  placeholderText="Describe your workplace issue, upload documents, or ask about your rights..."
                  welcomeMessage="I'm WorkplaceAI, your employment law assistant. I can help with discrimination, harassment, wage issues, wrongful termination, and more. Upload your employment documents and I'll analyze them."
                />
              </TabsContent>

              <TabsContent value="documents">
                <div className="grid lg:grid-cols-2 gap-6">
                  <DocuAI colorVariant="orange" hubContext="workplace" />
                  <DocumentManager colorVariant="orange" />
                </div>
              </TabsContent>

              <TabsContent value="court">
                <CourtPrepTab 
                  caseType="employment"
                  colorVariant="orange"
                />
              </TabsContent>

              <TabsContent value="resources">
                <div className="space-y-6">
                  {/* State Labor Boards */}
                  <Card className="glass-card p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">State Labor Board Contacts</h3>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {stateResources.map((resource) => (
                        <div key={resource.state} className="p-4 rounded-xl bg-background/30 border border-border/50">
                          <h4 className="font-semibold text-foreground mb-1">{resource.state}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{resource.agency}</p>
                          <a 
                            href={`tel:${resource.phone}`}
                            className="flex items-center gap-2 text-sm text-neon-orange hover:underline"
                          >
                            <Phone className="h-4 w-4" />
                            {resource.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Federal Resources */}
                  <Card className="glass-card p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">Federal Resources</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-xl bg-background/30 border border-border/50 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center mx-auto mb-3">
                          <Scale className="h-6 w-6 text-neon-green" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">EEOC</h4>
                        <p className="text-sm text-muted-foreground mb-4">Equal Employment Opportunity Commission</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          eeoc.gov <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="p-6 rounded-xl bg-background/30 border border-border/50 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
                          <Shield className="h-6 w-6 text-neon-cyan" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">OSHA</h4>
                        <p className="text-sm text-muted-foreground mb-4">Occupational Safety & Health Admin</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          osha.gov <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="p-6 rounded-xl bg-background/30 border border-border/50 text-center">
                        <div className="w-12 h-12 rounded-xl bg-neon-purple/10 flex items-center justify-center mx-auto mb-3">
                          <DollarSign className="h-6 w-6 text-neon-purple" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">DOL</h4>
                        <p className="text-sm text-muted-foreground mb-4">Department of Labor - Wage & Hour</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          dol.gov <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Ad Banner */}
        <section className="pb-4">
          <div className="container mx-auto px-4 max-w-3xl">
            <AdContainer position="inline">
              <AdBanner slot="8392716450" format="horizontal" />
            </AdContainer>
          </div>
        </section>

        {/* Back */}
        <section className="py-6">
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
