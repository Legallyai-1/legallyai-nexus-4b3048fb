import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gavel, Car, AlertTriangle, FileText, Shield, Scale, Clock, DollarSign,
  FolderOpen, MessageSquare, HelpCircle, BookOpen
} from "lucide-react";
import { HubAssistant } from "@/components/hub/HubAssistant";
import { DocumentManager } from "@/components/hub/DocumentManager";
import { CourtPrepTab } from "@/components/hub/CourtPrepTab";
import { WhereToStart } from "@/components/hub/WhereToStart";
import { DocuAI } from "@/components/hub/DocuAI";

const defenseCategories = [
  {
    id: "traffic",
    name: "Traffic Tickets",
    icon: Car,
    description: "Speeding, red lights, parking violations",
    color: "cyan",
    examples: ["Speeding ticket defense", "Red light camera", "Parking violations"]
  },
  {
    id: "misdemeanor",
    name: "Misdemeanors",
    icon: AlertTriangle,
    description: "Minor criminal offenses",
    color: "orange",
    examples: ["Petty theft", "Simple assault", "DUI/DWI first offense"]
  },
  {
    id: "felony",
    name: "Felony Guidance",
    icon: Gavel,
    description: "Serious criminal charges",
    color: "pink",
    examples: ["Understanding charges", "Rights overview", "Finding representation"]
  },
  {
    id: "court-prep",
    name: "Court Preparation",
    icon: Scale,
    description: "Get ready for your court date",
    color: "purple",
    examples: ["What to wear", "What to say", "Required documents"]
  }
];

const whereToStartSteps = [
  {
    title: "Understand Your Charges",
    description: "Learn exactly what you're being charged with and potential penalties",
    action: "Review with AI"
  },
  {
    title: "Gather Evidence",
    description: "Collect photos, witness statements, and any documentation",
    action: "Upload Documents"
  },
  {
    title: "Know Your Rights",
    description: "Understand your constitutional rights during the legal process",
    action: "Learn Rights"
  },
  {
    title: "Explore Defense Options",
    description: "Review possible defenses specific to your case type",
    action: "Get Defense Ideas"
  },
  {
    title: "Prepare for Court",
    description: "Know what to expect, what to wear, and how to present yourself",
    action: "Court Prep Guide"
  }
];

const courtPrepChecklist = [
  { id: "charges", label: "Understand all charges against you", category: "Before Court" },
  { id: "evidence", label: "Organize all evidence and documents", category: "Before Court" },
  { id: "witnesses", label: "Prepare witness list if applicable", category: "Before Court" },
  { id: "dress", label: "Plan professional court attire", category: "Before Court" },
  { id: "arrive", label: "Arrive 30 minutes early", category: "Court Day" },
  { id: "phone", label: "Turn off phone before entering", category: "Court Day" },
  { id: "address", label: "Address judge as 'Your Honor'", category: "Court Day" },
  { id: "stand", label: "Stand when speaking to the court", category: "Court Day" },
  { id: "calm", label: "Stay calm and respectful at all times", category: "Court Day" },
  { id: "notes", label: "Take notes of proceedings", category: "Court Day" }
];

export default function TicketsDefensePage() {
  const [activeTab, setActiveTab] = useState("start");
  const navigate = useNavigate();

  const systemPrompt = `You are Defendr, an AI legal assistant specializing in traffic tickets and criminal defense guidance for U.S. law (2025). 
  You help users understand their charges, potential defenses, court procedures, and rights.
  
  IMPORTANT GUIDELINES:
  - Provide general information about legal processes and rights
  - Explain potential defense strategies in understandable terms
  - Guide users on court preparation and procedures
  - Analyze any uploaded documents (tickets, citations, police reports)
  - Help users organize evidence and build their defense
  - Always recommend consulting with a licensed attorney for specific legal advice
  - Be compassionate and non-judgmental
  
  DOCUMENT ANALYSIS:
  - When users upload tickets, explain the violation and potential penalties
  - Identify errors on citations that could help the defense
  - Suggest what additional evidence might be helpful
  
  DISCLAIMER: Always remind users this is informational guidance, not legal advice.`;

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="pink" size="lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-orange">Defendr</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Complete defense hub for traffic tickets and criminal cases. AI-powered guidance every step of the way.
              </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {defenseCategories.map((category) => (
                <Card
                  key={category.id}
                  className="p-4 bg-background/30 backdrop-blur-xl border-border/50 hover:border-neon-pink/60 transition-all cursor-pointer text-center"
                >
                  <div className="p-3 rounded-xl bg-neon-pink/20 w-fit mx-auto mb-2">
                    <category.icon className="w-6 h-6 text-neon-pink" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Clock, label: "Time Limits", desc: "Know your deadlines", color: "neon-cyan" },
                { icon: DollarSign, label: "Fines & Fees", desc: "Understand costs", color: "neon-green" },
                { icon: Shield, label: "Your Rights", desc: "Protected by law", color: "neon-purple" },
                { icon: FileText, label: "Documents", desc: "What to bring", color: "neon-orange" }
              ].map((tip, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl text-center">
                  <tip.icon className={`w-6 h-6 text-${tip.color} mx-auto mb-2`} />
                  <p className="text-sm font-medium text-foreground">{tip.label}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>

            {/* Main Hub Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 glass-card p-1">
                <TabsTrigger value="start" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink gap-2">
                  <HelpCircle className="w-4 h-4" /> Where to Start
                </TabsTrigger>
                <TabsTrigger value="assistant" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan gap-2">
                  <MessageSquare className="w-4 h-4" /> AI Assistant
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green gap-2">
                  <FolderOpen className="w-4 h-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="court" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple gap-2">
                  <Scale className="w-4 h-4" /> Court Prep
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-neon-orange/20 data-[state=active]:text-neon-orange gap-2">
                  <BookOpen className="w-4 h-4" /> Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent value="start">
                <WhereToStart 
                  caseType="defense"
                  colorVariant="pink"
                />
              </TabsContent>

              <TabsContent value="assistant">
                <HubAssistant
                  assistantName="Defendr"
                  colorVariant="pink"
                  systemPrompt={systemPrompt}
                  placeholderText="Describe your case, upload your ticket, or ask about your defense options..."
                  welcomeMessage="I'm Defendr, your AI defense assistant. Upload your ticket or citation and I'll help you understand your options, build your defense, and prepare for court."
                />
              </TabsContent>

              <TabsContent value="documents">
                <div className="grid lg:grid-cols-2 gap-6">
                  <DocuAI colorVariant="pink" hubContext="defense" />
                  <DocumentManager colorVariant="pink" />
                </div>
              </TabsContent>

              <TabsContent value="court">
                <CourtPrepTab 
                  caseType="defense"
                  colorVariant="pink"
                />
              </TabsContent>

              <TabsContent value="resources">
                <Card className="glass-card p-6">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-4">Legal Resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                      <h4 className="font-medium text-foreground mb-2">Traffic Violation Penalties</h4>
                      <p className="text-sm text-muted-foreground mb-3">Understand point systems, fines, and license suspensions by state.</p>
                      <Button variant="outline" size="sm">View Guide</Button>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                      <h4 className="font-medium text-foreground mb-2">Know Your Rights</h4>
                      <p className="text-sm text-muted-foreground mb-3">Constitutional rights during traffic stops and arrests.</p>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                      <h4 className="font-medium text-foreground mb-2">Find a Defense Attorney</h4>
                      <p className="text-sm text-muted-foreground mb-3">Connect with licensed criminal defense lawyers near you.</p>
                      <Button variant="outline" size="sm">Find Attorney</Button>
                    </div>
                    <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                      <h4 className="font-medium text-foreground mb-2">DUI/DWI Information</h4>
                      <p className="text-sm text-muted-foreground mb-3">Specific guidance for driving under the influence cases.</p>
                      <Button variant="outline" size="sm">Read More</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="mt-8 glass-card rounded-xl p-4 border-neon-orange/30">
              <p className="text-sm text-muted-foreground text-center">
                ⚠️ <strong>Important:</strong> Defendr provides general legal information only, not legal advice. 
                For criminal matters, always consult with a licensed attorney. Your rights matter.
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
