import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, MessageSquare, Video, CreditCard, Clock, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LexiAssistant } from "@/components/dashboard/LexiAssistant";

interface Case {
  id: string;
  title: string;
  case_number: string | null;
  status: string;
  description: string | null;
  assigned_lawyer_id: string | null;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  is_virtual: boolean;
  meeting_link: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  amount: number;
  status: string | null;
  due_date: string | null;
  created_at: string;
}

const ClientPortalPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadData(session.user.id);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const loadData = async (userId: string) => {
    try {
      // Load client record first
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, organization_id")
        .eq("user_id", userId)
        .single();

      if (clientData) {
        // Load cases for this client
        const { data: casesData } = await supabase
          .from("cases")
          .select("id, title, case_number, status, description, assigned_lawyer_id")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false });

        if (casesData) setCases(casesData);

        // Load appointments for this client
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("id, title, start_time, end_time, status, is_virtual, meeting_link")
          .eq("client_id", clientData.id)
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true });

        if (appointmentsData) setAppointments(appointmentsData);

        // Load invoices for this client
        const { data: invoicesData } = await supabase
          .from("invoices")
          .select("id, invoice_number, amount, status, due_date, created_at")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false });

        if (invoicesData) setInvoices(invoicesData);
      }
    } catch (error) {
      console.error("Error loading client data:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-blue-500/20 text-blue-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      intake: "bg-purple-500/20 text-purple-400",
      closed: "bg-gray-500/20 text-gray-400",
      scheduled: "bg-green-500/20 text-green-400",
      confirmed: "bg-blue-500/20 text-blue-400",
      completed: "bg-gray-500/20 text-gray-400",
      paid: "bg-green-500/20 text-green-400",
      unpaid: "bg-red-500/20 text-red-400",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const totalOutstanding = invoices
    .filter(inv => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Client Portal</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Manage your cases, documents, and appointments.</p>
          </div>

          {/* Lexi Assistant */}
          <div className="mb-8">
            <LexiAssistant 
              userType="individual" 
              userName={user?.user_metadata?.full_name?.split(' ')[0] || "there"} 
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cases">My Cases</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {cases.filter(c => c.status === "active").length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cases.filter(c => c.status === "pending").length} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{cases.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">All time</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {appointments[0] 
                        ? `Next: ${new Date(appointments[0].start_time).toLocaleDateString()}` 
                        : "None scheduled"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">${totalOutstanding.toFixed(2)}</div>
                    <p className={`text-xs mt-1 ${totalOutstanding === 0 ? "text-green-500" : "text-yellow-500"}`}>
                      {totalOutstanding === 0 ? "All paid" : "Payment due"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Recent Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cases.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No cases yet</p>
                    ) : (
                      cases.slice(0, 3).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{c.title}</p>
                            <p className="text-sm text-muted-foreground">{c.case_number || "No case number"}</p>
                          </div>
                          <Badge className={getStatusBadge(c.status)}>{c.status}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                    ) : (
                      appointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{apt.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(apt.start_time).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={apt.is_virtual ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                            {apt.is_virtual ? "Virtual" : "In-Person"}
                          </Badge>
                        </div>
                      ))
                    )}
                    <Button variant="outline" className="w-full" onClick={() => navigate("/consultations")}>
                      <Video className="h-4 w-4 mr-2" />
                      Schedule New Consultation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cases" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>My Cases</CardTitle>
                  <CardDescription>View all your legal cases and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {cases.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No cases found</p>
                  ) : (
                    <div className="space-y-4">
                      {cases.map(c => (
                        <div key={c.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{c.title}</h3>
                              <p className="text-sm text-muted-foreground">Case #: {c.case_number || "N/A"}</p>
                              {c.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                              )}
                            </div>
                            <Badge className={getStatusBadge(c.status)}>{c.status}</Badge>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm" variant="outline" onClick={() => navigate("/messages")}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message Attorney
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>View and sign your legal documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/document-signing")} className="w-full mb-4">
                    <FileText className="h-4 w-4 mr-2" />
                    Go to Document Signing
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    View and sign documents shared by your attorney
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>Schedule and manage your consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full mb-6 bg-primary text-primary-foreground" onClick={() => navigate("/consultations")}>
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Virtual Consultation
                  </Button>

                  {appointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground">Upcoming</h3>
                      {appointments.map(apt => (
                        <div key={apt.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{apt.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(apt.start_time).toLocaleString()}
                              </p>
                            </div>
                            <Badge className={apt.is_virtual ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                              {apt.is_virtual ? "Virtual" : "In-Person"}
                            </Badge>
                          </div>
                          {apt.is_virtual && apt.meeting_link && (
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                                <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  Join Meeting
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with your legal team</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={() => navigate("/messages")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Go to Messages
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Billing & Payments</CardTitle>
                  <CardDescription>View invoices and make payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`p-4 ${totalOutstanding === 0 ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"} border rounded-lg`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${totalOutstanding === 0 ? "text-green-400" : "text-yellow-400"}`}>
                            Outstanding Balance
                          </p>
                          <p className="text-2xl font-bold text-foreground">${totalOutstanding.toFixed(2)}</p>
                        </div>
                        <CreditCard className={`h-8 w-8 ${totalOutstanding === 0 ? "text-green-400" : "text-yellow-400"}`} />
                      </div>
                    </div>

                    {invoices.length > 0 && (
                      <>
                        <h3 className="font-medium text-foreground">Invoices</h3>
                        <div className="space-y-2">
                          {invoices.map(inv => (
                            <div key={inv.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div>
                                <p className="font-medium text-foreground">{inv.invoice_number || `Invoice`}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(inv.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-foreground">${inv.amount.toFixed(2)}</p>
                                <Badge className={getStatusBadge(inv.status || "unpaid")}>
                                  {inv.status || "unpaid"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <Button onClick={() => navigate("/invoices")} variant="outline" className="w-full">
                      View All Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ClientPortalPage;
