import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  CreditCard,
  Building,
  Shield,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanApplication {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  interest_rate: number;
  term_months: number;
  monthly_payment: number | null;
  total_repayment: number | null;
  created_at: string;
}

export default function LoansPage() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("apply");
  const { toast } = useToast();
  const navigate = useNavigate();

  const interestRate = 5.99; // Annual percentage rate

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      fetchLoans(user.id);
    }
  };

  const fetchLoans = async (userId: string) => {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLoans(data as LoanApplication[]);
    }
  };

  const calculatePayment = () => {
    const principal = parseFloat(amount);
    const monthlyRate = interestRate / 100 / 12;
    const months = parseInt(termMonths);
    
    if (isNaN(principal) || principal <= 0) return { monthly: 0, total: 0 };
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    const totalRepayment = monthlyPayment * months;
    
    return {
      monthly: Math.round(monthlyPayment * 100) / 100,
      total: Math.round(totalRepayment * 100) / 100
    };
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply for a loan.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    if (!amount || parseFloat(amount) < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum loan amount is $100.",
        variant: "destructive"
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: "Purpose required",
        description: "Please describe the purpose of your loan.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const { monthly, total } = calculatePayment();

    const { error } = await supabase.from('loans').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      purpose: purpose.trim(),
      interest_rate: interestRate,
      term_months: parseInt(termMonths),
      monthly_payment: monthly,
      total_repayment: total,
      status: 'pending'
    });

    if (error) {
      toast({
        title: "Application failed",
        description: "Unable to submit loan application. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Application submitted",
        description: "Your loan application is under review. We'll notify you within 24 hours."
      });
      setAmount("");
      setPurpose("");
      fetchLoans(user.id);
      setActiveTab("history");
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'disbursed':
        return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"><DollarSign className="w-3 h-3 mr-1" /> Disbursed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const { monthly, total } = calculatePayment();

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="green" size="lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">LoanAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Legal Service Financing - Any Credit Accepted
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Shield, label: "Any Credit", desc: "No minimum score" },
                { icon: Clock, label: "Fast Approval", desc: "Within 24 hours" },
                { icon: TrendingUp, label: "Low Rates", desc: `From ${interestRate}% APR` },
                { icon: Building, label: "Flexible Terms", desc: "6-60 months" }
              ].map((feature, idx) => (
                <Card key={idx} className="glass-card p-4 text-center border-neon-green/20">
                  <feature.icon className="w-6 h-6 mx-auto mb-2 text-neon-green" />
                  <p className="font-medium text-foreground text-sm">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </Card>
              ))}
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 glass-card">
                <TabsTrigger value="apply" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green">
                  <FileText className="w-4 h-4 mr-2" /> Apply Now
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">
                  <CreditCard className="w-4 h-4 mr-2" /> My Loans
                </TabsTrigger>
              </TabsList>

              {/* Apply Tab */}
              <TabsContent value="apply">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Application Form */}
                  <Card className="glass-card p-6 border-neon-green/30">
                    <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-neon-green" /> Loan Application
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Loan Amount ($)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount (min $100)"
                          className="bg-background/30 border-neon-green/30"
                          min="100"
                          step="100"
                        />
                      </div>

                      <div>
                        <Label htmlFor="term">Loan Term</Label>
                        <select
                          id="term"
                          value={termMonths}
                          onChange={(e) => setTermMonths(e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background/30 border border-neon-green/30 text-foreground"
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                          <option value="48">48 months</option>
                          <option value="60">60 months</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="purpose">Purpose</Label>
                        <Textarea
                          id="purpose"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="Describe the legal service you need funding for..."
                          className="bg-background/30 border-neon-green/30 min-h-[100px]"
                        />
                      </div>

                      <Button
                        variant="neon-green"
                        size="lg"
                        className="w-full"
                        onClick={handleApply}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </Card>

                  {/* Calculator */}
                  <Card className="glass-card p-6 border-neon-cyan/30">
                    <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-neon-cyan" /> Payment Calculator
                    </h3>

                    <div className="space-y-6">
                      <div className="text-center p-6 rounded-xl bg-gradient-to-br from-neon-green/10 to-emerald-500/10 border border-neon-green/20">
                        <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                        <p className="text-4xl font-display font-bold text-neon-green">
                          ${monthly.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-background/30 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Repayment</p>
                          <p className="text-lg font-semibold text-foreground">
                            ${total.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/30 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                          <p className="text-lg font-semibold text-foreground">
                            {interestRate}% APR
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neon-orange/10 border border-neon-orange/20">
                        <p className="text-sm text-neon-orange font-medium mb-1">💡 Credit-Friendly</p>
                        <p className="text-xs text-muted-foreground">
                          We accept all credit scores. Your application is reviewed holistically, 
                          considering your legal needs and repayment capacity.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-neon-purple" /> Loan History
                  </h3>
                  
                  {!user ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-4">Sign in to view your loans</p>
                      <Button onClick={() => navigate("/login")}>Sign In</Button>
                    </div>
                  ) : loans.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground mb-4">No loan applications yet</p>
                      <Button variant="neon-green" onClick={() => setActiveTab("apply")}>
                        Apply for a Loan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loans.map((loan) => (
                        <div
                          key={loan.id}
                          className="p-4 rounded-xl bg-background/30 border border-border/50 hover:border-neon-green/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-foreground">
                                ${loan.amount.toLocaleString()} Loan
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(loan.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(loan.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {loan.purpose}
                          </p>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-muted-foreground">Monthly</p>
                              <p className="font-medium text-foreground">
                                ${loan.monthly_payment?.toLocaleString() || "—"}
                              </p>
                            </div>
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-muted-foreground">Term</p>
                              <p className="font-medium text-foreground">
                                {loan.term_months} months
                              </p>
                            </div>
                            <div className="p-2 rounded bg-background/50">
                              <p className="text-muted-foreground">APR</p>
                              <p className="font-medium text-foreground">
                                {loan.interest_rate}%
                              </p>
                            </div>
                          </div>

                          {loan.status === 'approved' && (
                            <div className="mt-3">
                              <Progress value={0} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                0% repaid
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            {/* Back Button */}
            <div className="text-center mt-8">
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