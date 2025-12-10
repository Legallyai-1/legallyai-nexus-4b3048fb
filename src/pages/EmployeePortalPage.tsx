import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  User, ChevronLeft, Briefcase, DollarSign, Clock, 
  FileText, Phone, Mail, MapPin, Calendar, Shield,
  Building2, Edit, Download
} from "lucide-react";

interface EmployeeProfile {
  id: string;
  full_name: string;
  display_name: string;
  email: string;
  phone: string;
  location: string;
  job_title: string;
  department: string;
  employee_id: string;
  hire_date: string;
  hourly_rate: number;
  avatar_url: string | null;
  permissions: string[];
}

interface PayrollEntry {
  id: string;
  period: string;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  hours_worked: number;
  status: "paid" | "pending" | "processing";
  pay_date: string;
}

export default function EmployeePortalPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);

  useEffect(() => {
    // Demo employee profile
    setProfile({
      id: "1",
      full_name: "John Michael Smith",
      display_name: "John",
      email: "john.smith@lawfirm.com",
      phone: "(555) 123-4567",
      location: "New York, NY",
      job_title: "Senior Associate Attorney",
      department: "Litigation",
      employee_id: "EMP-2024-001",
      hire_date: "2022-03-15",
      hourly_rate: 175,
      avatar_url: null,
      permissions: ["cases:read", "cases:write", "clients:read", "documents:read", "documents:write"],
    });

    // Demo payroll data
    setPayroll([
      {
        id: "1",
        period: "Dec 1-15, 2024",
        gross_pay: 7500,
        deductions: 1875,
        net_pay: 5625,
        hours_worked: 42.86,
        status: "pending",
        pay_date: "2024-12-20",
      },
      {
        id: "2",
        period: "Nov 16-30, 2024",
        gross_pay: 8200,
        deductions: 2050,
        net_pay: 6150,
        hours_worked: 46.86,
        status: "paid",
        pay_date: "2024-12-05",
      },
      {
        id: "3",
        period: "Nov 1-15, 2024",
        gross_pay: 7000,
        deductions: 1750,
        net_pay: 5250,
        hours_worked: 40,
        status: "paid",
        pay_date: "2024-11-20",
      },
    ]);
  }, []);

  const statusColors = {
    paid: "bg-green-500/20 text-green-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    processing: "bg-blue-500/20 text-blue-400",
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <User className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Employee Portal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-legal-navy text-legal-gold text-2xl">
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-display font-bold">{profile.full_name}</h2>
                  <Badge variant="outline">{profile.employee_id}</Badge>
                </div>
                <p className="text-lg text-legal-gold mb-2">{profile.job_title}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {profile.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                </div>
              </div>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-legal-gold/20">
                      <Calendar className="h-5 w-5 text-legal-gold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hire Date</p>
                      <p className="font-semibold">{new Date(profile.hire_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-legal-cyan/20">
                      <DollarSign className="h-5 w-5 text-legal-cyan" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-semibold">${profile.hourly_rate}/hr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hours This Week</p>
                      <p className="font-semibold">32.5 hrs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-500/20">
                      <Briefcase className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Cases</p>
                      <p className="font-semibold">8 cases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate("/timeclock")}>
                    <Clock className="h-6 w-6 mb-2" />
                    Time Clock
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate("/messages")}>
                    <Mail className="h-6 w-6 mb-2" />
                    Messages
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate("/cases")}>
                    <FileText className="h-6 w-6 mb-2" />
                    My Cases
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col" onClick={() => navigate("/appointments")}>
                    <Calendar className="h-6 w-6 mb-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payroll History</CardTitle>
                    <CardDescription>View your pay stubs and earnings</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download W-2
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payroll.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">{entry.period}</span>
                          <Badge className={statusColors[entry.status]}>
                            {entry.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{entry.hours_worked} hours worked</span>
                          <span>Pay Date: {new Date(entry.pay_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Gross: ${entry.gross_pay.toLocaleString()} | Deductions: ${entry.deductions.toLocaleString()}
                        </div>
                        <div className="text-lg font-semibold text-legal-gold">
                          Net: ${entry.net_pay.toLocaleString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Direct Deposit */}
            <Card>
              <CardHeader>
                <CardTitle>Direct Deposit</CardTitle>
                <CardDescription>Manage your payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-legal-navy">
                      <Building2 className="h-5 w-5 text-legal-gold" />
                    </div>
                    <div>
                      <p className="font-medium">Chase Bank ****4567</p>
                      <p className="text-sm text-muted-foreground">Checking Account</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                </div>
                <Button variant="outline" className="mt-4">
                  Update Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
                <CardDescription>
                  Access levels assigned by your administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.permissions.map((permission) => {
                    const [resource, action] = permission.split(':');
                    return (
                      <div 
                        key={permission}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium capitalize">{resource}</p>
                          <p className="text-sm text-muted-foreground capitalize">{action} access</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{action}</Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Contact your administrator to request additional permissions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>Company Policies</CardTitle>
                <CardDescription>Important documents and guidelines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Employee Handbook", updated: "Jan 2024" },
                    { name: "Code of Conduct", updated: "Jan 2024" },
                    { name: "Privacy Policy", updated: "Mar 2024" },
                    { name: "Remote Work Policy", updated: "Jun 2024" },
                    { name: "Time Off Policy", updated: "Jan 2024" },
                    { name: "Expense Reimbursement Policy", updated: "Feb 2024" },
                  ].map((policy) => (
                    <div 
                      key={policy.name}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-muted-foreground">Updated: {policy.updated}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
