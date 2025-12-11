import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { HubAssistant } from "@/components/hub/HubAssistant";
import { DocumentManager } from "@/components/hub/DocumentManager";
import { CourtPrepTab } from "@/components/hub/CourtPrepTab";
import { WhereToStart } from "@/components/hub/WhereToStart";
import { ChildSupportPayment } from "@/components/hub/ChildSupportPayment";
import { 
  Users, ArrowRight, ArrowLeft, CheckCircle, FileText, Loader2, Sparkles,
  Scale, DollarSign, Shield, Briefcase, Download, Share2, QrCode
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const custodyOptions = [
  { value: "joint", label: "Joint Custody", desc: "Both parents share decision-making and time equally" },
  { value: "primary", label: "Primary Custody", desc: "One parent has primary physical custody" },
  { value: "sole", label: "Sole Custody", desc: "One parent has full legal and physical custody" },
  { value: "visitation", label: "Visitation Rights", desc: "Non-custodial parent has scheduled visits" },
];

export default function CustodyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("start");
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    parentName: "", otherParentName: "", parentPhone: "", parentEmail: "", parentAddress: "",
    childrenCount: "", childrenNames: "", childrenAges: "", childrenSchools: "",
    currentCustody: "", desiredCustody: "", state: "", county: "",
    concerns: "", domesticViolence: "no", substanceAbuse: "no", mentalHealth: "no",
    existingOrders: "no", existingOrderDetails: "", mediationAttempted: "no",
    childPreferences: "", specialNeeds: "", workSchedule: "", otherParentWorkSchedule: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a comprehensive child custody plan:
Parent 1: ${formData.parentName} (${formData.parentPhone}, ${formData.parentEmail})
Parent 2: ${formData.otherParentName}
State/County: ${formData.state}, ${formData.county}
Children: ${formData.childrenNames} (Ages: ${formData.childrenAges})
Schools: ${formData.childrenSchools}
Current: ${formData.currentCustody} | Desired: ${formData.desiredCustody}
Work Schedules: P1: ${formData.workSchedule}, P2: ${formData.otherParentWorkSchedule}
Special Concerns: DV: ${formData.domesticViolence}, Substance: ${formData.substanceAbuse}, Mental Health: ${formData.mentalHealth}
Existing Orders: ${formData.existingOrders === "yes" ? formData.existingOrderDetails : "None"}
Child Preferences: ${formData.childPreferences || "N/A"}
Special Needs: ${formData.specialNeeds || "None"}

Create detailed custody plan with: 1) Legal framework for ${formData.state}, 2) Parenting schedule, 3) Holiday/vacation schedule, 4) Decision-making authority, 5) Communication guidelines, 6) Transportation logistics, 7) Modification procedures.`;

      const { data, error } = await supabase.functions.invoke('legal-chat', {
        body: { messages: [
          { role: "system", content: "You are CustodiAI, an expert in family law and child custody. Generate professional, legally-informed custody plans focused on children's best interests." },
          { role: "user", content: prompt }
        ], stream: false }
      });
      if (error) throw error;
      setGeneratedPlan(data.response);
      setActiveTab("document");
      toast.success("Custody plan generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { id: 1, title: "Your Information" },
    { id: 2, title: "Children Details" },
    { id: 3, title: "Custody Preferences" },
    { id: 4, title: "Safety & History" },
    { id: 5, title: "Work & Schedule" },
  ];

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="purple" size="lg" />
              </div>
              <Badge className="mb-3 bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                <Users className="w-3 h-3 mr-1" /> Child Custody Hub
              </Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                <span className="text-neon-purple">CustodiAI</span> - Complete Custody Center
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                AI-powered custody planning, document management, child support payments, and court preparation
              </p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 mb-6 glass-card">
                <TabsTrigger value="start">Where to Start</TabsTrigger>
                <TabsTrigger value="intake">Case Intake</TabsTrigger>
                <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="support">Child Support</TabsTrigger>
                <TabsTrigger value="court">Court Prep</TabsTrigger>
              </TabsList>

              {/* Where to Start */}
              <TabsContent value="start">
                <div className="grid lg:grid-cols-2 gap-6">
                  <WhereToStart caseType="custody" colorVariant="purple" onNavigate={(section) => {
                    if (section === "gather") setActiveTab("intake");
                    else if (section === "ai-help") setActiveTab("assistant");
                    else if (section === "documents") setActiveTab("documents");
                    else if (section === "court-prep") setActiveTab("court");
                  }} />
                  <HubAssistant
                    assistantName="CustodiAI"
                    variant="purple"
                    systemPrompt="You are CustodiAI, an expert AI assistant for child custody matters. Help users understand custody types, parental rights, and guide them through the process. Always recommend consulting a licensed family law attorney."
                    welcomeMessage="👋 Welcome to the Custody Hub! I'm CustodiAI. I can help you understand custody options, prepare documents, and guide you through court. What would you like help with?"
                    placeholder="Ask about custody, visitation, or child support..."
                  />
                </div>
              </TabsContent>

              {/* Case Intake */}
              <TabsContent value="intake">
                <Card className="glass-card border-neon-purple/30 p-6 max-w-3xl mx-auto">
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-6">
                    {steps.map((step, i) => (
                      <div key={step.id} className="flex items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                          currentStep >= step.id ? "bg-neon-purple text-white" : "bg-muted text-muted-foreground"
                        )}>
                          {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                        </div>
                        {i < steps.length - 1 && <div className={cn("w-8 md:w-16 h-1 mx-1", currentStep > step.id ? "bg-neon-purple" : "bg-muted")} />}
                      </div>
                    ))}
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-4">{steps[currentStep - 1].title}</h3>

                  {/* Step Forms */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><Label>Your Full Name</Label><Input value={formData.parentName} onChange={e => updateField("parentName", e.target.value)} placeholder="Full legal name" className="bg-background/30" /></div>
                        <div><Label>Other Parent's Name</Label><Input value={formData.otherParentName} onChange={e => updateField("otherParentName", e.target.value)} placeholder="Full legal name" className="bg-background/30" /></div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><Label>Your Phone</Label><Input value={formData.parentPhone} onChange={e => updateField("parentPhone", e.target.value)} placeholder="(555) 123-4567" className="bg-background/30" /></div>
                        <div><Label>Your Email</Label><Input value={formData.parentEmail} onChange={e => updateField("parentEmail", e.target.value)} placeholder="email@example.com" className="bg-background/30" /></div>
                      </div>
                      <div><Label>Your Address</Label><Input value={formData.parentAddress} onChange={e => updateField("parentAddress", e.target.value)} placeholder="Street, City, State, ZIP" className="bg-background/30" /></div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><Label>State</Label><Input value={formData.state} onChange={e => updateField("state", e.target.value)} placeholder="e.g., California" className="bg-background/30" /></div>
                        <div><Label>County</Label><Input value={formData.county} onChange={e => updateField("county", e.target.value)} placeholder="e.g., Los Angeles" className="bg-background/30" /></div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><Label>Number of Children</Label><Input type="number" value={formData.childrenCount} onChange={e => updateField("childrenCount", e.target.value)} min="1" className="bg-background/30" /></div>
                        <div><Label>Children's Ages</Label><Input value={formData.childrenAges} onChange={e => updateField("childrenAges", e.target.value)} placeholder="e.g., 8, 5, 3" className="bg-background/30" /></div>
                      </div>
                      <div><Label>Children's Names</Label><Input value={formData.childrenNames} onChange={e => updateField("childrenNames", e.target.value)} placeholder="e.g., Emma, Michael, Sarah" className="bg-background/30" /></div>
                      <div><Label>Schools/Daycare</Label><Input value={formData.childrenSchools} onChange={e => updateField("childrenSchools", e.target.value)} placeholder="School names" className="bg-background/30" /></div>
                      <div><Label>Special Needs (if any)</Label><Textarea value={formData.specialNeeds} onChange={e => updateField("specialNeeds", e.target.value)} placeholder="Medical, educational, or behavioral needs" className="bg-background/30" /></div>
                      <div><Label>Children's Preferences (if applicable)</Label><Textarea value={formData.childPreferences} onChange={e => updateField("childPreferences", e.target.value)} placeholder="Older children may express preferences" className="bg-background/30" /></div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <Label>Current Custody Arrangement</Label>
                      <RadioGroup value={formData.currentCustody} onValueChange={v => updateField("currentCustody", v)} className="space-y-2">
                        {custodyOptions.map(opt => (
                          <label key={opt.value} className={cn("flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                            formData.currentCustody === opt.value ? "bg-neon-purple/20 border border-neon-purple/50" : "bg-background/30 hover:bg-background/50"
                          )}>
                            <RadioGroupItem value={opt.value} />
                            <div><p className="font-medium">{opt.label}</p><p className="text-sm text-muted-foreground">{opt.desc}</p></div>
                          </label>
                        ))}
                      </RadioGroup>
                      <Label className="mt-4">Desired Custody Arrangement</Label>
                      <RadioGroup value={formData.desiredCustody} onValueChange={v => updateField("desiredCustody", v)} className="space-y-2">
                        {custodyOptions.map(opt => (
                          <label key={opt.value} className={cn("flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                            formData.desiredCustody === opt.value ? "bg-neon-purple/20 border border-neon-purple/50" : "bg-background/30 hover:bg-background/50"
                          )}>
                            <RadioGroupItem value={opt.value} />
                            <div><p className="font-medium">{opt.label}</p><p className="text-sm text-muted-foreground">{opt.desc}</p></div>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      {[
                        { field: "domesticViolence", label: "Any history of domestic violence?" },
                        { field: "substanceAbuse", label: "Any substance abuse concerns?" },
                        { field: "mentalHealth", label: "Any mental health concerns?" },
                        { field: "existingOrders", label: "Are there existing court orders?" },
                        { field: "mediationAttempted", label: "Has mediation been attempted?" }
                      ].map(item => (
                        <div key={item.field} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                          <span>{item.label}</span>
                          <RadioGroup value={(formData as any)[item.field]} onValueChange={v => updateField(item.field, v)} className="flex gap-4">
                            <label className="flex items-center gap-2"><RadioGroupItem value="yes" /><span>Yes</span></label>
                            <label className="flex items-center gap-2"><RadioGroupItem value="no" /><span>No</span></label>
                          </RadioGroup>
                        </div>
                      ))}
                      {formData.existingOrders === "yes" && (
                        <div><Label>Describe existing orders</Label><Textarea value={formData.existingOrderDetails} onChange={e => updateField("existingOrderDetails", e.target.value)} className="bg-background/30" /></div>
                      )}
                      <div><Label>Other Concerns</Label><Textarea value={formData.concerns} onChange={e => updateField("concerns", e.target.value)} placeholder="Any other relevant concerns" className="bg-background/30" /></div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <div><Label>Your Work Schedule</Label><Textarea value={formData.workSchedule} onChange={e => updateField("workSchedule", e.target.value)} placeholder="e.g., Mon-Fri 9am-5pm" className="bg-background/30" /></div>
                      <div><Label>Other Parent's Work Schedule</Label><Textarea value={formData.otherParentWorkSchedule} onChange={e => updateField("otherParentWorkSchedule", e.target.value)} placeholder="If known" className="bg-background/30" /></div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-border/30">
                    {currentStep > 1 && <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>}
                    {currentStep < 5 ? (
                      <Button variant="neon-purple" onClick={() => setCurrentStep(s => s + 1)} className="flex-1">Continue<ArrowRight className="w-4 h-4 ml-1" /></Button>
                    ) : (
                      <Button variant="neon-purple" onClick={handleGenerate} disabled={isGenerating} className="flex-1">
                        {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Generating...</> : <>Generate Plan<Sparkles className="w-4 h-4 ml-1" /></>}
                      </Button>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* AI Assistant */}
              <TabsContent value="assistant">
                <div className="max-w-4xl mx-auto">
                  <HubAssistant
                    assistantName="CustodiAI"
                    variant="purple"
                    systemPrompt="You are CustodiAI, an expert AI assistant for child custody. Help with custody plans, parenting schedules, child support calculations, court preparation, and document generation. Analyze uploaded documents. Always recommend consulting a licensed family law attorney for legal advice."
                    placeholder="Ask about custody, upload documents, or request help with paperwork..."
                    welcomeMessage="I'm CustodiAI, your child custody assistant. I can help you:\n\n• Generate custody agreements and parenting plans\n• Calculate child support estimates\n• Prepare for court hearings\n• Analyze documents you upload\n• Answer questions about custody law\n\nHow can I help you today?"
                  />
                </div>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents">
                <div className="grid lg:grid-cols-2 gap-6">
                  <DocumentManager colorVariant="purple" />
                  {generatedPlan && (
                    <Card className="glass-card border-neon-purple/30 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5 text-neon-purple" />
                          Generated Custody Plan
                        </h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />PDF</Button>
                          <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-1" />Share</Button>
                          <Button variant="outline" size="sm"><QrCode className="w-4 h-4 mr-1" />Show to Police</Button>
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto p-4 rounded-lg bg-background/30 border border-border/50">
                        <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">{generatedPlan}</pre>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Child Support */}
              <TabsContent value="support">
                <div className="max-w-2xl mx-auto">
                  <ChildSupportPayment />
                </div>
              </TabsContent>

              {/* Court Prep */}
              <TabsContent value="court">
                <div className="max-w-3xl mx-auto">
                  <CourtPrepTab caseType="custody" colorVariant="purple" />
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-8">
              <Button variant="ghost" onClick={() => navigate("/ai-assistants")}>← Back to AI Assistants</Button>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
