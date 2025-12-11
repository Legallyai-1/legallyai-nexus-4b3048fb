import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, FileCheck, Calendar, MapPin, Shield, Bell, Home, Briefcase, Heart,
  MessageSquare, FolderOpen, HelpCircle, BookOpen, Scale, Phone
} from "lucide-react";
import { HubAssistant } from "@/components/hub/HubAssistant";
import { DocumentManager } from "@/components/hub/DocumentManager";
import { CourtPrepTab } from "@/components/hub/CourtPrepTab";
import { WhereToStart } from "@/components/hub/WhereToStart";

const supportCategories = [
  {
    id: "probation",
    name: "Probation Support",
    icon: FileCheck,
    description: "Understanding probation terms and compliance",
    color: "green",
    topics: ["Check-in requirements", "Travel restrictions", "Condition modifications"]
  },
  {
    id: "parole",
    name: "Parole Guidance",
    icon: Shield,
    description: "Parole requirements and reentry support",
    color: "cyan",
    topics: ["Parole hearings", "Supervision terms", "Early discharge"]
  },
  {
    id: "incarceration",
    name: "Incarceration Help",
    icon: Users,
    description: "Rights and resources for incarcerated individuals",
    color: "purple",
    topics: ["Inmate rights", "Transfer requests", "Family communication"]
  },
  {
    id: "reentry",
    name: "Reentry Resources",
    icon: Home,
    description: "Successfully transitioning back to society",
    color: "orange",
    topics: ["Housing assistance", "Job placement", "Record expungement"]
  }
];

const quickResources = [
  { icon: Calendar, label: "Court Dates", desc: "Track important dates" },
  { icon: MapPin, label: "Check-In Locations", desc: "Find your officer" },
  { icon: Briefcase, label: "Job Resources", desc: "Employment help" },
  { icon: Heart, label: "Family Connect", desc: "Stay in touch" }
];

const whereToStartSteps = [
  {
    title: "Understand Your Terms",
    description: "Know exactly what your probation/parole conditions require",
    action: "Review Terms"
  },
  {
    title: "Track Obligations",
    description: "Keep a calendar of check-ins, court dates, and deadlines",
    action: "Set Reminders"
  },
  {
    title: "Document Compliance",
    description: "Keep records of all completed requirements and communications",
    action: "Start Documenting"
  },
  {
    title: "Build Support Network",
    description: "Connect with family, support groups, and community resources",
    action: "Find Support"
  },
  {
    title: "Plan for Success",
    description: "Set goals for housing, employment, and personal development",
    action: "Create Plan"
  }
];

const courtPrepChecklist = [
  { id: "compliance", label: "Document all compliance with conditions", category: "Before Hearing" },
  { id: "programs", label: "Complete any required programs/classes", category: "Before Hearing" },
  { id: "employment", label: "Show proof of employment or job search", category: "Before Hearing" },
  { id: "support", label: "Gather letters of support from family/employers", category: "Before Hearing" },
  { id: "dress", label: "Plan appropriate court attire", category: "Court Day" },
  { id: "early", label: "Arrive 30 minutes early", category: "Court Day" },
  { id: "documents", label: "Bring all required documents", category: "Court Day" },
  { id: "respectful", label: "Be respectful to all court staff", category: "Court Day" },
  { id: "honest", label: "Answer questions honestly and directly", category: "Court Day" },
  { id: "progress", label: "Be prepared to discuss your progress", category: "Court Day" }
];

export default function ProbationParolePage() {
  const [activeTab, setActiveTab] = useState("start");
  const navigate = useNavigate();

  const systemPrompt = `You are RehabilitAI (also called ProbAI), a compassionate AI assistant helping individuals navigate probation, parole, and incarceration in the U.S. legal system (2025).

  YOUR MISSION:
  - Provide clear, empathetic guidance on probation/parole requirements
  - Help users understand their rights while incarcerated or supervised
  - Offer resources for successful reentry into society
  - Support family members seeking to help loved ones
  - Guide users through complex legal processes
  - Analyze uploaded documents (probation orders, parole conditions, etc.)

  KEY AREAS OF SUPPORT:
  1. Probation compliance and modification requests
  2. Parole hearing preparation and requirements
  3. Inmate rights and prison procedures
  4. Transfer requests and facility issues
  5. Reentry resources: housing, employment, expungement
  6. Family communication and visitation guidance
  7. Record expungement and sealing procedures

  DOCUMENT ANALYSIS:
  - Review probation/parole orders to explain conditions
  - Help users understand violation notices
  - Assist with modification request preparation
  - Analyze early termination eligibility

  COMMUNICATION STYLE:
  - Be compassionate and non-judgmental
  - Use clear, simple language
  - Acknowledge the challenges users face
  - Provide actionable next steps
  - Offer hope while being realistic

  IMPORTANT: Always remind users to verify information with their supervising officer or attorney.`;

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="green" size="lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-cyan">RehabilitAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Complete support hub for probation, parole, and reentry. You deserve a second chance.
              </p>
            </div>

            {/* Category Selection */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {supportCategories.map((category) => (
                <Card
                  key={category.id}
                  className="p-4 bg-background/30 backdrop-blur-xl border-border/50 hover:border-neon-green/60 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-neon-green/20">
                      <category.icon className="w-5 h-5 text-neon-green" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Resources */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickResources.map((resource, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl text-center hover:border-neon-green/50 transition-all cursor-pointer">
                  <resource.icon className="w-6 h-6 text-neon-green mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{resource.label}</p>
                  <p className="text-xs text-muted-foreground">{resource.desc}</p>
                </div>
              ))}
            </div>

            {/* Main Hub Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 glass-card p-1">
                <TabsTrigger value="start" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                  <HelpCircle className="w-4 h-4" /> Where to Start
                </TabsTrigger>
                <TabsTrigger value="assistant" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan gap-2">
                  <MessageSquare className="w-4 h-4" /> AI Assistant
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                  <FolderOpen className="w-4 h-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="court" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange gap-2">
                  <Scale className="w-4 h-4" /> Hearing Prep
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                  <BookOpen className="w-4 h-4" /> Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="start">
                <WhereToStart 
                  steps={whereToStartSteps}
                  hubName="Rehabilitation"
                  hubColor="green"
                />
              </TabsContent>

              <TabsContent value="assistant">
                <HubAssistant
                  assistantName="RehabilitAI"
                  assistantVariant="green"
                  systemPrompt={systemPrompt}
                  placeholderText="Share what you need help with or upload your probation/parole documents..."
                  welcomeMessage="I'm RehabilitAI, here to support you through probation, parole, or reentry. Upload your documents and I'll help you understand your conditions, rights, and next steps. You're not alone in this journey."
                />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentManager hubType="probation" />
              </TabsContent>

              <TabsContent value="court">
                <CourtPrepTab 
                  checklist={courtPrepChecklist}
                  caseType="Probation/Parole"
                />
              </TabsContent>

              <TabsContent value="resources">
                <div className="space-y-6">
                  {/* Emergency Resources */}
                  <Card className="glass-card p-6 border-neon-green/30">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">Emergency & Support Hotlines</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-background/30 border border-neon-cyan/30 text-center">
                        <Bell className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
                        <p className="font-medium text-foreground">24/7 Reentry Hotline</p>
                        <a href="tel:1-844-516-5730" className="text-neon-cyan hover:underline">1-844-516-5730</a>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-neon-purple/30 text-center">
                        <Users className="w-6 h-6 text-neon-purple mx-auto mb-2" />
                        <p className="font-medium text-foreground">Family Support Line</p>
                        <a href="tel:1-800-878-6888" className="text-neon-purple hover:underline">1-800-878-6888</a>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-neon-orange/30 text-center">
                        <Briefcase className="w-6 h-6 text-neon-orange mx-auto mb-2" />
                        <p className="font-medium text-foreground">Employment Resources</p>
                        <a href="tel:1-877-872-5627" className="text-neon-orange hover:underline">1-877-872-5627</a>
                      </div>
                    </div>
                  </Card>

                  {/* Reentry Resources */}
                  <Card className="glass-card p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-4">Reentry Resources</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <Home className="w-6 h-6 text-neon-green mb-2" />
                        <h4 className="font-medium text-foreground mb-2">Housing Assistance</h4>
                        <p className="text-sm text-muted-foreground mb-3">Find transitional housing and housing programs for returning citizens.</p>
                        <Button variant="outline" size="sm">Find Housing</Button>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <Briefcase className="w-6 h-6 text-neon-cyan mb-2" />
                        <h4 className="font-medium text-foreground mb-2">Job Placement</h4>
                        <p className="text-sm text-muted-foreground mb-3">Connect with employers who hire returning citizens.</p>
                        <Button variant="outline" size="sm">Find Jobs</Button>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <FileCheck className="w-6 h-6 text-neon-purple mb-2" />
                        <h4 className="font-medium text-foreground mb-2">Record Expungement</h4>
                        <p className="text-sm text-muted-foreground mb-3">Learn about clearing or sealing your criminal record.</p>
                        <Button variant="outline" size="sm">Check Eligibility</Button>
                      </div>
                      <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                        <Heart className="w-6 h-6 text-neon-pink mb-2" />
                        <h4 className="font-medium text-foreground mb-2">Support Groups</h4>
                        <p className="text-sm text-muted-foreground mb-3">Connect with peer support and community groups.</p>
                        <Button variant="outline" size="sm">Find Groups</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Support Notice */}
            <div className="mt-8 glass-card rounded-xl p-4 border-neon-green/30">
              <p className="text-sm text-muted-foreground text-center">
                💚 <strong>You're not alone.</strong> RehabilitAI is here to help you navigate your journey. 
                Remember to always verify information with your probation/parole officer or attorney.
              </p>
            </div>

            {/* Back Button */}
            <div className="text-center mt-6">
              <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>
                ← Back to AI Assistants
              </Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
