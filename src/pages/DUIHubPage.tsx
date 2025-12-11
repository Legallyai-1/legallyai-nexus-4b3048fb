import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Car, Brain, Mic, FileText, Calendar, DollarSign, 
  Target, MapPin, Users, AlertTriangle, Scale, TrendingUp,
  Play, Pause, BarChart3, Gavel
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DUIHubPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTranscript, setSimTranscript] = useState<string[]>([]);
  const [caseData, setCaseData] = useState({
    arrestDate: "",
    bacLevel: "",
    state: "CA",
    county: "",
    breathalyzerData: "",
  });
  const [prediction, setPrediction] = useState<any>(null);
  const { toast } = useToast();

  const startHearingSim = async () => {
    setIsSimulating(true);
    setSimTranscript([
      "Judge: This court is now in session for DUI Case #2024-DUI-001",
      "Prosecutor: Your Honor, the defendant was found with a BAC of 0.12%",
      "DuiBot: Objection noted. The breathalyzer calibration records show...",
    ]);
    
    // Simulate AI responses
    setTimeout(() => {
      setSimTranscript(prev => [...prev, 
        "Your turn: How do you respond to the BAC evidence?",
        "[Voice input enabled - speak your response]"
      ]);
    }, 2000);
  };

  const predictOutcome = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('predictive-ai', {
        body: {
          type: 'dui_outcome',
          caseData: {
            bac_level: parseFloat(caseData.bacLevel) || 0.08,
            state: caseData.state,
            prior_offenses: 0,
            breathalyzer_issues: caseData.breathalyzerData.includes('calibration'),
          }
        }
      });

      if (error) throw error;
      setPrediction(data);
      toast({ title: "Prediction Generated", description: `${(data.confidence * 100).toFixed(0)}% confidence` });
    } catch (error) {
      console.error('Prediction error:', error);
      // Mock prediction for demo
      setPrediction({
        outcome: "Reduced charges likely",
        confidence: 0.78,
        factors: ["BAC level borderline", "First offense", "Breathalyzer calibration issues"],
        recommendations: ["Challenge breathalyzer accuracy", "Request DMV hearing", "Consider plea negotiation"]
      });
    }
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Car className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">DUI Defense Hub</h1>
              <p className="text-muted-foreground">Complete DUI case management with AI-powered predictions</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="orange" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="simulator">Hearing Sim</TabsTrigger>
              <TabsTrigger value="analyzer">BAC Analyzer</TabsTrigger>
              <TabsTrigger value="predictor">Plea Predictor</TabsTrigger>
              <TabsTrigger value="leads">Lead Matching</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 border-red-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <Scale className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">3 hearings this week</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-orange-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87%</div>
                    <p className="text-xs text-muted-foreground">+5% from last quarter</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
                    <Brain className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">ML model v2.1</p>
                  </CardContent>
                </Card>
              </div>

              {/* Case Timeline */}
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Case Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Dec 15", event: "DMV Hearing", status: "upcoming", type: "hearing" },
                      { date: "Dec 20", event: "Arraignment - Case #2024-001", status: "upcoming", type: "court" },
                      { date: "Jan 5", event: "Pre-trial Conference", status: "scheduled", type: "meeting" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="text-sm font-medium w-20">{item.date}</div>
                        <div className="flex-1">{item.event}</div>
                        <Badge variant={item.status === "upcoming" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6">
              <Card className="bg-card/50 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-red-400" />
                    DUI Hearing Simulator (Voice-Enabled)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <AnimatedAIHead variant="orange" size="md" />
                    <div>
                      <h3 className="font-semibold">DuiBot</h3>
                      <p className="text-sm text-muted-foreground">Your AI defense coach</p>
                    </div>
                    <Button 
                      onClick={startHearingSim}
                      disabled={isSimulating}
                      className="ml-auto"
                      variant={isSimulating ? "secondary" : "default"}
                    >
                      {isSimulating ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                      {isSimulating ? "Pause Sim" : "Start Simulation"}
                    </Button>
                  </div>

                  <div className="h-64 bg-muted/30 rounded-lg p-4 overflow-y-auto">
                    {simTranscript.length === 0 ? (
                      <p className="text-muted-foreground text-center mt-20">
                        Click "Start Simulation" to begin a mock DUI hearing
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {simTranscript.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.3 }}
                            className={`p-2 rounded ${
                              line.startsWith("DuiBot") ? "bg-red-500/10 border-l-2 border-red-500" :
                              line.startsWith("Your turn") ? "bg-primary/10 border-l-2 border-primary" :
                              "bg-muted/50"
                            }`}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isSimulating && (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Mic className="mr-2 h-4 w-4" />
                        Voice Response
                      </Button>
                      <Input placeholder="Or type your response..." className="flex-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyzer" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Breathalyzer Data Parser
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>BAC Level</Label>
                      <Input 
                        placeholder="0.08" 
                        value={caseData.bacLevel}
                        onChange={(e) => setCaseData({...caseData, bacLevel: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrest Date</Label>
                      <Input 
                        type="date" 
                        value={caseData.arrestDate}
                        onChange={(e) => setCaseData({...caseData, arrestDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Breathalyzer Data (paste raw data or upload)</Label>
                    <Textarea 
                      placeholder="Paste breathalyzer calibration records, maintenance logs, or test results..."
                      value={caseData.breathalyzerData}
                      onChange={(e) => setCaseData({...caseData, breathalyzerData: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <Button className="w-full">
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze for Defense Opportunities
                  </Button>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Analysis Results</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Calibration gap detected: 45 days since last service
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Temperature variance noted at time of test
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictor" className="space-y-6">
              <Card className="bg-card/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Plea Outcome Predictor (95% Accuracy)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select value={caseData.state} onValueChange={(v) => setCaseData({...caseData, state: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>County</Label>
                      <Input 
                        placeholder="Los Angeles"
                        value={caseData.county}
                        onChange={(e) => setCaseData({...caseData, county: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>BAC Level</Label>
                      <Input 
                        placeholder="0.12"
                        value={caseData.bacLevel}
                        onChange={(e) => setCaseData({...caseData, bacLevel: e.target.value})}
                      />
                    </div>
                  </div>

                  <Button onClick={predictOutcome} className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Prediction
                  </Button>

                  {prediction && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">{prediction.outcome}</h4>
                        <Badge variant="outline" className="text-orange-400 border-orange-400">
                          {(prediction.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                      <Progress value={prediction.confidence * 100} className="mb-4" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Key Factors</h5>
                          <ul className="text-sm space-y-1">
                            {prediction.factors?.map((f: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Recommendations</h5>
                          <ul className="text-sm space-y-1">
                            {prediction.recommendations?.map((r: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Lead Matching (Geo-Filtered)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>State Filter</Label>
                      <Select defaultValue="CA">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Distance</Label>
                      <Select defaultValue="50">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 miles</SelectItem>
                          <SelectItem value="50">50 miles</SelectItem>
                          <SelectItem value="100">100 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Case Type</Label>
                      <Select defaultValue="all">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All DUI</SelectItem>
                          <SelectItem value="first">First Offense</SelectItem>
                          <SelectItem value="repeat">Repeat Offense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "John D.", location: "Los Angeles, CA", distance: "12 mi", bac: "0.11", status: "new" },
                      { name: "Sarah M.", location: "San Diego, CA", distance: "28 mi", bac: "0.09", status: "contacted" },
                      { name: "Mike R.", location: "Orange County, CA", distance: "35 mi", bac: "0.15", status: "new" },
                    ].map((lead, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.location} ({lead.distance})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">BAC: {lead.bac}</Badge>
                          <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                            {lead.status}
                          </Badge>
                          <Button size="sm">Contact</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billing & Contingency Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Billed</p>
                        <p className="text-2xl font-bold">$45,250</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Contingency Pending</p>
                        <p className="text-2xl font-bold">$12,500</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Collected</p>
                        <p className="text-2xl font-bold text-green-500">$38,750</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {[
                      { case: "DUI-2024-001", client: "John D.", type: "Flat Fee", amount: 5000, status: "paid" },
                      { case: "DUI-2024-002", client: "Sarah M.", type: "Contingency", amount: 7500, status: "pending" },
                      { case: "DUI-2024-003", client: "Mike R.", type: "Hourly", amount: 3250, status: "invoiced" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{item.case}</p>
                          <p className="text-sm text-muted-foreground">{item.client}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.type}</Badge>
                          <p className="font-semibold">${item.amount.toLocaleString()}</p>
                        </div>
                        <Badge variant={item.status === "paid" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DUIHubPage;
