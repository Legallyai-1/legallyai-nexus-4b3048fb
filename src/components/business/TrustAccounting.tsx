import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, DollarSign, CheckCircle, AlertTriangle, RefreshCw,
  Download, Plus, FileText, Clock, ArrowUpRight, ArrowDownRight,
  Lock, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface TrustAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  lastReconciled: string;
  status: "reconciled" | "pending" | "discrepancy";
}

interface TrustTransaction {
  id: string;
  date: string;
  client: string;
  matter: string;
  type: "deposit" | "disbursement";
  amount: number;
  status: "cleared" | "pending" | "reconciled";
  reference: string;
}

const mockAccounts: TrustAccount[] = [
  { id: "1", name: "Client Trust Account (IOLTA)", accountNumber: "****4521", balance: 847250.00, lastReconciled: "2024-01-10", status: "reconciled" },
  { id: "2", name: "Real Estate Escrow", accountNumber: "****7832", balance: 325000.00, lastReconciled: "2024-01-08", status: "pending" },
  { id: "3", name: "Settlement Fund", accountNumber: "****9156", balance: 156780.00, lastReconciled: "2024-01-05", status: "discrepancy" },
];

const mockTransactions: TrustTransaction[] = [
  { id: "1", date: "2024-01-12", client: "ABC Corporation", matter: "Merger Agreement", type: "deposit", amount: 50000, status: "cleared", reference: "DEP-2024-001" },
  { id: "2", date: "2024-01-11", client: "James Williams", matter: "Divorce Settlement", type: "disbursement", amount: 15000, status: "reconciled", reference: "DIS-2024-042" },
  { id: "3", date: "2024-01-10", client: "TechCo Industries", matter: "Patent Filing", type: "deposit", amount: 25000, status: "pending", reference: "DEP-2024-002" },
  { id: "4", date: "2024-01-09", client: "Johnson Properties", matter: "Real Estate Close", type: "disbursement", amount: 75000, status: "cleared", reference: "DIS-2024-041" },
  { id: "5", date: "2024-01-08", client: "Smith Family Trust", matter: "Estate Planning", type: "deposit", amount: 10000, status: "reconciled", reference: "DEP-2024-003" },
];

export function TrustAccounting() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isReconciling, setIsReconciling] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const totalBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const reconciledAccounts = mockAccounts.filter(a => a.status === "reconciled").length;

  const runThreeWayReconciliation = async () => {
    setIsReconciling(true);
    
    // Simulate reconciliation process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsReconciling(false);
    toast.success("Three-way reconciliation completed successfully!");
  };

  const statusColors = {
    reconciled: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    discrepancy: "bg-red-500/20 text-red-400 border-red-500/30",
    cleared: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Trust Accounting
                  <Badge className="bg-green-500/20 text-green-400">IOLTA Compliant</Badge>
                </h2>
                <p className="text-muted-foreground">
                  Three-way reconciliation with real-time balance tracking
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trust Balance</p>
                  <p className="text-3xl font-bold text-green-400">
                    {showBalance ? `$${totalBalance.toLocaleString()}` : "••••••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{mockAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Trust Accounts</p>
              </div>
              <Lock className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-400">{reconciledAccounts}/{mockAccounts.length}</p>
                <p className="text-sm text-muted-foreground">Reconciled</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{mockTransactions.length}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-400">1</p>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {mockAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">Account: {account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-xl font-bold">
                        {showBalance ? `$${account.balance.toLocaleString()}` : "••••••"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Reconciled</p>
                      <p className="text-sm">{new Date(account.lastReconciled).toLocaleDateString()}</p>
                    </div>
                    <Badge className={statusColors[account.status]}>{account.status}</Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Client / Matter</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.client}</p>
                          <p className="text-sm text-muted-foreground">{tx.matter}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === "deposit" ? (
                            <ArrowDownRight className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-400" />
                          )}
                          {tx.type}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === "deposit" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[tx.status]}>{tx.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Three-Way Reconciliation
              </CardTitle>
              <CardDescription>
                Reconcile bank statements, client ledgers, and trust account records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Bank Statement</p>
                  <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">Matched</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Client Ledgers</p>
                  <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">Matched</Badge>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">Trust Records</p>
                  <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">Matched</Badge>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={runThreeWayReconciliation} 
                  disabled={isReconciling}
                  size="lg"
                  className="min-w-48"
                >
                  {isReconciling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reconciling...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Reconciliation
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-400">All Accounts Balanced</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Last reconciliation: January 10, 2024 at 3:45 PM
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Trust Account Summary", desc: "Monthly summary of all trust accounts", icon: FileText },
              { title: "Client Ledger Report", desc: "Individual client balance reports", icon: DollarSign },
              { title: "Transaction History", desc: "Detailed transaction logs", icon: Clock },
              { title: "Reconciliation Report", desc: "Three-way reconciliation details", icon: RefreshCw },
              { title: "IOLTA Compliance", desc: "Regulatory compliance report", icon: Shield },
              { title: "Audit Trail", desc: "Complete audit log export", icon: Lock },
            ].map((report, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.desc}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
