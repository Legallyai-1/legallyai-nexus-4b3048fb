import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Briefcase, Users, Calendar, FileText, Clock, Search, 
  Plus, MoreVertical, AlertCircle, Timer, DollarSign, Loader2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Matter {
  id: string;
  matter_number: string;
  name: string;
  description: string | null;
  practice_area: string | null;
  status: string;
  billing_type: string;
  hourly_rate: number;
  budget: number | null;
  open_date: string;
  statute_of_limitations: string | null;
  client: { full_name: string } | null;
  responsible_attorney: { full_name: string } | null;
}

export function PracticeManagement() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMatter, setNewMatter] = useState({
    name: "",
    matter_number: "",
    practice_area: "",
    billing_type: "hourly",
    hourly_rate: 350,
    description: ""
  });

  useEffect(() => {
    fetchMatters();
  }, []);

  const fetchMatters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('matters')
        .select(`
          *,
          client:clients(full_name),
          responsible_attorney:profiles!matters_responsible_attorney_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatters(data || []);
    } catch (error) {
      console.error('Error fetching matters:', error);
      toast.error('Failed to load matters');
    } finally {
      setIsLoading(false);
    }
  };

  const createMatter = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Get user's organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!orgMember) {
        toast.error('You must belong to an organization');
        return;
      }

      const matterNumber = newMatter.matter_number || `M-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase
        .from('matters')
        .insert({
          organization_id: orgMember.organization_id,
          matter_number: matterNumber,
          name: newMatter.name,
          description: newMatter.description,
          practice_area: newMatter.practice_area,
          billing_type: newMatter.billing_type,
          hourly_rate: newMatter.hourly_rate,
          responsible_attorney_id: user.id
        });

      if (error) throw error;

      toast.success('Matter created successfully');
      setIsCreateOpen(false);
      setNewMatter({
        name: "",
        matter_number: "",
        practice_area: "",
        billing_type: "hourly",
        hourly_rate: 350,
        description: ""
      });
      fetchMatters();
    } catch (error) {
      console.error('Error creating matter:', error);
      toast.error('Failed to create matter');
    }
  };

  const filteredMatters = matters.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.matter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (m.client?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    archived: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  const totalValue = matters.reduce((sum, m) => sum + (m.budget || 0), 0);
  const activeMatters = matters.filter(m => m.status === 'active').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matters.length}</p>
                <p className="text-xs text-muted-foreground">Total Matters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeMatters}</p>
                <p className="text-xs text-muted-foreground">Active Matters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{matters.filter(m => m.statute_of_limitations).length}</p>
                <p className="text-xs text-muted-foreground">With Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search matters, clients, or attorneys..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "active" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === "pending" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Matter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Matter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Matter Name</Label>
                  <Input 
                    placeholder="Enter matter name"
                    value={newMatter.name}
                    onChange={(e) => setNewMatter(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matter Number (optional)</Label>
                  <Input 
                    placeholder="Auto-generated if empty"
                    value={newMatter.matter_number}
                    onChange={(e) => setNewMatter(prev => ({ ...prev, matter_number: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Practice Area</Label>
                    <Select 
                      value={newMatter.practice_area} 
                      onValueChange={(v) => setNewMatter(prev => ({ ...prev, practice_area: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Litigation">Litigation</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Family Law">Family Law</SelectItem>
                        <SelectItem value="IP/Patent">IP/Patent</SelectItem>
                        <SelectItem value="Employment">Employment</SelectItem>
                        <SelectItem value="Criminal">Criminal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Type</Label>
                    <Select 
                      value={newMatter.billing_type} 
                      onValueChange={(v) => setNewMatter(prev => ({ ...prev, billing_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="flat_fee">Flat Fee</SelectItem>
                        <SelectItem value="contingency">Contingency</SelectItem>
                        <SelectItem value="retainer">Retainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate ($)</Label>
                  <Input 
                    type="number"
                    value={newMatter.hourly_rate}
                    onChange={(e) => setNewMatter(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Brief description"
                    value={newMatter.description}
                    onChange={(e) => setNewMatter(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={createMatter} className="w-full" disabled={!newMatter.name}>
                  Create Matter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Matters List */}
      <div className="space-y-4">
        {filteredMatters.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matters found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Create your first matter to get started"}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Matter
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMatters.map((matter) => (
            <Card key={matter.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{matter.name}</h3>
                      <Badge className={statusColors[matter.status] || statusColors.pending}>{matter.status}</Badge>
                      {matter.practice_area && <Badge variant="outline">{matter.practice_area}</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="font-mono text-xs">{matter.matter_number}</span>
                      {matter.client && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {matter.client.full_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Opened: {new Date(matter.open_date).toLocaleDateString()}
                      </span>
                      {matter.responsible_attorney && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          {matter.responsible_attorney.full_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Billing</p>
                      <p className="font-semibold capitalize">{matter.billing_type.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Rate</p>
                      <p className="font-semibold text-green-400">${matter.hourly_rate}/hr</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Matter</DropdownMenuItem>
                        <DropdownMenuItem>Add Time Entry</DropdownMenuItem>
                        <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Close Matter</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
