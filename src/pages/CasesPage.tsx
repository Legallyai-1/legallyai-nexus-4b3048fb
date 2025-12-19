import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Scale, Plus, Search, Filter, FileText, Calendar, 
  ChevronLeft, MoreVertical, Edit, Trash2, Loader2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Database } from "@/integrations/supabase/types";

type CaseStatus = Database["public"]["Enums"]["case_status"];

interface Case {
  id: string;
  title: string;
  case_number: string | null;
  case_type: string | null;
  status: CaseStatus;
  description: string | null;
  created_at: string;
  court_date: string | null;
  client_id: string;
  organization_id: string;
}

interface Client {
  id: string;
  full_name: string;
}

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [newCase, setNewCase] = useState({
    title: "",
    case_number: "",
    case_type: "",
    description: "",
    client_id: ""
  });

  const statusColors: Record<CaseStatus, string> = {
    intake: "bg-blue-500/20 text-blue-400",
    active: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    closed: "bg-gray-500/20 text-gray-400",
    archived: "bg-purple-500/20 text-purple-400",
  };

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
      // Get user's organization
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

        // Fetch cases
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .order('created_at', { ascending: false });

        if (casesError) throw casesError;
        setCases(casesData || []);

        // Fetch clients for dropdown
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, full_name')
          .eq('organization_id', orgMember.organization_id)
          .order('full_name');

        setClients(clientsData || []);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.title.trim() || !newCase.client_id) {
      toast.error("Title and client are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('cases').insert({
        title: newCase.title,
        case_number: newCase.case_number || null,
        case_type: newCase.case_type || null,
        description: newCase.description || null,
        client_id: newCase.client_id,
        organization_id: organizationId,
        status: 'intake' as CaseStatus
      });

      if (error) throw error;

      toast.success("Case created successfully");
      setNewCase({ title: "", case_number: "", case_type: "", description: "", client_id: "" });
      setIsCreateOpen(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) fetchData(session.user.id);
    } catch (error: any) {
      console.error("Error creating case:", error);
      toast.error(error.message || "Failed to create case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this case?")) return;

    try {
      const { error } = await supabase.from('cases').delete().eq('id', caseId);
      if (error) throw error;
      toast.success("Case deleted");
      setCases(cases.filter(c => c.id !== caseId));
    } catch (error: any) {
      toast.error("Failed to delete case");
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      if (error) throw error;
      setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.case_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout adSlot="CASES_SIDEBAR_SLOT">
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Scale className="h-6 w-6 text-neon-gold" />
            <h1 className="text-xl font-display font-semibold">Case Management</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search cases by name or number..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="gold">
                  <Plus className="h-4 w-4 mr-2" />
                  New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Case</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCase} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Case Title *</Label>
                    <Input 
                      placeholder="Enter case title"
                      value={newCase.title}
                      onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client *</Label>
                    <Select 
                      value={newCase.client_id} 
                      onValueChange={(v) => setNewCase({ ...newCase, client_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No clients yet. <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/clients")}>Add a client first</Button>
                          </div>
                        ) : (
                          clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Case Number</Label>
                      <Input 
                        placeholder="e.g., PI-2024-001"
                        value={newCase.case_number}
                        onChange={(e) => setNewCase({ ...newCase, case_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Case Type</Label>
                      <Select 
                        value={newCase.case_type}
                        onValueChange={(v) => setNewCase({ ...newCase, case_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal_injury">Personal Injury</SelectItem>
                          <SelectItem value="family">Family Law</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                          <SelectItem value="criminal">Criminal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Brief description of the case..."
                      value={newCase.description}
                      onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="gold" disabled={isSubmitting || clients.length === 0}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Case"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neon-cyan" />
            </div>
          ) : filteredCases.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {cases.length === 0 ? "No cases yet. Create your first case!" : "No cases found matching your filters"}
                </p>
                {cases.length === 0 && clients.length > 0 && (
                  <Button variant="gold" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Case
                  </Button>
                )}
                {clients.length === 0 && (
                  <Button variant="gold" onClick={() => navigate("/clients")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add a Client First
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-card transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{caseItem.title}</h3>
                          <Badge className={statusColors[caseItem.status]}>
                            {caseItem.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {caseItem.case_number && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {caseItem.case_number}
                            </span>
                          )}
                          {caseItem.case_type && (
                            <span>{caseItem.case_type}</span>
                          )}
                          {caseItem.court_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Court: {new Date(caseItem.court_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {caseItem.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {caseItem.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(caseItem.id, 'active')}>
                            Set Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(caseItem.id, 'pending')}>
                            Set Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(caseItem.id, 'closed')}>
                            Set Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteCase(caseItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
