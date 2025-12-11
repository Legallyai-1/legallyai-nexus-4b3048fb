import { useState } from "react";
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
  Upload, Clock, Shield, QrCode, Camera
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const expenses = [
    { id: 1, category: "Medical", amount: 250, date: "Dec 5", status: "pending", payer: "Parent 1" },
    { id: 2, category: "Education", amount: 500, date: "Dec 1", status: "split", payer: "Both" },
    { id: 3, category: "Childcare", amount: 800, date: "Nov 28", status: "paid", payer: "Parent 2" },
  ];

  const calendarEvents = [
    { id: 1, title: "School Pickup - Parent 1", date: "Dec 11", time: "3:00 PM", type: "custody" },
    { id: 2, title: "Doctor Appointment", date: "Dec 13", time: "10:00 AM", type: "medical" },
    { id: 3, title: "Weekend Exchange", date: "Dec 15", time: "6:00 PM", type: "exchange" },
  ];

  const violations = [
    { id: 1, type: "Late pickup", date: "Dec 8", severity: "minor", status: "logged" },
    { id: 2, type: "Missed exchange", date: "Nov 25", severity: "major", status: "reported" },
  ];

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
              <p className="text-muted-foreground">CustodiAI - Complete custody management like OurFamilyWizard</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="purple" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="intake">Intake</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="support">Support Calc</TabsTrigger>
              <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="qrcode">Show to Police</TabsTrigger>
            </TabsList>

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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Parent 1 Name</Label>
                      <Input placeholder="Full legal name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parent 2 Name</Label>
                      <Input placeholder="Full legal name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Children (Names and Ages)</Label>
                    <Textarea placeholder="John Smith, 8 years old&#10;Jane Smith, 5 years old" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Shield className="mr-2 h-4 w-4" />
                      Run Conflict Check
                    </Button>
                    <Button className="flex-1" variant="outline">
                      Generate Risk Score
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Shared Custody Calendar
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Sync Outlook</Button>
                      <Button size="sm">Add Event</Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 bg-muted/30 rounded-lg p-4">
                    <p className="text-center text-muted-foreground mb-4">
                      Drag-and-drop calendar (FullCalendar integration)
                    </p>
                    <div className="space-y-2">
                      {calendarEvents.map(event => (
                        <div 
                          key={event.id}
                          className={`p-3 rounded-lg ${
                            event.type === "custody" ? "bg-purple-500/10 border-l-4 border-purple-500" :
                            event.type === "medical" ? "bg-blue-500/10 border-l-4 border-blue-500" :
                            "bg-green-500/10 border-l-4 border-green-500"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {event.date} at {event.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-purple-500/10">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">15</p>
                        <p className="text-sm text-muted-foreground">Parent 1 Days</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-pink-500/10">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">15</p>
                        <p className="text-sm text-muted-foreground">Parent 2 Days</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-500/10">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">50%</p>
                        <p className="text-sm text-muted-foreground">Custody Split</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messaging" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Secure Messaging (Unalterable)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 text-sm">
                    <p>
                      <strong>Legal Notice:</strong> All messages are timestamped, stored permanently, 
                      and cannot be edited or deleted. They may be used as evidence in court.
                    </p>
                  </div>

                  <div className="h-64 bg-muted/30 rounded-lg p-4 overflow-y-auto space-y-3">
                    {[
                      { from: "Parent 1", msg: "Can we swap weekends? I have a work trip.", time: "Dec 10, 2:30 PM" },
                      { from: "Parent 2", msg: "That works for me. Please confirm new dates.", time: "Dec 10, 3:15 PM" },
                      { from: "Parent 1", msg: "Great, I'll take Dec 21-22 instead of Dec 14-15.", time: "Dec 10, 3:45 PM" },
                    ].map((m, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg ${
                          m.from === "Parent 1" ? "bg-purple-500/10 ml-auto max-w-[70%]" : "bg-muted max-w-[70%]"
                        }`}
                      >
                        <p className="text-sm font-medium">{m.from}</p>
                        <p>{m.msg}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.time}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Expense Tracker (OCR Enabled)
                    </span>
                    <Button size="sm">
                      <Upload className="mr-1 h-4 w-4" />
                      Upload Receipt
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">$1,550</p>
                        <p className="text-sm text-muted-foreground">Total This Month</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-400">$775</p>
                        <p className="text-sm text-muted-foreground">Your Share</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-red-400">$250</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {expenses.map(exp => (
                      <div key={exp.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{exp.category}</p>
                          <p className="text-sm text-muted-foreground">{exp.date} • {exp.payer}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">${exp.amount}</span>
                          <Badge variant={exp.status === "paid" ? "default" : "secondary"}>
                            {exp.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card className="bg-card/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-400" />
                    Child Support Calculator (State-Specific)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-3 gap-4">
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
                        Based on {supportCalc.state} guidelines
                      </p>
                      <Button className="mt-4" variant="outline">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Set Up Payment via Stripe
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enforcement" className="space-y-6">
              <Card className="bg-card/50 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Enforcement & Violations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {violations.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            v.severity === "major" ? "bg-red-500" : "bg-yellow-500"
                          }`} />
                          <div>
                            <p className="font-medium">{v.type}</p>
                            <p className="text-sm text-muted-foreground">{v.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={v.severity === "major" ? "destructive" : "secondary"}>
                            {v.severity}
                          </Badge>
                          <Badge variant="outline">{v.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Court Report
                    </Button>
                    <Button variant="outline">
                      <Scale className="mr-2 h-4 w-4" />
                      File Modification Petition
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">AI Outcome Prediction</span>
                    </div>
                    <p className="text-sm">
                      Based on current violations and history, there's a <strong>50% probability</strong> of 
                      custody modification if you file a motion.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Management
                    </span>
                    <Button size="sm">
                      <Upload className="mr-1 h-4 w-4" />
                      Upload
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Custody Order", date: "Nov 15, 2024", type: "Court Order" },
                      { name: "Parenting Plan", date: "Nov 15, 2024", type: "Agreement" },
                      { name: "Support Calculation", date: "Dec 1, 2024", type: "Financial" },
                      { name: "Modification Request", date: "Dec 8, 2024", type: "Petition" },
                    ].map((doc, i) => (
                      <Card key={i} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.date}</p>
                              <Badge variant="outline" className="mt-1">{doc.type}</Badge>
                            </div>
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qrcode" className="space-y-6">
              <Card className="bg-card/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-400" />
                    Show to Police - Custody Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="h-32 w-32 text-black" />
                    </div>
                    <p className="font-medium">Custody Order #2024-FAM-001</p>
                    <p className="text-sm text-muted-foreground">
                      Scan to verify custody arrangements
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <h4 className="font-medium mb-2">Current Custody Status</h4>
                    <ul className="space-y-1 text-sm">
                      <li>✓ Valid custody order in effect</li>
                      <li>✓ Current custodial parent: Parent 1</li>
                      <li>✓ Exchange scheduled: Dec 15, 6:00 PM</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Open Camera for Officer Verification
                  </Button>
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
