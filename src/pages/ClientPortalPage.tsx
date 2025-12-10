import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, MessageSquare, Video, CreditCard, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ClientPortalPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                    <div className="text-2xl font-bold text-foreground">2</div>
                    <p className="text-xs text-muted-foreground mt-1">1 pending review</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">3</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting your signature</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">1</div>
                    <p className="text-xs text-muted-foreground mt-1">Next: Dec 15, 2024</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">$0.00</div>
                    <p className="text-xs text-green-500 mt-1">All paid</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Documents Requiring Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Retainer Agreement</p>
                        <p className="text-sm text-muted-foreground">Sent by Smith & Associates</p>
                      </div>
                      <Button size="sm" className="bg-primary text-primary-foreground">Sign Now</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Settlement Terms</p>
                        <p className="text-sm text-muted-foreground">Review required</p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
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
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Case Review Meeting</p>
                        <p className="text-sm text-muted-foreground">Dec 15, 2024 at 2:00 PM</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Virtual</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
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
                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Contract Dispute - ABC Corp</h3>
                          <p className="text-sm text-muted-foreground">Case #: 2024-001234</p>
                          <p className="text-sm text-muted-foreground mt-1">Attorney: John Smith</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Attorney
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">Employment Matter</h3>
                          <p className="text-sm text-muted-foreground">Case #: 2024-001198</p>
                          <p className="text-sm text-muted-foreground mt-1">Attorney: Sarah Johnson</p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Attorney
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Retainer Agreement.pdf</p>
                          <p className="text-sm text-muted-foreground">Uploaded Dec 1, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500/20 text-red-400">Needs Signature</Badge>
                        <Button size="sm">Sign</Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Case Summary.pdf</p>
                          <p className="text-sm text-muted-foreground">Uploaded Nov 28, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">Signed</Badge>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-4">
                    <Button className="w-full bg-primary text-primary-foreground">
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Virtual Consultation
                    </Button>

                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground">Upcoming</h3>
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">Case Review Meeting</p>
                            <p className="text-sm text-muted-foreground">With John Smith</p>
                            <p className="text-sm text-muted-foreground">Dec 15, 2024 at 2:00 PM EST</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400">Virtual</Badge>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </Button>
                          <Button size="sm" variant="outline">Reschedule</Button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">John Smith</p>
                          <p className="text-xs text-muted-foreground">2h ago</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">I've reviewed the documents and...</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Message
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
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-400">Current Balance</p>
                          <p className="text-2xl font-bold text-foreground">$0.00</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-green-400" />
                      </div>
                    </div>

                    <h3 className="font-medium text-foreground">Recent Invoices</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Invoice #INV-2024-0045</p>
                          <p className="text-sm text-muted-foreground">Nov 15, 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">$1,500.00</p>
                          <Badge className="bg-green-500/20 text-green-400">Paid</Badge>
                        </div>
                      </div>
                    </div>
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
