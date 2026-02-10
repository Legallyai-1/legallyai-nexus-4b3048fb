import { useState } from "react";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, FileText, Calculator, Users, MessageSquare, 
  Sparkles, Send, ArrowRight, Clock, DollarSign,
  FileCheck, Scale, Home, Calendar, Star
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DocumentGenerator } from "@/components/hub/DocumentGenerator";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";

const STATES = ["California", "Texas", "Florida", "New York", "Illinois", "Arizona", "Nevada", "Washington", "Colorado", "Georgia"];

export default function MarriageDivorcePage() {
  const [activeTab, setActiveTab] = useState("start");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("legal-chat", {
        body: {
          messages: [
            { role: "system", content: `You are MaryAI, a specialized AI assistant for marriage and divorce law. Help users with:
- Marriage licenses and requirements
- Wedding planning legal aspects
- Name change procedures
- Prenuptial agreements
- Divorce filings and procedures
- Alimony/spousal support calculations
- Property division guidance
- Mediation preparation
Always be compassionate and thorough. Provide state-specific guidance when possible.` },
            ...chatMessages,
            userMessage
          ],
          stream: false
        }
      });

      if (error) throw error;
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const prenupFields = [
    { id: "party1Name", label: "Party 1 Full Legal Name", type: "text" as const, placeholder: "Enter first party's name", required: true },
    { id: "party2Name", label: "Party 2 Full Legal Name", type: "text" as const, placeholder: "Enter second party's name", required: true },
    { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
    { id: "weddingDate", label: "Planned Wedding Date", type: "date" as const, required: true },
    { id: "party1Assets", label: "Party 1 Assets to Protect", type: "textarea" as const, placeholder: "List assets (real estate, business interests, investments, etc.)" },
    { id: "party2Assets", label: "Party 2 Assets to Protect", type: "textarea" as const, placeholder: "List assets (real estate, business interests, investments, etc.)" },
    { id: "party1Debts", label: "Party 1 Pre-Marital Debts", type: "textarea" as const, placeholder: "List any debts (student loans, credit cards, etc.)" },
    { id: "party2Debts", label: "Party 2 Pre-Marital Debts", type: "textarea" as const, placeholder: "List any debts" },
  ];

  const nameChangeFields = [
    { id: "currentName", label: "Current Legal Name", type: "text" as const, placeholder: "Your full current legal name", required: true },
    { id: "newName", label: "New Name After Marriage", type: "text" as const, placeholder: "Your desired new name", required: true },
    { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
    { id: "marriageDate", label: "Marriage Date", type: "date" as const, required: true },
    { id: "ssn", label: "Last 4 digits of SSN", type: "text" as const, placeholder: "XXXX" },
    { id: "driversLicense", label: "Driver's License State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })) },
  ];

  const divorceFields = [
    { id: "petitionerName", label: "Petitioner Name", type: "text" as const, placeholder: "Person filing for divorce", required: true },
    { id: "respondentName", label: "Respondent Name", type: "text" as const, placeholder: "Other spouse", required: true },
    { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
    { id: "marriageDate", label: "Date of Marriage", type: "date" as const, required: true },
    { id: "separationDate", label: "Date of Separation", type: "date" as const },
    { id: "grounds", label: "Grounds for Divorce", type: "select" as const, options: [
      { value: "irreconcilable", label: "Irreconcilable Differences (No-Fault)" },
      { value: "separation", label: "Legal Separation Period" },
      { value: "other", label: "Other (specify in notes)" },
    ], required: true },
    { id: "children", label: "Number of Minor Children", type: "number" as const, placeholder: "0" },
    { id: "propertyDescription", label: "Marital Property Overview", type: "textarea" as const, placeholder: "Describe major assets (home, vehicles, accounts, etc.)" },
  ];

  const settlementFields = [
    { id: "party1Name", label: "Party 1 Name", type: "text" as const, required: true },
    { id: "party2Name", label: "Party 2 Name", type: "text" as const, required: true },
    { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
    { id: "propertyDivision", label: "Property Division Terms", type: "textarea" as const, placeholder: "Describe how property will be divided", required: true },
    { id: "debtDivision", label: "Debt Division Terms", type: "textarea" as const, placeholder: "Describe how debts will be divided" },
    { id: "spousalSupport", label: "Spousal Support Terms", type: "textarea" as const, placeholder: "Amount, duration, conditions" },
    { id: "childCustody", label: "Child Custody Arrangement", type: "textarea" as const, placeholder: "Custody arrangement details (if applicable)" },
    { id: "childSupport", label: "Child Support Terms", type: "textarea" as const, placeholder: "Amount and payment schedule (if applicable)" },
  ];

  return (
    <Layout>
      <FuturisticBackground variant="dense">
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-pink/30 blur-2xl rounded-full" />
                  <AnimatedAIHead variant="pink" size="lg" />
                </div>
              </div>
              <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/30 mb-3">
                <Star className="w-3 h-3 mr-1" /> vs Rocket Lawyer
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
                Mary<span className="text-neon-pink">AI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Marriage & Divorce Assistant • Licenses • Name Changes • Alimony Calculators • Mediation
              </p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-background/50 border border-neon-pink/30 rounded-xl p-1 mb-6">
                <TabsTrigger value="start" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start
                </TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask MaryAI
                </TabsTrigger>
                <TabsTrigger value="marriage" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <Heart className="w-4 h-4 mr-2" />
                  Marriage
                </TabsTrigger>
                <TabsTrigger value="prenup" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <FileText className="w-4 h-4 mr-2" />
                  Prenup
                </TabsTrigger>
                <TabsTrigger value="divorce" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <Scale className="w-4 h-4 mr-2" />
                  Divorce
                </TabsTrigger>
                <TabsTrigger value="calculator" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculators
                </TabsTrigger>
              </TabsList>

              {/* Where to Start Tab */}
              <TabsContent value="start">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: Heart, title: "Getting Married?", desc: "Marriage licenses, requirements, name changes", color: "pink", action: () => setActiveTab("marriage") },
                    { icon: Scale, title: "Considering Divorce?", desc: "Filing procedures, property division, support", color: "purple", action: () => setActiveTab("divorce") },
                    { icon: Calculator, title: "Calculate Support", desc: "Alimony and asset division estimators", color: "green", action: () => setActiveTab("calculator") },
                    { icon: FileText, title: "Prenuptial Agreement", desc: "Protect assets before marriage", color: "blue", action: () => setActiveTab("prenup") },
                    { icon: Users, title: "Mediation Help", desc: "Prepare for divorce mediation", color: "orange", action: () => setActiveTab("chat") },
                    { icon: MessageSquare, title: "Ask MaryAI", desc: "Get personalized guidance", color: "cyan", action: () => setActiveTab("chat") },
                  ].map((item, i) => (
                    <Card 
                      key={i}
                      onClick={item.action}
                      className={`glass-card p-6 cursor-pointer hover:border-neon-${item.color}/50 transition-all hover:shadow-[0_0_30px_hsl(var(--neon-${item.color})/0.2)]`}
                    >
                      <item.icon className={`w-10 h-10 text-neon-${item.color} mb-4`} />
                      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat">
                <Card className="glass-card border-neon-pink/30">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <AnimatedAIHead variant="pink" size="md" />
                        <p className="text-muted-foreground mt-4">Hi! I'm MaryAI. Ask me anything about marriage or divorce.</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                          {["Marriage license requirements", "Divorce filing process", "Alimony calculation"].map(q => (
                            <Button key={q} variant="outline" size="sm" onClick={() => { setChatInput(q); }}>
                              {q}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            msg.role === "user" 
                              ? "bg-neon-pink/20 text-foreground" 
                              : "bg-muted/50"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted/50 rounded-xl px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border/30 p-4">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask MaryAI about marriage or divorce..."
                        className="flex-1"
                      />
                      <Button variant="neon" onClick={handleSendMessage} disabled={isLoading}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Marriage Tab */}
              <TabsContent value="marriage">
                <div className="space-y-8">
                  <DocumentGenerator
                    title="Name Change Forms"
                    description="Generate all necessary forms for legally changing your name after marriage"
                    documentType="Name Change Package"
                    fields={nameChangeFields}
                    systemPrompt="You are MaryAI, an expert in marriage-related legal documents. Generate comprehensive name change forms and instructions specific to the user's state. Include DMV, Social Security, bank notification templates, and a checklist of all organizations to notify."
                    colorVariant="pink"
                    icon={<FileCheck className="h-5 w-5 text-neon-pink" />}
                  />
                  
                  <Card className="glass-card p-6 border-neon-pink/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-neon-pink" />
                      Marriage License Information
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Ask MaryAI about specific marriage license requirements for your state and county.
                    </p>
                    <Button variant="neon" onClick={() => setActiveTab("chat")}>
                      Ask MaryAI <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </div>
              </TabsContent>

              {/* Prenup Tab */}
              <TabsContent value="prenup">
                <div className="space-y-8">
                  <DocumentGenerator
                    title="Prenuptial Agreement"
                    description="Create a comprehensive prenuptial agreement to protect both parties' assets"
                    documentType="Prenuptial Agreement"
                    fields={prenupFields}
                    systemPrompt="You are MaryAI, an expert in prenuptial agreements. Generate a comprehensive, legally-sound prenuptial agreement based on the provided information. Include standard clauses for asset protection, debt allocation, property division upon divorce, spousal support waivers or terms, and any state-specific requirements. Make it professional and suitable for attorney review."
                    colorVariant="blue"
                    icon={<FileText className="h-5 w-5 text-neon-blue" />}
                  />
                  
                  <Card className="glass-card p-6 border-neon-cyan/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-neon-cyan" />
                      Prenup Requirements by State
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Valid Requirements</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Written agreement</li>
                          <li>• Voluntary signing</li>
                          <li>• Full financial disclosure</li>
                          <li>• Signed before wedding</li>
                        </ul>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Recommended</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Independent attorneys</li>
                          <li>• Notarization</li>
                          <li>• Waiting period</li>
                          <li>• Fair terms</li>
                        </ul>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Cannot Include</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Child custody terms</li>
                          <li>• Child support waivers</li>
                          <li>• Illegal provisions</li>
                          <li>• Personal behavior rules</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Divorce Tab */}
              <TabsContent value="divorce">
                <div className="space-y-8">
                  <DocumentGenerator
                    title="Divorce Petition"
                    description="Generate divorce filing documents based on your state and circumstances"
                    documentType="Divorce Petition"
                    fields={divorceFields}
                    systemPrompt="You are MaryAI, an expert in divorce law. Generate a comprehensive divorce petition based on the provided information. Include all required sections: parties' information, grounds for divorce, property and debt descriptions, child custody requests if applicable, and relief requested. Follow the format required by the user's state court."
                    colorVariant="purple"
                    icon={<Scale className="h-5 w-5 text-neon-purple" />}
                  />
                  
                  <DocumentGenerator
                    title="Marital Settlement Agreement"
                    description="Create a settlement agreement for property division and support terms"
                    documentType="Marital Settlement Agreement"
                    fields={settlementFields}
                    systemPrompt="You are MaryAI, an expert in divorce settlements. Generate a comprehensive marital settlement agreement covering all aspects of the divorce: property division, debt allocation, spousal support, and child-related matters if applicable. Make it legally sound and suitable for court filing."
                    colorVariant="purple"
                    icon={<Home className="h-5 w-5 text-neon-purple" />}
                  />
                </div>
              </TabsContent>

              {/* Calculator Tab */}
              <TabsContent value="calculator">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card p-6 border-neon-green/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-neon-green" />
                      Alimony Estimator
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Your Annual Income</Label>
                        <Input type="number" placeholder="$0" />
                      </div>
                      <div>
                        <Label>Spouse's Annual Income</Label>
                        <Input type="number" placeholder="$0" />
                      </div>
                      <div>
                        <Label>Length of Marriage (years)</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <Button variant="neon-green" className="w-full">
                        Calculate Estimate
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        *Estimates vary by state. Consult an attorney for accurate figures.
                      </p>
                    </div>
                  </Card>

                  <Card className="glass-card p-6 border-neon-cyan/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-neon-cyan" />
                      Timeline Estimator
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Estimate how long your divorce process may take based on your situation.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                          <span className="text-muted-foreground">Uncontested (no children)</span>
                          <span className="font-semibold text-neon-green">2-3 months</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                          <span className="text-muted-foreground">Uncontested (with children)</span>
                          <span className="font-semibold text-neon-cyan">3-6 months</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                          <span className="text-muted-foreground">Contested</span>
                          <span className="font-semibold text-neon-orange">6-18 months</span>
                        </div>
                      </div>
                      <Button variant="neon-outline" className="w-full" onClick={() => setActiveTab("chat")}>
                        Get Personalized Estimate
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Ad Banner for Free Users */}
            <AdContainer position="inline" className="mt-8">
              <AdBanner slot="7461825930" format="horizontal" />
            </AdContainer>

            {/* Legal Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                ⚠️ MaryAI provides general information only. This is not legal advice. Consult a licensed attorney for your specific situation.
              </p>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}