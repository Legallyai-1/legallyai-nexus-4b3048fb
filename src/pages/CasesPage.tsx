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
  User, ChevronLeft, MoreVertical, Eye, Edit, Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type CaseStatus = "intake" | "active" | "pending" | "closed" | "archived";

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
}

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const statusColors: Record<CaseStatus, string> = {
    intake: "bg-blue-500/20 text-blue-400",
    active: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    closed: "bg-gray-500/20 text-gray-400",
    archived: "bg-purple-500/20 text-purple-400",
  };

  useEffect(() => {
    // For now, show demo data since we need organization context
    setCases([
      {
        id: "1",
        title: "Smith vs. Johnson - Personal Injury",
        case_number: "PI-2024-001",
        case_type: "Personal Injury",
        status: "active",
        description: "Auto accident personal injury case",
        created_at: new Date().toISOString(),
        court_date: "2024-03-15",
        client_id: "demo-client-1"
      },
      {
        id: "2",
        title: "Williams Divorce Settlement",
        case_number: "FAM-2024-042",
        case_type: "Family Law",
        status: "pending",
        description: "Divorce proceedings with custody arrangements",
        created_at: new Date().toISOString(),
        court_date: "2024-02-28",
        client_id: "demo-client-2"
      },
      {
        id: "3",
        title: "ABC Corp Merger Agreement",
        case_number: "CORP-2024-015",
        case_type: "Corporate",
        status: "active",
        description: "Corporate merger and acquisition documentation",
        created_at: new Date().toISOString(),
        court_date: null,
        client_id: "demo-client-3"
      },
      {
        id: "4",
        title: "Real Estate Transaction - 123 Main St",
        case_number: "RE-2024-088",
        case_type: "Real Estate",
        status: "closed",
        description: "Commercial property purchase",
        created_at: new Date().toISOString(),
        court_date: null,
        client_id: "demo-client-4"
      },
    ]);
    setLoading(false);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.case_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Scale className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Case Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Actions Bar */}
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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Case Title</Label>
                  <Input placeholder="Enter case title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Case Number</Label>
                    <Input placeholder="e.g., PI-2024-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>Case Type</Label>
                    <Select>
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
                  <Textarea placeholder="Brief description of the case..." />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="gold">Create Case</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading cases...</div>
        ) : filteredCases.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cases found</p>
              <Button variant="gold" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Case
              </Button>
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Case
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
  );
}
