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
                <Star className="w-3 h-3 mr-1" /> 10/10 vs Rocket Lawyer
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
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card p-6 border-neon-pink/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-neon-pink" />
                      Marriage License
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>State</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                          <SelectContent>
                            {["California", "Texas", "Florida", "New York", "Illinois"].map(s => (
                              <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>County</Label>
                        <Input placeholder="Enter your county" />
                      </div>
                      <Button variant="neon" className="w-full">
                        Get Requirements <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>

                  <Card className="glass-card p-6 border-neon-pink/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-neon-pink" />
                      Name Change
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Legal Name</Label>
                        <Input placeholder="Your current name" />
                      </div>
                      <div>
                        <Label>New Name After Marriage</Label>
                        <Input placeholder="Your new name" />
                      </div>
                      <Button variant="neon-outline" className="w-full">
                        Generate Name Change Forms
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Prenup Tab */}
              <TabsContent value="prenup">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card p-6 border-neon-blue/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-neon-blue" />
                      Create Prenuptial Agreement
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Party 1 Full Name</Label>
                        <Input placeholder="First party's legal name" />
                      </div>
                      <div>
                        <Label>Party 2 Full Name</Label>
                        <Input placeholder="Second party's legal name" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {["California", "Texas", "Florida", "New York", "Illinois", "Arizona", "Nevada", "Washington", "Colorado", "Georgia"].map(s => (
                              <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Wedding Date</Label>
                        <Input type="date" />
                      </div>
                      <Button variant="neon" className="w-full" onClick={() => {
                        toast.success("Generating prenuptial agreement draft...");
                        setActiveTab("chat");
                        setChatInput("Help me create a prenuptial agreement. What information do you need?");
                      }}>
                        Generate Draft <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>

                  <Card className="glass-card p-6 border-neon-blue/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-neon-blue" />
                      Asset Protection
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Common items to protect in a prenuptial agreement:
                      </p>
                      <div className="space-y-2">
                        {[
                          { item: "Real Estate & Property", desc: "Homes, land, investment properties" },
                          { item: "Business Interests", desc: "Ownership stakes, partnerships, LLCs" },
                          { item: "Retirement Accounts", desc: "401(k), IRA, pension plans" },
                          { item: "Investments", desc: "Stocks, bonds, crypto, mutual funds" },
                          { item: "Inheritance Rights", desc: "Family assets, trusts, estates" },
                          { item: "Debt Protection", desc: "Separate pre-marital debts" },
                        ].map((asset, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-neon-blue mt-2" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{asset.item}</p>
                              <p className="text-xs text-muted-foreground">{asset.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="neon-outline" className="w-full" onClick={() => setActiveTab("chat")}>
                        Ask MaryAI About Asset Protection
                      </Button>
                    </div>
                  </Card>

                  <Card className="glass-card p-6 border-neon-cyan/30 md:col-span-2">
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
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-card p-6 border-neon-purple/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-neon-purple" />
                      Divorce Filing
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>State of Residence</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {["California", "Texas", "Florida", "New York", "Illinois"].map(s => (
                              <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Type of Divorce</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contested">Contested</SelectItem>
                            <SelectItem value="uncontested">Uncontested</SelectItem>
                            <SelectItem value="collaborative">Collaborative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="neon-purple" className="w-full">
                        Start Divorce Process
                      </Button>
                    </div>
                  </Card>

                  <Card className="glass-card p-6 border-neon-purple/30">
                    <h3 className="font-display font-semibold text-xl text-foreground mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5 text-neon-purple" />
                      Property Division
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Get guidance on dividing marital assets including real estate, retirement accounts, and debts.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-background/50 p-3 rounded-lg text-center">
                          <p className="text-muted-foreground">Community Property</p>
                          <p className="font-semibold text-foreground">9 States</p>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg text-center">
                          <p className="text-muted-foreground">Equitable Distribution</p>
                          <p className="font-semibold text-foreground">41 States</p>
                        </div>
                      </div>
                      <Button variant="neon-outline" className="w-full" onClick={() => setActiveTab("chat")}>
                        Ask MaryAI About Your State
                      </Button>
                    </div>
                  </Card>
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

            {/* Legal Disclaimer */}
            <div className="mt-8 text-center">
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