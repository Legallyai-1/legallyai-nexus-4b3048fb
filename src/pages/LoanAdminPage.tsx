import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, Users, TrendingUp, CheckCircle2, Clock, AlertCircle,
  CreditCard, Building, ArrowUpRight, ArrowDownRight, Percent, 
  BadgeCheck, FileText, Download, Eye, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoanApplication {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  status: string;
  interest_rate: number;
  term_months: number;
  monthly_payment: number | null;
  total_repayment: number | null;
  platform_fee: number | null;
  verification_data: any;
  document_urls: string[];
  created_at: string;
}

interface PlatformStats {
  totalPlatformFees: number;
  totalTransactionVolume: number;
  transactionCount: number;
  feePercentage: number;
}

export default function LoanAdminPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'owner']);

    if (!roleData || roleData.length === 0) {
      toast({
        title: "Access Denied",
        description: "Admin access required to view this page.",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    fetchLoans();
    fetchStats();
  };

  const fetchLoans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLoans(data as LoanApplication[]);
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('process-platform-fee', {
      body: { action: 'get_stats' },
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (!error && data) {
      setStats(data);
    }
  };

  const updateLoanStatus = async (loanId: string, newStatus: string) => {
    setProcessingId(loanId);
    
    const { error } = await supabase
      .from('loans')
      .update({ 
        status: newStatus,
        ...(newStatus === 'approved' ? { approved_at: new Date().toISOString() } : {}),
        ...(newStatus === 'disbursed' ? { disbursed_at: new Date().toISOString() } : {})
      })
      .eq('id', loanId);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // If disbursing, process the platform fee
      if (newStatus === 'disbursed') {
        const loan = loans.find(l => l.id === loanId);
        if (loan) {
          await processPlatformFee(loanId, loan.amount);
        }
      }
      
      toast({
        title: "Status Updated",
        description: `Loan status changed to ${newStatus}`
      });
      fetchLoans();
      fetchStats();
    }
    setProcessingId(null);
  };

  const processPlatformFee = async (loanId: string, amount: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('process-platform-fee', {
      body: { 
        action: 'process_fee',
        loanId,
        amount,
        transactionType: 'loan_disbursement'
      },
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (!error && data?.success) {
      toast({
        title: "Platform Fee Recorded",
        description: data.message
      });
    }
  };

  const withdrawFees = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.functions.invoke('process-platform-fee', {
      body: { action: 'withdraw_fees' },
      headers: { Authorization: `Bearer ${session.access_token}` }
    });

    if (error) {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive"
      });
    } else if (data?.success) {
      toast({
        title: "Withdrawal Initiated",
        description: data.message
      });
    } else {
      toast({
        title: "Setup Required",
        description: data?.message || "Connect a bank account in Stripe Dashboard",
        variant: "default"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'disbursed':
        return <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"><DollarSign className="w-3 h-3 mr-1" /> Disbursed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const disbursedLoans = loans.filter(l => l.status === 'disbursed');

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">Loan Admin</span> Dashboard
                </h1>
                <p className="text-muted-foreground">Manage loan applications and platform revenue</p>
              </div>
              <Button variant="neon-green" onClick={withdrawFees}>
                <Download className="w-4 h-4 mr-2" /> Withdraw Fees
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card p-4 border-neon-green/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-green/20">
                    <DollarSign className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Platform Fees (1%)</p>
                    <p className="text-xl font-bold text-neon-green">
                      ${stats?.totalPlatformFees?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4 border-neon-cyan/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-cyan/20">
                    <TrendingUp className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Volume</p>
                    <p className="text-xl font-bold text-neon-cyan">
                      ${stats?.totalTransactionVolume?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4 border-neon-purple/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-purple/20">
                    <FileText className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Applications</p>
                    <p className="text-xl font-bold text-neon-purple">{loans.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-4 border-neon-orange/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-orange/20">
                    <Clock className="w-5 h-5 text-neon-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                    <p className="text-xl font-bold text-neon-orange">{pendingLoans.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Loan Management Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 glass-card">
                <TabsTrigger value="pending" className="data-[state=active]:bg-neon-orange/20">
                  <Clock className="w-4 h-4 mr-2" /> Pending ({pendingLoans.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="data-[state=active]:bg-neon-green/20">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approved ({approvedLoans.length})
                </TabsTrigger>
                <TabsTrigger value="disbursed" className="data-[state=active]:bg-neon-cyan/20">
                  <DollarSign className="w-4 h-4 mr-2" /> Disbursed ({disbursedLoans.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-neon-purple/20">
                  <FileText className="w-4 h-4 mr-2" /> All ({loans.length})
                </TabsTrigger>
              </TabsList>

              {['pending', 'approved', 'disbursed', 'all'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-4">
                    {(tab === 'all' ? loans : loans.filter(l => l.status === tab)).map(loan => (
                      <Card key={loan.id} className="glass-card p-4 border-border/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(loan.status)}
                              <span className="text-sm text-muted-foreground">
                                {new Date(loan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                              ${loan.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {loan.purpose}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{loan.interest_rate}% APR</span>
                              <span>{loan.term_months} months</span>
                              <span>${loan.monthly_payment?.toFixed(2)}/mo</span>
                              {loan.platform_fee && (
                                <span className="text-neon-green">
                                  Fee: ${loan.platform_fee.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {loan.status === 'pending' && (
                              <>
                                <Button
                                  variant="neon-green"
                                  size="sm"
                                  onClick={() => updateLoanStatus(loan.id, 'approved')}
                                  disabled={processingId === loan.id}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => updateLoanStatus(loan.id, 'rejected')}
                                  disabled={processingId === loan.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {loan.status === 'approved' && (
                              <Button
                                variant="neon"
                                size="sm"
                                onClick={() => updateLoanStatus(loan.id, 'disbursed')}
                                disabled={processingId === loan.id}
                              >
                                <DollarSign className="w-4 h-4 mr-1" /> Disburse
                              </Button>
                            )}
                            <Button variant="glass" size="sm">
                              <Eye className="w-4 h-4 mr-1" /> Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {(tab === 'all' ? loans : loans.filter(l => l.status === tab)).length === 0 && (
                      <Card className="glass-card p-8 text-center">
                        <p className="text-muted-foreground">No {tab === 'all' ? '' : tab} loans found</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Revenue Info */}
            <Card className="glass-card p-6 mt-8 border-neon-green/30">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-neon-green" /> Platform Revenue Model
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-neon-green/10 border border-neon-green/20">
                  <p className="font-medium text-neon-green">1% Platform Fee</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically collected on every loan disbursement
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                  <p className="font-medium text-neon-cyan">Stripe Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Fees are routed directly to your Stripe account
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
                  <p className="font-medium text-neon-purple">Transparent Pricing</p>
                  <p className="text-sm text-muted-foreground">
                    Users see the 1% fee in their loan calculator
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
