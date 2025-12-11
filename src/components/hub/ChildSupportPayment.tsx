import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  CreditCard, 
  Building, 
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  date: Date;
  type: "sent" | "received";
  status: "completed" | "pending" | "failed";
  method: string;
}

export function ChildSupportPayment() {
  const [balance, setBalance] = useState(1250.00);
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: "1", name: "Chase Checking ****4521", type: "checking", isDefault: true },
    { id: "2", name: "Bank of America ****8732", type: "checking", isDefault: false }
  ]);
  const [payments, setPayments] = useState<Payment[]>([
    { id: "1", amount: 500, date: new Date("2024-12-01"), type: "sent", status: "completed", method: "Bank Transfer" },
    { id: "2", amount: 500, date: new Date("2024-11-01"), type: "sent", status: "completed", method: "Bank Transfer" },
    { id: "3", amount: 500, date: new Date("2024-10-01"), type: "sent", status: "completed", method: "Bank Transfer" }
  ]);

  const handleSendPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      amount,
      date: new Date(),
      type: "sent",
      status: "pending",
      method: linkedAccounts.find(a => a.isDefault)?.name || "Bank Transfer"
    };

    setPayments(prev => [newPayment, ...prev]);
    setBalance(prev => prev - amount);
    setPaymentAmount("");
    toast.success(`Payment of $${amount.toFixed(2)} initiated`);

    // Simulate payment completion
    setTimeout(() => {
      setPayments(prev => 
        prev.map(p => p.id === newPayment.id ? { ...p, status: "completed" } : p)
      );
      toast.success("Payment completed successfully");
    }, 3000);
  };

  const paidThisYear = payments
    .filter(p => p.type === "sent" && p.status === "completed" && p.date.getFullYear() === new Date().getFullYear())
    .reduce((sum, p) => sum + p.amount, 0);

  const expectedAnnual = monthlyAmount * 12;
  const progressPercent = (paidThisYear / expectedAnnual) * 100;

  return (
    <Card className="glass-card border-neon-purple/30 p-4">
      <Tabs defaultValue="pay">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="pay">Make Payment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="pay" className="space-y-4">
          {/* Balance Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-neon-green/10 to-emerald-500/10 border border-neon-green/20">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-2xl font-display font-bold text-neon-green">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {balance > monthlyAmount && (
                <p className="text-xs text-neon-orange mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Payment due
                </p>
              )}
            </div>
            <div className="p-4 rounded-xl bg-background/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Monthly Amount</p>
              <p className="text-2xl font-display font-bold text-foreground">
                ${monthlyAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Due 1st of each month
              </p>
            </div>
          </div>

          {/* Year Progress */}
          <div className="p-4 rounded-xl bg-background/30 border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Year-to-Date Progress</p>
              <p className="text-sm font-medium text-foreground">
                ${paidThisYear.toLocaleString()} / ${expectedAnnual.toLocaleString()}
              </p>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercent.toFixed(0)}% of annual obligation paid
            </p>
          </div>

          {/* Make Payment */}
          <div className="space-y-3">
            <Label>Payment Amount</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={monthlyAmount.toString()}
                  className="pl-8 bg-background/30"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button variant="outline" onClick={() => setPaymentAmount(monthlyAmount.toString())}>
                Monthly
              </Button>
            </div>

            <div className="p-3 rounded-lg bg-background/30 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Paying from:</p>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-neon-purple" />
                <span className="text-sm font-medium text-foreground">
                  {linkedAccounts.find(a => a.isDefault)?.name || "No account linked"}
                </span>
              </div>
            </div>

            <Button 
              variant="neon-purple" 
              className="w-full" 
              size="lg"
              onClick={handleSendPayment}
              disabled={!paymentAmount}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Payment
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No payment history</p>
            </div>
          ) : (
            payments.map(payment => (
              <div
                key={payment.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  payment.type === "sent" 
                    ? "bg-neon-orange/20 text-neon-orange" 
                    : "bg-neon-green/20 text-neon-green"
                }`}>
                  {payment.type === "sent" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {payment.type === "sent" ? "-" : "+"}${payment.amount.toFixed(2)}
                    </p>
                    <Badge className={`text-xs ${
                      payment.status === "completed" 
                        ? "bg-neon-green/20 text-neon-green border-neon-green/30"
                        : payment.status === "pending"
                          ? "bg-neon-orange/20 text-neon-orange border-neon-orange/30"
                          : "bg-destructive/20 text-destructive border-destructive/30"
                    }`}>
                      {payment.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {payment.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {payment.date.toLocaleDateString()} • {payment.method}
                  </p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-3">
          {linkedAccounts.map(account => (
            <div
              key={account.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                account.isDefault 
                  ? "bg-neon-purple/10 border border-neon-purple/30" 
                  : "bg-background/30 hover:bg-background/50"
              }`}
            >
              <Building className={`w-5 h-5 ${account.isDefault ? "text-neon-purple" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <p className="font-medium text-foreground">{account.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{account.type}</p>
              </div>
              {account.isDefault ? (
                <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">Default</Badge>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setLinkedAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === account.id })));
                    toast.success("Default account updated");
                  }}
                >
                  Set Default
                </Button>
              )}
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Link New Bank Account
          </Button>
          
          <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
            <p className="text-xs text-muted-foreground">
              🔒 Bank connections are secured with 256-bit encryption. We use Plaid for secure bank linking.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
