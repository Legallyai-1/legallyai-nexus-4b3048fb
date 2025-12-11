import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, Users, Calendar, FileText, Clock, Search, 
  Plus, Filter, MoreVertical, ChevronRight, AlertCircle,
  CheckCircle, Timer, DollarSign
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Matter {
  id: string;
  name: string;
  client: string;
  type: string;
  status: "active" | "pending" | "closed";
  assignedTo: string;
  deadline: string;
  value: number;
  progress: number;
  hoursLogged: number;
  budgetUsed: number;
}

const mockMatters: Matter[] = [
  { id: "1", name: "Corporate Merger - ABC Corp", client: "ABC Corporation", type: "M&A", status: "active", assignedTo: "John Smith", deadline: "2024-03-15", value: 250000, progress: 65, hoursLogged: 124, budgetUsed: 45 },
  { id: "2", name: "Patent Litigation - TechCo", client: "TechCo Industries", type: "IP Litigation", status: "active", assignedTo: "Sarah Johnson", deadline: "2024-04-01", value: 175000, progress: 40, hoursLogged: 87, budgetUsed: 32 },
  { id: "3", name: "Williams Divorce Settlement", client: "James Williams", type: "Family Law", status: "pending", assignedTo: "Michael Brown", deadline: "2024-02-28", value: 45000, progress: 85, hoursLogged: 56, budgetUsed: 78 },
  { id: "4", name: "Real Estate Transaction - 500 Main St", client: "Johnson Properties LLC", type: "Real Estate", status: "active", assignedTo: "Emily Davis", deadline: "2024-03-20", value: 85000, progress: 55, hoursLogged: 34, budgetUsed: 40 },
];

export function PracticeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredMatters = mockMatters.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const totalValue = mockMatters.reduce((sum, m) => sum + m.value, 0);
  const totalHours = mockMatters.reduce((sum, m) => sum + m.hoursLogged, 0);

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
                <p className="text-2xl font-bold">{mockMatters.length}</p>
                <p className="text-xs text-muted-foreground">Active Matters</p>
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
                <p className="text-xs text-muted-foreground">Total Value</p>
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
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-xs text-muted-foreground">Hours Logged</p>
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
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Deadlines This Week</p>
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
          <Button variant="gold" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Matter
          </Button>
        </div>
      </div>

      {/* Matters List */}
      <div className="space-y-4">
        {filteredMatters.map((matter) => (
          <Card key={matter.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{matter.name}</h3>
                    <Badge className={statusColors[matter.status]}>{matter.status}</Badge>
                    <Badge variant="outline">{matter.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {matter.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(matter.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {matter.hoursLogged}h logged
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={matter.progress} className="w-24 h-2" />
                      <span className="text-sm font-medium">{matter.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget Used</p>
                    <p className="font-semibold">{matter.budgetUsed}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="font-semibold text-green-400">${matter.value.toLocaleString()}</p>
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
        ))}
      </div>
    </div>
  );
}
