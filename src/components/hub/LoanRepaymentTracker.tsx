import { useState, useEffect } from "react";
import { 
  DollarSign, Calendar, CheckCircle2, Clock, AlertCircle, 
  CreditCard, TrendingUp, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoanPayment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: string;
  payment_method: string | null;
  late_fee: number;
}

interface Loan {
  id: string;
  amount: number;
  monthly_payment: number;
  total_repayment: number;
  term_months: number;
  status: string;
  created_at: string;
}

interface LoanRepaymentTrackerProps {
  loanId?: string;
}

export function LoanRepaymentTracker({ loanId }: LoanRepaymentTrackerProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLoansAndPayments();
  }, [loanId]);

  const fetchLoansAndPayments = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch loans
    let loansQuery = supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['approved', 'disbursed'])
      .order('created_at', { ascending: false });

    if (loanId) {
      loansQuery = loansQuery.eq('id', loanId);
    }

    const { data: loansData, error: loansError } = await loansQuery;

    if (!loansError && loansData) {
      setLoans(loansData);
      if (loansData.length > 0) {
        setSelectedLoan(loansData[0]);
      }
    }

    // Fetch payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (!paymentsError && paymentsData) {
      setPayments(paymentsData);
    }

    setIsLoading(false);
  };

  const makePayment = async (loanId: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create payment record
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    const { error } = await supabase.from('loan_payments').insert({
      loan_id: loanId,
      user_id: user.id,
      amount,
      due_date: nextDueDate.toISOString().split('T')[0],
      status: 'completed',
      payment_method: 'card'
    });

    if (error) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Send notification
      await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          title: "Payment Successful",
          message: `Your payment of $${amount.toFixed(2)} has been processed.`,
          type: 'success',
          hub: 'loan',
          referenceId: loanId,
          referenceType: 'loan'
        }
      });

      toast({
        title: "Payment successful",
        description: `Your payment of $${amount.toFixed(2)} has been processed.`
      });
      fetchLoansAndPayments();
    }
  };

  const calculateProgress = (loan: Loan) => {
    const loanPayments = payments.filter(p => p.loan_id === loan.id && p.status === 'completed');
    const totalPaid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
    return Math.min(100, (totalPaid / (loan.total_repayment || loan.amount)) * 100);
  };

  const getTotalPaid = (loan: Loan) => {
    const loanPayments = payments.filter(p => p.loan_id === loan.id && p.status === 'completed');
    return loanPayments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getNextPayment = (loan: Loan) => {
    const loanPayments = payments.filter(p => p.loan_id === loan.id && p.status === 'pending');
    if (loanPayments.length > 0) {
      return loanPayments[0];
    }
    return null;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'pending':
        return <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30"><Clock className="w-3 h-3 mr-1" /> Due</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Clock className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (loans.length === 0) {
    return (
      <Card className="glass-card p-6 text-center">
        <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">No active loans to track</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Selection */}
      {loans.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loans.map(loan => (
            <Button
              key={loan.id}
              variant={selectedLoan?.id === loan.id ? "neon-green" : "glass"}
              size="sm"
              onClick={() => setSelectedLoan(loan)}
            >
              ${loan.amount.toLocaleString()}
            </Button>
          ))}
        </div>
      )}

      {selectedLoan && (
        <>
          {/* Progress Card */}
          <Card className="glass-card p-6 border-neon-green/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" /> Repayment Progress
              </h3>
              <Badge className="bg-neon-green/20 text-neon-green">
                {calculateProgress(selectedLoan).toFixed(1)}% Complete
              </Badge>
            </div>

            <Progress value={calculateProgress(selectedLoan)} className="h-3 mb-4" />

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-background/30">
                <p className="text-xs text-muted-foreground">Total Loan</p>
                <p className="text-lg font-bold text-foreground">${selectedLoan.total_repayment?.toLocaleString() || selectedLoan.amount.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold text-neon-green">${getTotalPaid(selectedLoan).toLocaleString()}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/30">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-lg font-bold text-foreground">
                  ${((selectedLoan.total_repayment || selectedLoan.amount) - getTotalPaid(selectedLoan)).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Next Payment */}
          <Card className="glass-card p-6 border-neon-cyan/30">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neon-cyan" /> Next Payment
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-green/10 border border-neon-cyan/20">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${selectedLoan.monthly_payment?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="neon-green"
                onClick={() => makePayment(selectedLoan.id, selectedLoan.monthly_payment || 0)}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
              </Button>
            </div>
          </Card>

          {/* Payment History */}
          <Card className="glass-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-purple" /> Payment History
            </h3>

            {payments.filter(p => p.loan_id === selectedLoan.id).length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {payments
                  .filter(p => p.loan_id === selectedLoan.id)
                  .map(payment => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'completed' ? 'bg-neon-green/20' : 'bg-neon-orange/20'
                        }`}>
                          {payment.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-neon-green" />
                          ) : (
                            <Clock className="w-4 h-4 text-neon-orange" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">${payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.status === 'completed' ? payment.payment_date : `Due: ${payment.due_date}`}
                          </p>
                        </div>
                      </div>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
