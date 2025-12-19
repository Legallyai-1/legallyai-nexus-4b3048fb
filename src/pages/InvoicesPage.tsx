import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Plus, Send, Download, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SidebarAd from "@/components/ads/SidebarAd";

interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  amount: number;
  status: string | null;
  created_at: string;
  client_id: string;
  clients?: { full_name: string } | null;
}

interface Client {
  id: string;
  full_name: string;
}

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({ description: "", hours: 0, rate: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      await fetchData(session.user.id);
    };
    init();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      let { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (!orgMember) {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({ name: 'My Law Practice', owner_id: userId })
          .select()
          .single();

        if (newOrg) {
          await supabase.from('organization_members').insert({
            organization_id: newOrg.id,
            user_id: userId,
            role: 'owner'
          });
          orgMember = { organization_id: newOrg.id };
        }
      }

      if (orgMember) {
        setOrganizationId(orgMember.organization_id);

        const { data: invoicesData } = await supabase
          .from('invoices')
          .select('*, clients(full_name)')
          .eq('organization_id', orgMember.organization_id)
          .order('created_at', { ascending: false });

        setInvoices(invoicesData || []);

        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, full_name')
          .eq('organization_id', orgMember.organization_id)
          .order('full_name');

        setClients(clientsData || []);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItem.description || newItem.hours <= 0 || newItem.rate <= 0) {
      toast.error("Please fill in all item details");
      return;
    }
    const amount = newItem.hours * newItem.rate;
    setItems([...items, { ...newItem, amount }]);
    setNewItem({ description: "", hours: 0, rate: 0 });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateInvoice = async () => {
    if (!selectedClient || items.length === 0) {
      toast.error("Select a client and add at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
      
      const { error } = await supabase.from('invoices').insert([{
        invoice_number: invoiceNumber,
        client_id: selectedClient,
        organization_id: organizationId!,
        amount: total,
        status: 'pending',
        items: items as any,
        notes: notes || null
      }]);

      if (error) throw error;

      toast.success("Invoice created");
      setIsCreateOpen(false);
      setItems([]);
      setSelectedClient("");
      setNotes("");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) fetchData(session.user.id);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      toast.success("Invoice deleted");
      setInvoices(invoices.filter(i => i.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }
      const { error } = await supabase.from('invoices').update(updates).eq('id', id);
      if (error) throw error;
      setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const stats = {
    total: invoices.reduce((sum, i) => sum + i.amount, 0),
    pending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex">
        <div className="flex-1 min-h-screen bg-background py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
                <p className="text-muted-foreground mt-2">Create and manage client invoices</p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-card">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate an itemized invoice for your client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Client *</Label>
                      <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No clients yet
                            </div>
                          ) : (
                            clients.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label>Add Line Items</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="bg-background col-span-2"
                        />
                        <Input
                          type="number"
                          placeholder="Hours"
                          value={newItem.hours || ""}
                          onChange={(e) => setNewItem({ ...newItem, hours: parseFloat(e.target.value) || 0 })}
                          className="bg-background"
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={newItem.rate || ""}
                            onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                            className="bg-background"
                          />
                          <Button onClick={addItem} size="icon" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {items.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Description</TableHead>
                              <TableHead>Hours</TableHead>
                              <TableHead>Rate</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.hours}</TableCell>
                                <TableCell>${item.rate}/hr</TableCell>
                                <TableCell>${item.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} className="text-right font-semibold">Total:</TableCell>
                              <TableCell className="font-bold text-primary">${total.toFixed(2)}</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes or payment instructions..."
                        className="bg-background"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-primary text-primary-foreground"
                        onClick={handleCreateInvoice}
                        disabled={isSubmitting || !selectedClient || items.length === 0}
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Create Invoice
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">${stats.total.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">${stats.pending.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">${stats.paid.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">${stats.overdue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>View and manage all your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices yet. Create your first invoice!</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.clients?.full_name || 'Unknown'}</TableCell>
                          <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-500/20 text-green-400"
                                  : invoice.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {invoice.status !== "paid" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(invoice.id, 'paid')}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <aside className="hidden xl:block w-[160px] shrink-0 p-4 border-l border-border bg-card/50">
          <div className="sticky top-4">
            <SidebarAd slot="INVOICES_SIDEBAR_SLOT" />
          </div>
        </aside>
      </div>
    </Layout>
  );
};

export default InvoicesPage;
