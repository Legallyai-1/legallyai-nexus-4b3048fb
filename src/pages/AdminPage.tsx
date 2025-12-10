import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Shield, ChevronLeft, Users, Plus, Search, Settings,
  Edit, Trash2, MoreVertical, Building2, DollarSign, 
  TrendingUp, Briefcase, UserPlus, Key
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type AppRole = "owner" | "admin" | "manager" | "lawyer" | "paralegal" | "employee" | "client";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  role: AppRole;
  employee_id: string;
  is_active: boolean;
  hire_date: string;
  hourly_rate: number;
}

const roleColors: Record<AppRole, string> = {
  owner: "bg-purple-500/20 text-purple-400",
  admin: "bg-red-500/20 text-red-400",
  manager: "bg-orange-500/20 text-orange-400",
  lawyer: "bg-legal-gold/20 text-legal-gold",
  paralegal: "bg-legal-cyan/20 text-legal-cyan",
  employee: "bg-gray-500/20 text-gray-400",
  client: "bg-green-500/20 text-green-400",
};

const permissions = [
  { id: "cases:read", label: "View Cases", category: "Cases" },
  { id: "cases:write", label: "Edit Cases", category: "Cases" },
  { id: "cases:delete", label: "Delete Cases", category: "Cases" },
  { id: "clients:read", label: "View Clients", category: "Clients" },
  { id: "clients:write", label: "Edit Clients", category: "Clients" },
  { id: "documents:read", label: "View Documents", category: "Documents" },
  { id: "documents:write", label: "Upload Documents", category: "Documents" },
  { id: "invoices:read", label: "View Invoices", category: "Billing" },
  { id: "invoices:write", label: "Create Invoices", category: "Billing" },
  { id: "employees:read", label: "View Employees", category: "HR" },
  { id: "employees:write", label: "Manage Employees", category: "HR" },
  { id: "payroll:read", label: "View Payroll", category: "HR" },
  { id: "payroll:write", label: "Process Payroll", category: "HR" },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Demo employees
    setEmployees([
      {
        id: "1",
        full_name: "John Smith",
        email: "john@lawfirm.com",
        job_title: "Senior Associate",
        department: "Litigation",
        role: "lawyer",
        employee_id: "EMP-001",
        is_active: true,
        hire_date: "2022-03-15",
        hourly_rate: 175,
      },
      {
        id: "2",
        full_name: "Sarah Johnson",
        email: "sarah@lawfirm.com",
        job_title: "Paralegal",
        department: "Corporate",
        role: "paralegal",
        employee_id: "EMP-002",
        is_active: true,
        hire_date: "2023-01-10",
        hourly_rate: 75,
      },
      {
        id: "3",
        full_name: "Michael Brown",
        email: "michael@lawfirm.com",
        job_title: "Managing Partner",
        department: "Management",
        role: "admin",
        employee_id: "EMP-003",
        is_active: true,
        hire_date: "2018-06-01",
        hourly_rate: 350,
      },
      {
        id: "4",
        full_name: "Emily Davis",
        email: "emily@lawfirm.com",
        job_title: "Office Manager",
        department: "Operations",
        role: "manager",
        employee_id: "EMP-004",
        is_active: true,
        hire_date: "2021-09-20",
        hourly_rate: 45,
      },
    ]);
  }, []);

  const filteredEmployees = employees.filter(e =>
    e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Employees", value: employees.length, icon: Users, color: "text-legal-gold" },
    { label: "Active Lawyers", value: employees.filter(e => e.role === "lawyer").length, icon: Briefcase, color: "text-legal-cyan" },
    { label: "Monthly Payroll", value: "$125,400", icon: DollarSign, color: "text-green-400" },
    { label: "Revenue MTD", value: "$89,500", icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Administrator Panel</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="settings">Organization Settings</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search employees..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@lawfirm.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input placeholder="Associate Attorney" />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="litigation">Litigation</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="family">Family Law</SelectItem>
                            <SelectItem value="real_estate">Real Estate</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lawyer">Lawyer</SelectItem>
                            <SelectItem value="paralegal">Paralegal</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Hourly Rate ($)</Label>
                        <Input type="number" placeholder="150" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input placeholder="EMP-005" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="gold">Add Employee</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Employee</th>
                        <th className="p-4 font-medium">Department</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Rate</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-legal-navy text-legal-gold">
                                  {emp.full_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{emp.full_name}</p>
                                <p className="text-sm text-muted-foreground">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p>{emp.job_title}</p>
                            <p className="text-sm text-muted-foreground">{emp.department}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={roleColors[emp.role]}>{emp.role}</Badge>
                          </td>
                          <td className="p-4">${emp.hourly_rate}/hr</td>
                          <td className="p-4">
                            <Badge className={emp.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {emp.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Key className="h-4 w-4 mr-2" />
                                  Permissions
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Configure what each role can access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["Cases", "Clients", "Documents", "Billing", "HR"].map((category) => (
                    <div key={category}>
                      <h4 className="font-semibold mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.filter(p => p.category === category).map((perm) => (
                          <div key={perm.id} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                            <Checkbox 
                              id={perm.id}
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPermissions([...selectedPermissions, perm.id]);
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                                }
                              }}
                            />
                            <Label htmlFor={perm.id} className="cursor-pointer">{perm.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage your law firm settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input defaultValue="Smith & Associates Law Firm" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="contact@smithlaw.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input defaultValue="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input defaultValue="https://smithlaw.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Legal Street, Suite 400, New York, NY 10001" />
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                  <Checkbox id="geo-tracking" />
                  <div>
                    <Label htmlFor="geo-tracking" className="font-medium cursor-pointer">Enable Geo Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track employee clock-in/out locations</p>
                  </div>
                </div>
                <Button variant="gold">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
