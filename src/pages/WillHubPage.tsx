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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, Brain, Users, Building, DollarSign, 
  Shield, Globe, Calculator, Download, Upload,
  Plus, Trash2, Edit, Eye, GitBranch
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdBanner from "@/components/ads/AdBanner";
import AdContainer from "@/components/ads/AdContainer";

interface Asset {
  id: string;
  type: string;
  name: string;
  value: number;
  state: string;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

const WillHubPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", type: "Real Estate", name: "Primary Residence", value: 750000, state: "CA" },
    { id: "2", type: "Investment", name: "Stock Portfolio", value: 250000, state: "CA" },
  ]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    { id: "1", name: "John Smith Jr.", relationship: "Son", percentage: 50 },
    { id: "2", name: "Jane Smith", relationship: "Daughter", percentage: 50 },
  ]);
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [simResult, setSimResult] = useState<any>(null);
  const { toast } = useToast();

  const clauseLibrary = [
    { id: "revocation", name: "Standard Revocation", category: "Standard" },
    { id: "executor", name: "Primary Executor Appointment", category: "Executor" },
    { id: "guardian", name: "Minor Guardian Designation", category: "Guardian" },
    { id: "residuary", name: "Residuary Estate Distribution", category: "Distribution" },
    { id: "dynasty", name: "Dynasty Trust (CA)", category: "Trust" },
    { id: "tax", name: "Estate Tax Minimization", category: "Tax" },
    { id: "digital", name: "Digital Assets Provision", category: "Digital" },
    { id: "pet", name: "Pet Trust", category: "Special" },
  ];

  const runInheritanceSim = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('predictive-ai', {
        body: {
          type: 'inheritance_sim',
          assets,
          beneficiaries,
          scenario: 'standard_distribution'
        }
      });

      if (error) throw error;
      setSimResult(data);
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to generate estate simulation. Please try again.');
      setSimResult(null);
    }
  };

  const generateWill = async () => {
    toast({ title: "Generating Will", description: "WillAI is drafting your document..." });
    // Implementation would call edge function
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Will & Estate Hub</h1>
              <p className="text-muted-foreground">Complete estate planning with AI-powered document assembly</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="purple" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assets">Asset Inventory</TabsTrigger>
              <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
              <TabsTrigger value="clauses">Clause Library</TabsTrigger>
              <TabsTrigger value="simulator">What-If Sim</TabsTrigger>
              <TabsTrigger value="generate">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Estate</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${assets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">{assets.length} assets</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{beneficiaries.length}</div>
                    <p className="text-xs text-muted-foreground">All equal distribution</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Multi-State</CardTitle>
                    <Globe className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(assets.map(a => a.state)).size}
                    </div>
                    <p className="text-xs text-muted-foreground">States with assets</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Est. Tax</CardTitle>
                    <Calculator className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$57,000</div>
                    <p className="text-xs text-muted-foreground">Federal + State</p>
                  </CardContent>
                </Card>
              </div>

              {/* Family Tree Visualization */}
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Family Tree
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                        <span className="text-2xl">👤</span>
                      </div>
                      <p className="font-medium">Testator</p>
                      <div className="flex justify-center mt-8 gap-16">
                        {beneficiaries.map((b, i) => (
                          <div key={b.id} className="text-center">
                            <div className="w-2 h-8 bg-border mx-auto" />
                            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                              <span className="text-xl">👤</span>
                            </div>
                            <p className="text-sm font-medium">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.relationship}</p>
                            <Badge variant="outline" className="mt-1">{b.percentage}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Asset Inventory
                    </span>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Asset
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Building className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{asset.state}</Badge>
                        <p className="font-bold">${asset.value.toLocaleString()}</p>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="beneficiaries" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Beneficiaries
                    </span>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Beneficiary
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {beneficiaries.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{b.name}</p>
                          <p className="text-sm text-muted-foreground">{b.relationship}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={b.percentage} />
                          <p className="text-xs text-center mt-1">{b.percentage}%</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clauses" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Clause Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {clauseLibrary.map((clause) => (
                      <div 
                        key={clause.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedClauses.includes(clause.id) 
                            ? "border-primary bg-primary/10" 
                            : "border-border bg-muted/30 hover:border-primary/50"
                        }`}
                        onClick={() => {
                          setSelectedClauses(prev => 
                            prev.includes(clause.id) 
                              ? prev.filter(id => id !== clause.id)
                              : [...prev, clause.id]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{clause.name}</p>
                            <Badge variant="outline" className="mt-1">{clause.category}</Badge>
                          </div>
                          <Checkbox checked={selectedClauses.includes(clause.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {selectedClauses.length} clauses selected
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6">
              <Card className="bg-card/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-400" />
                    Inheritance What-If Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Scenario</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Distribution</SelectItem>
                          <SelectItem value="spouse_first">Spouse First Scenario</SelectItem>
                          <SelectItem value="trust">Dynasty Trust</SelectItem>
                          <SelectItem value="charity">Charitable Remainder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Asset Growth Rate</Label>
                      <Select defaultValue="5">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="3">3%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="7">7%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Years to Project</Label>
                      <Select defaultValue="10">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="20">20 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={runInheritanceSim} className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <Brain className="mr-2 h-4 w-4" />
                    Run Simulation
                  </Button>

                  {simResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Estate</p>
                          <p className="text-xl font-bold">${simResult.totalEstate?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Federal Tax</p>
                          <p className="text-xl font-bold text-red-400">${simResult.federalTax?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">State Tax</p>
                          <p className="text-xl font-bold text-orange-400">${simResult.stateTax?.toLocaleString()}</p>
                        </div>
                      </div>

                      <h4 className="font-semibold mb-2">Distribution Preview</h4>
                      <div className="space-y-2">
                        {simResult.distributions?.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between p-2 bg-muted/30 rounded">
                            <span>{d.name}</span>
                            <span className="font-semibold text-green-400">
                              ${d.amount?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {simResult.multiStateIssues?.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
                          <p className="text-sm font-medium text-yellow-400">Multi-State Compliance Alert</p>
                          <ul className="text-sm mt-1">
                            {simResult.multiStateIssues.map((issue: string, i: number) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generate Will Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <AnimatedAIHead variant="purple" size="sm" />
                    <div>
                      <p className="font-medium">WillAI Document Generator</p>
                      <p className="text-sm text-muted-foreground">
                        AI-powered will drafting with state-specific compliance
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select defaultValue="simple">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple Will</SelectItem>
                          <SelectItem value="trust">Will with Trust</SelectItem>
                          <SelectItem value="dynasty">Dynasty Trust</SelectItem>
                          <SelectItem value="pour_over">Pour-Over Will</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Existing Will
                    </Button>
                    <Button onClick={generateWill} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                      <Brain className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Document Preview</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-4 w-4" />
                          Export PDF
                        </Button>
                      </div>
                    </div>
                    <div className="h-48 bg-background rounded border border-border flex items-center justify-center">
                      <p className="text-muted-foreground">Generate a will to see preview</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ad Banner for Free Users */}
          <AdContainer position="inline" className="mt-8">
            <AdBanner slot="2847395016" format="horizontal" />
          </AdContainer>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default WillHubPage;
