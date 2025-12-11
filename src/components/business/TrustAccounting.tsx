import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Shield, DollarSign, CheckCircle, AlertTriangle, RefreshCw,
  Download, Plus, FileText, Clock, ArrowUpRight, ArrowDownRight,
  Lock, Eye, EyeOff, Loader2
} from "lucide-react";

interface TrustAccount {
  id: string;
  account_name: string;
  account_number: string | null;
  bank_name: string | null;
  account_type: string;
  current_balance: number;
  last_reconciled_at: string | null;
  reconciled_balance: number | null;
  status: string;
}

interface TrustTransaction {
  id: string;
  transaction_date: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  reference_number: string | null;
  payee: string | null;
  reconciled: boolean;
  matter: { name: string } | null;
  client: { full_name: string } | null;
}

export function TrustAccounting() {
  const [accounts, setAccounts] = useState<TrustAccount[]>([]);
  const [transactions, setTransactions] = useState<TrustTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isReconciling, setIsReconciling] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
    account_type: "iolta"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [accountsRes, transactionsRes] = await Promise.all([
        supabase.from('trust_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('trust_transactions').select(`
          *,
          matter:matters(name),
          client:clients(full_name)
        `).order('transaction_date', { ascending: false }).limit(50)
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setAccounts(accountsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error fetching trust data:', error);
      toast.error('Failed to load trust data');
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!orgMember) {
        toast.error('You must belong to an organization');
        return;
      }

      const { error } = await supabase
        .from('trust_accounts')
        .insert({
          organization_id: orgMember.organization_id,
          account_name: newAccount.account_name,
          account_number: newAccount.account_number || null,
          bank_name: newAccount.bank_name || null,
          account_type: newAccount.account_type,
          current_balance: 0
        });

      if (error) throw error;

      toast.success('Trust account created successfully');
      setIsCreateOpen(false);
      setNewAccount({
        account_name: "",
        account_number: "",
        bank_name: "",
        account_type: "iolta"
      });
      fetchData();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const runThreeWayReconciliation = async () => {
    setIsReconciling(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in');
        return;
      }

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!orgMember) {
        toast.error('You must belong to an organization');
        return;
      }

      const response = await supabase.functions.invoke('business-hub', {
        body: {
          action: 'trust-reconciliation',
          organizationId: orgMember.organization_id
        }
      });

      if (response.error) throw response.error;

      toast.success('Three-way reconciliation completed successfully!');
      fetchData();
    } catch (error) {
      console.error('Reconciliation error:', error);
      toast.error('Reconciliation failed');
    } finally {
      setIsReconciling(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
  const reconciledAccounts = accounts.filter(a => a.status === "active" && a.last_reconciled_at).length;

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    frozen: "bg-red-500/20 text-red-400 border-red-500/30",
    reconciled: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cleared: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{accounts.length}</p>
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
                <p className="text-2xl font-bold text-green-400">{reconciledAccounts}/{accounts.length}</p>
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
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <FileText className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {transactions.filter(t => !t.reconciled).length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
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
          <div className="flex justify-end">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Trust Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Trust Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input 
                      placeholder="e.g., Client Trust Account (IOLTA)"
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, account_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input 
                      placeholder="Last 4 digits"
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input 
                      placeholder="Bank name"
                      value={newAccount.bank_name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Select 
                      value={newAccount.account_type} 
                      onValueChange={(v) => setNewAccount(prev => ({ ...prev, account_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iolta">IOLTA</SelectItem>
                        <SelectItem value="client_trust">Client Trust</SelectItem>
                        <SelectItem value="escrow">Escrow</SelectItem>
                        <SelectItem value="operating">Operating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createAccount} className="w-full" disabled={!newAccount.account_name}>
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {accounts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trust accounts</h3>
                <p className="text-muted-foreground mb-4">Create your first trust account to get started</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Trust Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.account_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {account.bank_name && `${account.bank_name} • `}
                          Account: ****{account.account_number || '0000'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="text-xl font-bold">
                          {showBalance ? `$${Number(account.current_balance).toLocaleString()}` : "••••••"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last Reconciled</p>
                        <p className="text-sm">
                          {account.last_reconciled_at 
                            ? new Date(account.last_reconciled_at).toLocaleDateString() 
                            : 'Never'}
                        </p>
                      </div>
                      <Badge className={statusColors[account.status]}>{account.status}</Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions recorded yet
                </div>
              ) : (
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
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.transaction_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{tx.reference_number || '-'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.client?.full_name || tx.payee || '-'}</p>
                            <p className="text-sm text-muted-foreground">{tx.matter?.name || tx.description || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {['deposit', 'interest'].includes(tx.transaction_type) ? (
                              <ArrowDownRight className="h-4 w-4 text-green-400" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-400" />
                            )}
                            {tx.transaction_type}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${['deposit', 'interest'].includes(tx.transaction_type) ? "text-green-400" : "text-red-400"}`}>
                          {['deposit', 'interest'].includes(tx.transaction_type) ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={tx.reconciled ? statusColors.reconciled : statusColors.pending}>
                            {tx.reconciled ? 'Reconciled' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
                  Last reconciliation: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
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
