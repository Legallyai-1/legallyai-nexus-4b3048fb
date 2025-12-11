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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DollarSign, Calculator, FileText, CheckCircle2, Clock, AlertCircle,
  CreditCard, Building, Shield, TrendingUp, User, Phone, Home, Briefcase,
  Upload, Percent, BadgeCheck, AlertTriangle
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

// Platform takes 1% of each loan disbursed
const PLATFORM_FEE_PERCENT = 1;

export default function LoansPage() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [termMonths, setTermMonths] = useState("12");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("apply");
  const [verificationStep, setVerificationStep] = useState(0);
  
  // Verification fields
  const [fullName, setFullName] = useState("");
  const [ssn, setSsn] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [employment, setEmployment] = useState("");
  const [income, setIncome] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [identityUploaded, setIdentityUploaded] = useState(false);
  const [incomeUploaded, setIncomeUploaded] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [documentUrls, setDocumentUrls] = useState<{identity?: string, income?: string}>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const interestRate = 5.99;

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
    
    if (isNaN(principal) || principal <= 0) return { monthly: 0, total: 0, platformFee: 0 };
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    const totalRepayment = monthlyPayment * months;
    const platformFee = principal * (PLATFORM_FEE_PERCENT / 100);
    
    return {
      monthly: Math.round(monthlyPayment * 100) / 100,
      total: Math.round(totalRepayment * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100
    };
  };

  const isVerificationComplete = () => {
    return fullName && ssn.length >= 9 && phone.length >= 10 && address && 
           employment && income && consentChecked && identityUploaded && incomeUploaded;
  };

  const handleFileUpload = async (file: File, docType: 'identity' | 'income') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload documents.",
        variant: "destructive"
      });
      return;
    }

    setUploadingDoc(docType);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${docType}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('loan-documents')
      .upload(fileName, file);

    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      const { data: urlData } = supabase.storage
        .from('loan-documents')
        .getPublicUrl(fileName);
      
      setDocumentUrls(prev => ({ ...prev, [docType]: urlData.publicUrl }));
      
      if (docType === 'identity') {
        setIdentityUploaded(true);
      } else {
        setIncomeUploaded(true);
      }
      
      toast({
        title: "Document uploaded",
        description: `${docType === 'identity' ? 'ID' : 'Income proof'} uploaded successfully`
      });
    }
    
    setUploadingDoc(null);
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

    if (!isVerificationComplete()) {
      toast({
        title: "Verification incomplete",
        description: "Please complete all verification steps before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) < 500) {
      toast({
        title: "Invalid amount",
        description: "Minimum loan amount is $500.",
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
    const { monthly, total, platformFee } = calculatePayment();

    const { error } = await supabase.from('loans').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      purpose: purpose.trim(),
      interest_rate: interestRate,
      term_months: parseInt(termMonths),
      monthly_payment: monthly,
      total_repayment: total,
      platform_fee: platformFee,
      verification_data: { fullName, phone, address, employment, income },
      document_urls: Object.values(documentUrls).filter(Boolean),
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
        title: "Application submitted!",
        description: `Your loan application is under review. Platform fee: $${platformFee.toFixed(2)} (${PLATFORM_FEE_PERCENT}%)`
      });
      setAmount("");
      setPurpose("");
      setVerificationStep(0);
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
        return <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'disbursed':
        return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"><DollarSign className="w-3 h-3 mr-1" /> Disbursed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const { monthly, total, platformFee } = calculatePayment();

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AnimatedAIHead variant="green" size="lg" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">LoanAI</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real Legal Service Financing - Verified & Secure
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BadgeCheck, label: "Verified Lenders", desc: "Bank-level security" },
                { icon: Shield, label: "Identity Protected", desc: "Encrypted data" },
                { icon: Clock, label: "24hr Decisions", desc: "Fast approval" },
                { icon: Percent, label: `${PLATFORM_FEE_PERCENT}% Platform Fee`, desc: "Transparent pricing" }
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
              <TabsList className="grid grid-cols-3 mb-8 glass-card">
                <TabsTrigger value="apply" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green">
                  <FileText className="w-4 h-4 mr-2" /> Apply Now
                </TabsTrigger>
                <TabsTrigger value="verify" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                  <BadgeCheck className="w-4 h-4 mr-2" /> Verify Identity
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
                          placeholder="Enter amount (min $500)"
                          className="bg-background/30 border-neon-green/30"
                          min="500"
                          step="100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Minimum: $500 | Maximum: $50,000</p>
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
                        <Label htmlFor="purpose">Legal Service Purpose</Label>
                        <Textarea
                          id="purpose"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="Describe the legal service you need funding for (e.g., attorney fees, court costs, settlements)..."
                          className="bg-background/30 border-neon-green/30 min-h-[100px]"
                        />
                      </div>

                      {!isVerificationComplete() && (
                        <div className="p-3 rounded-lg bg-neon-orange/10 border border-neon-orange/30">
                          <p className="text-sm text-neon-orange flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Complete identity verification before submitting
                          </p>
                        </div>
                      )}

                      <Button
                        variant="neon-green"
                        size="lg"
                        className="w-full"
                        onClick={handleApply}
                        disabled={isSubmitting || !isVerificationComplete()}
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

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-background/30 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Total Repayment</p>
                          <p className="text-lg font-semibold text-foreground">
                            ${total.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-background/30 border border-border/50 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                          <p className="text-lg font-semibold text-foreground">
                            {interestRate}% APR
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Platform Fee</p>
                          <p className="text-lg font-semibold text-neon-green">
                            ${platformFee.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                        <p className="text-sm text-neon-cyan font-medium mb-1">💡 How It Works</p>
                        <p className="text-xs text-muted-foreground">
                          We partner with verified lending institutions. A {PLATFORM_FEE_PERCENT}% platform fee 
                          is deducted from approved loans. Your identity is verified to ensure real 
                          people get real loans.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Verification Tab */}
              <TabsContent value="verify">
                <Card className="glass-card p-6">
                  <h3 className="font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-neon-cyan" /> Identity Verification
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    To ensure real people get real loans, we require identity verification. Your information is encrypted and secure.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <User className="w-4 h-4" /> Personal Information
                      </h4>
                      
                      <div>
                        <Label>Full Legal Name</Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="As shown on your ID"
                          className="bg-background/30"
                        />
                      </div>

                      <div>
                        <Label>Social Security Number</Label>
                        <Input
                          type="password"
                          value={ssn}
                          onChange={(e) => setSsn(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          placeholder="XXX-XX-XXXX"
                          className="bg-background/30"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Required for credit check</p>
                      </div>

                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          className="bg-background/30"
                        />
                      </div>

                      <div>
                        <Label>Home Address</Label>
                        <Textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Full street address, city, state, zip"
                          className="bg-background/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Financial Information
                      </h4>

                      <div>
                        <Label>Employment Status</Label>
                        <select
                          value={employment}
                          onChange={(e) => setEmployment(e.target.value)}
                          className="w-full h-10 px-3 rounded-md bg-background/30 border border-border/50 text-foreground"
                        >
                          <option value="">Select status</option>
                          <option value="employed">Employed Full-Time</option>
                          <option value="part-time">Employed Part-Time</option>
                          <option value="self-employed">Self-Employed</option>
                          <option value="retired">Retired</option>
                          <option value="unemployed">Unemployed</option>
                        </select>
                      </div>

                      <div>
                        <Label>Annual Income</Label>
                        <Input
                          type="number"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          placeholder="$0"
                          className="bg-background/30"
                        />
                      </div>

                      <h4 className="font-medium text-foreground flex items-center gap-2 mt-6">
                        <Upload className="w-4 h-4" /> Document Upload
                      </h4>

                      <div className="space-y-3">
                        <label 
                          className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all block ${
                            identityUploaded ? 'border-neon-green bg-neon-green/10' : 'border-border/50 hover:border-neon-cyan/50'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'identity');
                            }}
                            disabled={uploadingDoc === 'identity'}
                          />
                          <div className="flex items-center gap-3">
                            {uploadingDoc === 'identity' ? (
                              <Clock className="w-5 h-5 text-neon-cyan animate-spin" />
                            ) : identityUploaded ? (
                              <CheckCircle2 className="w-5 h-5 text-neon-green" />
                            ) : (
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">Government ID</p>
                              <p className="text-xs text-muted-foreground">
                                {uploadingDoc === 'identity' ? 'Uploading...' : 'Driver\'s license or passport'}
                              </p>
                            </div>
                          </div>
                        </label>

                        <label 
                          className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all block ${
                            incomeUploaded ? 'border-neon-green bg-neon-green/10' : 'border-border/50 hover:border-neon-cyan/50'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'income');
                            }}
                            disabled={uploadingDoc === 'income'}
                          />
                          <div className="flex items-center gap-3">
                            {uploadingDoc === 'income' ? (
                              <Clock className="w-5 h-5 text-neon-cyan animate-spin" />
                            ) : incomeUploaded ? (
                              <CheckCircle2 className="w-5 h-5 text-neon-green" />
                            ) : (
                              <Upload className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">Proof of Income</p>
                              <p className="text-xs text-muted-foreground">
                                {uploadingDoc === 'income' ? 'Uploading...' : 'Pay stub or tax return'}
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-start gap-3 pt-4">
                        <Checkbox 
                          id="consent"
                          checked={consentChecked}
                          onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                        />
                        <label htmlFor="consent" className="text-sm text-muted-foreground">
                          I authorize LegallyAI to verify my identity and perform a credit check. 
                          I understand a {PLATFORM_FEE_PERCENT}% platform fee will be deducted from approved loans.
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-background/30">
                    <p className="text-sm font-medium text-foreground mb-2">Verification Progress</p>
                    <Progress value={
                      ((fullName ? 1 : 0) + (ssn.length >= 9 ? 1 : 0) + (phone.length >= 10 ? 1 : 0) + 
                       (address ? 1 : 0) + (employment ? 1 : 0) + (income ? 1 : 0) + 
                       (identityUploaded ? 1 : 0) + (incomeUploaded ? 1 : 0) + (consentChecked ? 1 : 0)) / 9 * 100
                    } className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {isVerificationComplete() ? "✓ Verification complete - ready to apply" : "Complete all fields to proceed"}
                    </p>
                  </div>
                </Card>
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

                          <div className="grid grid-cols-4 gap-2 text-xs">
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
                            <div className="p-2 rounded bg-neon-green/10">
                              <p className="text-muted-foreground">Platform Fee</p>
                              <p className="font-medium text-neon-green">
                                ${(loan.amount * PLATFORM_FEE_PERCENT / 100).toFixed(2)}
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
