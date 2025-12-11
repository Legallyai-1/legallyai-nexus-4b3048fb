import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DollarSign, Clock, FileText, Send, Download, Search,
  Plus, Sparkles, CheckCircle, AlertCircle, RefreshCw,
  CreditCard, TrendingUp, Calendar, Zap, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface TimeEntry {
  id: string;
  date: string;
  attorney: string;
  matter: string;
  description: string;
  hours: number;
  rate: number;
  status: "unbilled" | "billed" | "written_off";
  selected?: boolean;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
}

const mockTimeEntries: TimeEntry[] = [
  { id: "1", date: "2024-01-12", attorney: "Sarah Johnson", matter: "ABC Corp Merger", description: "Document review and analysis", hours: 3.5, rate: 350, status: "unbilled" },
  { id: "2", date: "2024-01-12", attorney: "Michael Chen", matter: "ABC Corp Merger", description: "Client call regarding due diligence", hours: 1.0, rate: 275, status: "unbilled" },
  { id: "3", date: "2024-01-11", attorney: "Sarah Johnson", matter: "TechCo Patent", description: "Prior art research", hours: 4.0, rate: 350, status: "unbilled" },
  { id: "4", date: "2024-01-11", attorney: "Emily Davis", matter: "Williams Divorce", description: "Draft settlement proposal", hours: 2.5, rate: 225, status: "unbilled" },
  { id: "5", date: "2024-01-10", attorney: "James Wilson", matter: "Real Estate 500 Main", description: "Contract negotiation", hours: 2.0, rate: 400, status: "unbilled" },
];

const mockInvoices: Invoice[] = [
  { id: "1", number: "INV-2024-001", client: "ABC Corporation", amount: 15750, status: "sent", dueDate: "2024-02-12", createdAt: "2024-01-12" },
  { id: "2", number: "INV-2024-002", client: "TechCo Industries", amount: 8400, status: "paid", dueDate: "2024-01-25", createdAt: "2024-01-10" },
  { id: "3", number: "INV-2024-003", client: "Williams Family", amount: 4500, status: "overdue", dueDate: "2024-01-05", createdAt: "2023-12-20" },
  { id: "4", number: "INV-2024-004", client: "Johnson Properties", amount: 12000, status: "draft", dueDate: "2024-02-15", createdAt: "2024-01-11" },
];

const billingStats = [
  { label: "Unbilled Time", value: "$47,250", icon: Clock, color: "text-yellow-400" },
  { label: "Outstanding", value: "$32,150", icon: AlertCircle, color: "text-orange-400" },
  { label: "Collected MTD", value: "$89,500", icon: DollarSign, color: "text-green-400" },
  { label: "Realization Rate", value: "92%", icon: TrendingUp, color: "text-primary" },
];

export function BillingAutomation() {
  const [activeTab, setActiveTab] = useState("time");
  const [timeEntries, setTimeEntries] = useState(mockTimeEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedEntries = timeEntries.filter(e => e.selected);
  const selectedTotal = selectedEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);

  const toggleEntry = (id: string) => {
    setTimeEntries(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const selectAll = () => {
    const allSelected = timeEntries.every(e => e.selected);
    setTimeEntries(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const generateInvoices = async () => {
    if (selectedEntries.length === 0) {
      toast.error("Please select time entries to invoice");
      return;
    }
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    toast.success(`Generated invoice for ${selectedEntries.length} entries totaling $${selectedTotal.toLocaleString()}`);
    setTimeEntries(prev => prev.map(e => 
      e.selected ? { ...e, selected: false, status: "billed" } : e
    ));
  };

  const statusColors = {
    unbilled: "bg-yellow-500/20 text-yellow-400",
    billed: "bg-green-500/20 text-green-400",
    written_off: "bg-gray-500/20 text-gray-400",
    draft: "bg-gray-500/20 text-gray-400",
    sent: "bg-blue-500/20 text-blue-400",
    paid: "bg-green-500/20 text-green-400",
    overdue: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Zap className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Billing Automation
                <Badge className="bg-green-500/20 text-green-400">Smart Invoicing</Badge>
              </h2>
              <p className="text-muted-foreground">
                AI-powered time capture, automatic invoice generation, and payment tracking
              </p>
            </div>
            <Button variant="gold" onClick={generateInvoices} disabled={selectedEntries.length === 0 || isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Invoices
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {billingStats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}/10`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="time" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Unbilled Time Entries</CardTitle>
                  <CardDescription>Select entries to generate invoices</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {selectedEntries.length > 0 && (
                    <Badge className="bg-primary/20 text-primary">
                      {selectedEntries.length} selected • ${selectedTotal.toLocaleString()}
                    </Badge>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search..." 
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={timeEntries.every(e => e.selected)}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attorney</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.filter(e => e.status === "unbilled").map((entry) => (
                    <TableRow key={entry.id} className={entry.selected ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={entry.selected}
                          onCheckedChange={() => toggleEntry(entry.id)}
                        />
                      </TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.attorney}</TableCell>
                      <TableCell className="font-medium">{entry.matter}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell className="text-right">{entry.hours}</TableCell>
                      <TableCell className="text-right">${entry.rate}</TableCell>
                      <TableCell className="text-right font-medium">${(entry.hours * entry.rate).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[entry.status]}>{entry.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">{invoice.number}</TableCell>
                      <TableCell className="font-medium">{invoice.client}</TableCell>
                      <TableCell className="text-right">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "draft" && (
                            <Button variant="ghost" size="icon">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing
              </CardTitle>
              <CardDescription>Accept payments via multiple methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { method: "Credit Card", provider: "Stripe", status: "active", icon: CreditCard },
                  { method: "ACH Transfer", provider: "Plaid", status: "active", icon: DollarSign },
                  { method: "Check", provider: "Manual", status: "active", icon: FileText },
                ].map((payment, i) => (
                  <Card key={i} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <payment.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{payment.method}</h4>
                          <p className="text-xs text-muted-foreground">{payment.provider}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">{payment.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-semibold mb-4">Recent Payments</h4>
                <div className="space-y-3">
                  {[
                    { client: "TechCo Industries", amount: 8400, method: "Credit Card", date: "2024-01-12" },
                    { client: "Johnson Properties", amount: 5000, method: "ACH", date: "2024-01-10" },
                    { client: "ABC Corporation", amount: 15000, method: "Check", date: "2024-01-08" },
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-muted-foreground">{payment.method} • {payment.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-400">${payment.amount.toLocaleString()}</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Billing Automation Rules
              </CardTitle>
              <CardDescription>Configure automatic billing workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Auto-generate monthly invoices", desc: "Generate invoices on the 1st of each month", enabled: true },
                { name: "Payment reminders", desc: "Send reminders 7 days before due date", enabled: true },
                { name: "Late payment notices", desc: "Notify clients of overdue invoices", enabled: true },
                { name: "Time entry reminders", desc: "Remind attorneys to log time daily", enabled: false },
                { name: "Pre-billing review", desc: "Route invoices for partner approval", enabled: true },
                { name: "Expense auto-capture", desc: "Automatically capture expenses from receipts", enabled: false },
              ].map((rule, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.desc}</p>
                  </div>
                  <Badge className={rule.enabled ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                    {rule.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
