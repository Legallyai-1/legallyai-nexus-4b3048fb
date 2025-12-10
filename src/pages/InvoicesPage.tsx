import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, Send, Download, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SidebarAd from "@/components/ads/SidebarAd";

interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

const InvoicesPage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({ description: "", hours: 0, rate: 0 });

  const addItem = () => {
    if (!newItem.description || newItem.hours <= 0 || newItem.rate <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all item details",
        variant: "destructive",
      });
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

  const mockInvoices = [
    { id: "INV-2024-001", client: "John Doe", amount: 1500, status: "paid", date: "Dec 1, 2024" },
    { id: "INV-2024-002", client: "Jane Smith", amount: 2500, status: "pending", date: "Dec 5, 2024" },
    { id: "INV-2024-003", client: "ABC Corp", amount: 5000, status: "overdue", date: "Nov 15, 2024" },
  ];

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
            <Dialog>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Client</Label>
                      <Select>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john">John Doe</SelectItem>
                          <SelectItem value="jane">Jane Smith</SelectItem>
                          <SelectItem value="abc">ABC Corp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Case</Label>
                      <Select>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select case" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="case1">Contract Dispute #2024-001</SelectItem>
                          <SelectItem value="case2">Employment Matter #2024-002</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-semibold">
                              Total:
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              ${total.toFixed(2)}
                            </TableCell>
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
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button className="bg-primary text-primary-foreground">
                      <Send className="h-4 w-4 mr-2" />
                      Send Invoice
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
                <div className="text-2xl font-bold text-foreground">$9,000</div>
                <p className="text-xs text-green-500 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">$2,500</div>
                <p className="text-xs text-muted-foreground mt-1">1 invoice pending</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">$5,000</div>
                <p className="text-xs text-muted-foreground mt-1">1 invoice overdue</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">$1,500</div>
                <p className="text-xs text-muted-foreground mt-1">1 invoice paid</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>View and manage all your invoices</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
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
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "paid" && (
                            <Button variant="outline" size="sm">
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
        </div>
        </div>
        {/* Sidebar Ad */}
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
