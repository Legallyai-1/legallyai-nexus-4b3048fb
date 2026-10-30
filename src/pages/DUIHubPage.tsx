import { useState } from "react";
import { GlowScales } from "@/components/brand/GlowScales";
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
import { useToast } from "@/hooks/use-toast";

const DUIHubPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTranscript, setSimTranscript] = useState<string[]>([]);
  const [simResponse, setSimResponse] = useState("");
  const [caseData, setCaseData] = useState({
    arrestDate: "",
    bacLevel: "",
    state: "CA",
    county: "",
    breathalyzerData: "",
  });
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

  const handleSimResponse = () => {
    if (!simResponse.trim()) return;
    setSimTranscript(prev => [...prev, `You: ${simResponse}`]);
    setSimResponse("");
    // Simulate AI judge response
    setTimeout(() => {
      setSimTranscript(prev => [...prev,
        "Judge: Thank you for your response. The court will consider this testimony.",
        "DuiBot: Strong response. Consider also citing the maintenance logs timeline.",
      ]);
    }, 1500);
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
              <p className="text-muted-foreground">DUI case preparation and resource management</p>
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
                    <GlowScales className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No cases yet</p>
                  </CardContent>
                </Card>


                <Card className="bg-card/50 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Outcome Predictions</CardTitle>
                    <Brain className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">Unavailable</div>
                    <p className="text-xs text-muted-foreground">No validated legal-outcome model is configured.</p>
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
                    <p className="text-sm text-muted-foreground">No cases yet</p>
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
                        Click "Start Simulation" to begin a DUI hearing simulation
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
                      <Button variant="outline" className="flex-shrink-0" onClick={handleSimResponse}>
                        <Mic className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                      <Input
                        placeholder="Or type your response..."
                        className="flex-1"
                        value={simResponse}
                        onChange={(e) => setSimResponse(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSimResponse()}
                      />
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

            <TabsContent value="predictor">
              <Card className="bg-card/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Plea Outcome Predictions Unavailable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No validated legal-outcome model is configured. Speak with a licensed attorney about case-specific outcomes.
                  </p>
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
                    <p className="text-sm text-muted-foreground">No leads yet</p>
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
                        <p className="text-2xl font-bold">$0</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Contingency Pending</p>
                        <p className="text-2xl font-bold">$0</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Collected</p>
                        <p className="text-2xl font-bold text-green-500">$0</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">No billing records yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ad Banner for Free Users */}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DUIHubPage;
