import { useCallback, useEffect, useState } from "react";
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
  Plus, Sparkles, AlertCircle, RefreshCw,
  CreditCard, TrendingUp, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserOrganization } from "@/lib/organizations";
import { errorMessage } from "@/lib/mutationResult";
import { canReadOrgInvoices } from "@/lib/invoiceAccess";

interface TimeEntry {
  id: string;
  date: string;
  attorney: string;
  matter: string;
  description: string;
  hours: number;
  rate: number;
  // "unverified": the user can't read the org's invoices, so we can't tell if it was billed (LEG-25).
  status: "unbilled" | "billed" | "written_off" | "unverified";
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

const billingStats = [
  { label: "Unbilled Time", value: "—", icon: Clock, color: "text-yellow-400" },
  { label: "Outstanding", value: "—", icon: AlertCircle, color: "text-orange-400" },
  { label: "Collected MTD", value: "—", icon: DollarSign, color: "text-green-400" },
  { label: "Realization Rate", value: "—", icon: TrendingUp, color: "text-primary" },
];
const invoices: Invoice[] = [];

export function BillingAutomation() {
  const [activeTab, setActiveTab] = useState("time");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Only roles that can read every org invoice may invoice (see src/lib/invoiceAccess.ts).
  const [canInvoice, setCanInvoice] = useState(false);

  const loadTimeEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTimeEntries([]);
        setCanInvoice(false);
        return;
      }
      const organizationId = await ensureUserOrganization(user.id);

      // Fail closed: if the role lookup fails, treat the user as unable to read invoices.
      const { data: roleRows, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, organization_id")
        .eq("user_id", user.id);
      const mayInvoice = !rolesError && canReadOrgInvoices(roleRows, organizationId);
      setCanInvoice(mayInvoice);

      // RLS limits rows to the user's own entries (plus org entries for privileged roles).
      const { data: rows, error } = await supabase
        .from("time_entries")
        .select("id, user_id, clock_in, clock_out, description, hourly_rate, billable, cases(title)")
        .eq("organization_id", organizationId)
        .eq("billable", true)
        .not("clock_out", "is", null)
        .order("clock_in", { ascending: false })
        .limit(500);
      if (error) throw error;

      // Entries already referenced by an invoice's items are treated as billed.
      // Without org-wide invoice read, RLS can return zero rows even when entries were billed,
      // so we never read "no invoices" as "unbilled". Entries are shown as unverified instead.
      const billedIds = new Set<string>();
      const PAGE = 1000;
      const invoiceRows: { items: unknown }[] = [];
      for (let from = 0; mayInvoice; from += PAGE) {
        const { data: page, error: invoiceError } = await supabase
          .from("invoices")
          .select("items")
          .eq("organization_id", organizationId)
          .order("id")
          .range(from, from + PAGE - 1);
        // Fail closed: without invoice data we can't tell what is already billed.
        if (invoiceError) throw invoiceError;
        invoiceRows.push(...(page ?? []));
        if (!page || page.length < PAGE) break;
      }
      for (const inv of invoiceRows) {
        if (!Array.isArray(inv.items)) continue;
        for (const item of inv.items) {
          const id = (item as { time_entry_id?: unknown } | null)?.time_entry_id;
          if (typeof id === "string") billedIds.add(id);
        }
      }

      // Only unbilled entries are kept in state, so selection can never include billed ones.
      setTimeEntries((rows ?? []).filter((r) => !billedIds.has(r.id)).map((r) => {
        const ms = new Date(r.clock_out as string).getTime() - new Date(r.clock_in).getTime();
        const hours = Math.max(0, Math.round((ms / 3_600_000) * 100) / 100);
        const caseRow = r.cases as { title?: string } | null;
        return {
          id: r.id,
          date: r.clock_in,
          attorney: r.user_id === user.id ? "You" : "Team member",
          matter: caseRow?.title ?? "General",
          description: r.description ?? "",
          hours,
          rate: Number(r.hourly_rate ?? 0),
          status: mayInvoice ? ("unbilled" as const) : ("unverified" as const),
        };
      }));
    } catch (error) {
      console.error("Time entry load error:", error);
      setCanInvoice(false);
      setLoadError(errorMessage(error, "Failed to load time entries"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTimeEntries();
  }, [loadTimeEntries]);

  const selectedEntries = canInvoice ? timeEntries.filter(e => e.selected && e.status === "unbilled") : [];
  const selectedTotal = selectedEntries.reduce((sum, e) => sum + (e.hours * e.rate), 0);

  const toggleEntry = (id: string) => {
    if (!canInvoice) return;
    setTimeEntries(prev => prev.map(e => 
      e.id === id ? { ...e, selected: !e.selected } : e
    ));
  };

  const selectAll = () => {
    if (!canInvoice) return;
    const allSelected = timeEntries.every(e => e.selected);
    setTimeEntries(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const generateInvoices = async () => {
    if (!canInvoice) {
      toast.error("Only firm owners, admins and managers can generate invoices.");
      return;
    }
    if (selectedEntries.length === 0) {
      toast.error("Please select time entries to invoice");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to generate invoices");
        return;
      }

      const organizationId = await ensureUserOrganization(user.id);

      // Get a client for this invoice (in real implementation, group by client)
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("organization_id", organizationId)
        .limit(1);
      if (clientsError) throw clientsError;

      if (!clients || clients.length === 0) {
        toast.error("No clients found. Please add a client first.");
        return;
      }

      // Create invoice record
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        organization_id: organizationId,
        client_id: clients[0].id,
        amount: selectedTotal,
        status: "draft",
        due_date: dueDate.toISOString().split("T")[0],
        notes: `Generated from ${selectedEntries.length} time entries`,
        items: selectedEntries.map(e => ({
          time_entry_id: e.id,
          description: e.description,
          hours: e.hours,
          rate: e.rate,
          amount: e.hours * e.rate
        }))
      });

      if (error) throw error;

      toast.success(`Generated invoice ${invoiceNumber} for $${selectedTotal.toLocaleString()}`);
      
      setTimeEntries(prev => prev.filter(e => !e.selected));
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast.error(errorMessage(error, "Failed to generate invoice"));
    } finally {
      setIsGenerating(false);
    }
  };

  const statusColors = {
    unbilled: "bg-yellow-500/20 text-yellow-400",
    billed: "bg-green-500/20 text-green-400",
    written_off: "bg-gray-500/20 text-gray-400",
    unverified: "bg-muted text-muted-foreground",
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
                <Badge className="bg-amber-500/20 text-amber-500">Not connected</Badge>
              </h2>
              <p className="text-muted-foreground">
                Billing records are not connected. No sample entries or payment records are shown.
              </p>
            </div>
            {canInvoice && (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        Connect billing data before using invoicing or payment reporting. No sample data will be written to your account.
      </p>
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
                  <CardDescription>
                    {canInvoice ? "Select entries to generate invoices" : "Read-only view of your billable time"}
                  </CardDescription>
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
              {!isLoading && !loadError && !canInvoice && (
                <div role="status" className="mb-4 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>
                    Invoicing is limited to firm owners, admins and managers, who can see every invoice and so avoid
                    billing the same time twice. These entries are read-only and may already be billed. Ask an
                    owner, admin or manager to generate invoices.
                  </span>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      {canInvoice && (
                        <Checkbox
                          checked={timeEntries.length > 0 && timeEntries.every(e => e.selected)}
                          onCheckedChange={selectAll}
                        />
                      )}
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
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        Loading time entries...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && loadError && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-destructive">
                        {loadError}{" "}
                        <Button variant="link" size="sm" onClick={() => void loadTimeEntries()}>Retry</Button>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !loadError && timeEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        {canInvoice ? "No unbilled time entries." : "No billable time entries."}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !loadError && timeEntries.map((entry) => (
                    <TableRow key={entry.id} className={entry.selected ? "bg-primary/5" : ""}>
                      <TableCell>
                        {canInvoice && entry.status === "unbilled" && (
                          <Checkbox
                            checked={entry.selected}
                            onCheckedChange={() => toggleEntry(entry.id)}
                          />
                        )}
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
                <Badge variant="outline">Unavailable until billing is connected</Badge>
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
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No connected invoices.
                      </TableCell>
                    </TableRow>
                  )}
                  {invoices.map((invoice) => (
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
                  { method: "Credit Card", provider: "Stripe", status: "not connected", icon: CreditCard },
                  { method: "ACH Transfer", provider: "Bank", status: "not connected", icon: DollarSign },
                  { method: "Check", provider: "Manual", status: "not connected", icon: FileText },
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
                      <Badge variant="outline">{payment.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-semibold mb-4">Recent Payments</h4>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">No payment records are connected.</p>
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
                Billing Automation Rule Preview
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
                  <Badge variant="outline">
                    {rule.enabled ? "Sample enabled" : "Sample disabled"}
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
