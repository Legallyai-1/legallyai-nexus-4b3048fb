import { useState } from "react";
import { GlowScales } from "@/components/brand/GlowScales";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Calendar, MessageSquare, DollarSign, 
  FileText, AlertTriangle, Scale, Calculator,
  Upload, Clock, Shield, QrCode, Camera, Sparkles
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentGenerator } from "@/components/hub/DocumentGenerator";

const STATES = ["California", "Texas", "Florida", "New York", "Illinois", "Arizona", "Nevada", "Washington", "Colorado", "Georgia"];

const parentingPlanFields = [
  { id: "parent1Name", label: "Parent 1 Full Name", type: "text" as const, required: true },
  { id: "parent2Name", label: "Parent 2 Full Name", type: "text" as const, required: true },
  { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
  { id: "children", label: "Children (Names and Ages)", type: "textarea" as const, placeholder: "John Smith, 8 years old\nJane Smith, 5 years old", required: true },
  { id: "custodyType", label: "Custody Arrangement", type: "select" as const, options: [
    { value: "joint", label: "Joint Legal & Physical Custody" },
    { value: "primary", label: "Primary Custody with Visitation" },
    { value: "sole", label: "Sole Custody" },
    { value: "split", label: "Split Custody" },
  ], required: true },
  { id: "schedule", label: "Proposed Schedule", type: "textarea" as const, placeholder: "Describe weekly schedule, holidays, summer..." },
  { id: "exchangeLocation", label: "Exchange Location", type: "text" as const, placeholder: "Address or location for exchanges" },
  { id: "specialTerms", label: "Special Terms or Considerations", type: "textarea" as const, placeholder: "Travel restrictions, communication methods, etc." },
];

const custodyMotionFields = [
  { id: "movingParty", label: "Moving Party Name", type: "text" as const, required: true },
  { id: "opposingParty", label: "Opposing Party Name", type: "text" as const, required: true },
  { id: "state", label: "State", type: "select" as const, options: STATES.map(s => ({ value: s.toLowerCase(), label: s })), required: true },
  { id: "caseNumber", label: "Case Number", type: "text" as const, placeholder: "If existing case" },
  { id: "motionType", label: "Type of Motion", type: "select" as const, options: [
    { value: "modify", label: "Motion to Modify Custody" },
    { value: "enforce", label: "Motion to Enforce Custody Order" },
    { value: "contempt", label: "Motion for Contempt" },
    { value: "emergency", label: "Emergency Motion" },
  ], required: true },
  { id: "grounds", label: "Grounds for Motion", type: "textarea" as const, placeholder: "Explain the reasons for this motion...", required: true },
  { id: "reliefSought", label: "Relief Sought", type: "textarea" as const, placeholder: "What do you want the court to order?", required: true },
];

const EnhancedCustodyPage = () => {
  const [activeTab, setActiveTab] = useState("intake");
  const [supportCalc, setSupportCalc] = useState({
    income1: "",
    income2: "",
    custodyPercent: "50",
    childCount: "1",
    state: "CA"
  });
  const [calculatedSupport, setCalculatedSupport] = useState<number | null>(null);
  const { toast } = useToast();

  // Intake form state
  const [intakeForm, setIntakeForm] = useState({
    parent1Name: "",
    parent2Name: "",
    children: "",
    intakeState: "CA",
  });

  const calculateSupport = () => {
    // California child support formula (simplified)
    const income1 = parseFloat(supportCalc.income1) || 0;
    const income2 = parseFloat(supportCalc.income2) || 0;
    const custodyPercent = parseFloat(supportCalc.custodyPercent) / 100;
    const childCount = parseInt(supportCalc.childCount);

    // Base formula: K * (HN - TN * H%)
    // Where K = combined income allocation based on children
    const combinedIncome = income1 + income2;
    const k = childCount === 1 ? 0.25 : childCount === 2 ? 0.40 : 0.50;
    const support = Math.round(k * combinedIncome * (1 - custodyPercent) * (income1 / combinedIncome));
    
    setCalculatedSupport(Math.max(0, support));
  };


  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Child Custody Hub</h1>
              <p className="text-muted-foreground">Parenting plans, custody motions and a rough support estimate. Legal information, not legal advice.</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="purple" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="intake">Intake</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="support">Support Estimate</TabsTrigger>
              <TabsTrigger value="more">More tools</TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="space-y-6">
              <DocumentGenerator
                title="Parenting Plan"
                description="Generate a comprehensive parenting plan with custody schedule and terms"
                documentType="Parenting Plan"
                fields={parentingPlanFields}
                systemPrompt="You are CustodiAI, a legal-information assistant for child custody self-help. Draft a parenting plan template that includes: custody arrangement details, weekly and holiday schedules, exchange procedures, communication guidelines, decision-making provisions, and any special terms. Follow the general conventions of the specified state, flag anything the user should confirm with the court or a licensed attorney, and end with a note that this is a self-help draft, not legal advice."
                colorVariant="purple"
                icon={<Users className="h-5 w-5 text-purple-400" />}
              />
              
              <DocumentGenerator
                title="Custody Motion"
                description="Generate a motion to modify, enforce, or address custody issues"
                documentType="Custody Motion"
                fields={custodyMotionFields}
                systemPrompt="You are CustodiAI, a legal-information assistant for custody self-help. Draft a court motion template with standard formatting, only real and verifiable legal citations (say so if unsure), statement of facts, legal arguments, and prayer for relief. Note that local court formatting rules vary, and end with a note that this is a self-help draft, not legal advice."
                colorVariant="purple"
                icon={<GlowScales className="h-5 w-5 text-purple-400" />}
              />
            </TabsContent>

            <TabsContent value="intake" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    AI-Guided Intake Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <AnimatedAIHead variant="purple" size="sm" />
                    <div>
                      <p className="font-medium">CustodiBot</p>
                      <p className="text-sm text-muted-foreground">
                        I'll guide you through the intake process. Let's start with basic information 
                        about both parents and children involved.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parent 1 Name</Label>
                      <Input
                        placeholder="Full legal name"
                        value={intakeForm.parent1Name}
                        onChange={(e) => setIntakeForm(prev => ({ ...prev, parent1Name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent 2 Name</Label>
                      <Input
                        placeholder="Full legal name"
                        value={intakeForm.parent2Name}
                        onChange={(e) => setIntakeForm(prev => ({ ...prev, parent2Name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Children (Names and Ages)</Label>
                    <Textarea
                      placeholder="John Smith, 8 years old&#10;Jane Smith, 5 years old"
                      value={intakeForm.children}
                      onChange={(e) => setIntakeForm(prev => ({ ...prev, children: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select defaultValue="CA">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Case Type</Label>
                      <Select defaultValue="initial">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="initial">Initial Custody</SelectItem>
                          <SelectItem value="modification">Modification</SelectItem>
                          <SelectItem value="enforcement">Enforcement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-yellow-500">Conflict Check</span>
                    </div>
                    <p className="text-sm">
                      AI will automatically scan for conflicts with other cases in the system.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button className="flex-1" disabled title="Coming soon">
                      <Shield className="mr-2 h-4 w-4" />
                      Run Conflict Check (Coming soon)
                    </Button>
                    <Button className="flex-1" variant="outline" disabled title="Coming soon">
                      Generate Risk Score (Coming soon)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-400" />
                    Child Support Rough Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parent 1 Monthly Income</Label>
                      <Input 
                        type="number"
                        placeholder="5000"
                        value={supportCalc.income1}
                        onChange={(e) => setSupportCalc({...supportCalc, income1: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent 2 Monthly Income</Label>
                      <Input 
                        type="number"
                        placeholder="4000"
                        value={supportCalc.income2}
                        onChange={(e) => setSupportCalc({...supportCalc, income2: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Custody % (Parent 1)</Label>
                      <Select 
                        value={supportCalc.custodyPercent}
                        onValueChange={(v) => setSupportCalc({...supportCalc, custodyPercent: v})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="30">30%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="70">70%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Children</Label>
                      <Select 
                        value={supportCalc.childCount}
                        onValueChange={(v) => setSupportCalc({...supportCalc, childCount: v})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select 
                        value={supportCalc.state}
                        onValueChange={(v) => setSupportCalc({...supportCalc, state: v})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={calculateSupport} className="w-full">
                    Calculate Support
                  </Button>

                  {calculatedSupport !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg border border-green-500/30 text-center"
                    >
                      <p className="text-sm text-muted-foreground">Estimated Monthly Support</p>
                      <p className="text-4xl font-bold text-green-400">${calculatedSupport}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Rough educational estimate using one simplified formula. It is not your state's official guideline
                        worksheet and not legal advice. Use your state's official child support calculator or ask a
                        family-law attorney for the real number.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="more" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Coming soon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    These custody tools are not built yet, so we are not showing them: shared custody calendar,
                    co-parent messaging, expense tracker, violation log, document storage and the custody factors checklist.
                  </p>
                  <p>
                    For now, use the Intake and Generate tabs to draft a parenting plan or custody motion, or ask Lee a question.
                    Always check deadlines and filings with your court or a licensed family-law attorney.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default EnhancedCustodyPage;
