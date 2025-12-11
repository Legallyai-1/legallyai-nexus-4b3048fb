import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { 
  Building2, Users, FileText, DollarSign, Shield, Zap, 
  BarChart3, Calendar, Clock, Briefcase, Scale, Settings,
  TrendingUp, AlertTriangle, CheckCircle, Lock, Globe,
  Loader2, ChevronRight, ArrowUpRight, Sparkles
} from "lucide-react";

// Import hub components
import { PracticeManagement } from "@/components/business/PracticeManagement";
import { AIIntakeForm } from "@/components/business/AIIntakeForm";
import { TrustAccounting } from "@/components/business/TrustAccounting";
import { DocumentAssembly } from "@/components/business/DocumentAssembly";
import { IntegrationHub } from "@/components/business/IntegrationHub";
import { ComplianceDashboard } from "@/components/business/ComplianceDashboard";
import { PracticeAnalytics } from "@/components/business/PracticeAnalytics";
import { BillingAutomation } from "@/components/business/BillingAutomation";

export default function BusinessHubPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
    checkAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  const overviewStats = [
    { label: "Active Matters", value: "156", change: "+12%", icon: Briefcase, trend: "up" },
    { label: "Monthly Revenue", value: "$284,500", change: "+8.3%", icon: DollarSign, trend: "up" },
    { label: "Trust Balance", value: "$1.2M", change: "Reconciled", icon: Shield, trend: "neutral" },
    { label: "Billable Hours", value: "1,847", change: "+15%", icon: Clock, trend: "up" },
    { label: "Active Clients", value: "89", change: "+5", icon: Users, trend: "up" },
    { label: "Compliance Score", value: "98%", change: "SOC 2 Ready", icon: CheckCircle, trend: "up" },
  ];

  const complianceBadges = [
    { name: "SOC 2 Type II", status: "certified", icon: Shield },
    { name: "HIPAA", status: "compliant", icon: Lock },
    { name: "GDPR", status: "compliant", icon: Globe },
    { name: "ABA Ethics", status: "certified", icon: Scale },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Business Hub
              <Badge className="bg-primary/20 text-primary">Enterprise</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete law firm management platform with AI-powered automation
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {complianceBadges.map((badge, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="bg-green-500/10 text-green-400 border-green-500/30 flex items-center gap-1"
              >
                <badge.icon className="h-3 w-3" />
                {badge.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-9 w-full bg-muted/30 p-1 h-auto">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="practice" className="text-xs lg:text-sm">Practice</TabsTrigger>
            <TabsTrigger value="intake" className="text-xs lg:text-sm">AI Intake</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs lg:text-sm">Billing</TabsTrigger>
            <TabsTrigger value="trust" className="text-xs lg:text-sm">Trust</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs lg:text-sm">Documents</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs lg:text-sm">Analytics</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs lg:text-sm">Integrations</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs lg:text-sm">Compliance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {overviewStats.map((stat, i) => (
                <Card key={i} className="bg-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                      {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xs text-green-400 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Actions
                  </CardTitle>
                  <CardDescription>Automate your practice with intelligent workflows</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Smart Intake", desc: "AI-powered client onboarding", icon: Users, action: () => setActiveTab("intake") },
                    { title: "Document Assembly", desc: "Generate docs from templates", icon: FileText, action: () => setActiveTab("documents") },
                    { title: "Auto-Billing", desc: "Intelligent invoice generation", icon: DollarSign, action: () => setActiveTab("billing") },
                    { title: "Trust Reconciliation", desc: "3-way reconciliation", icon: Shield, action: () => setActiveTab("trust") },
                  ].map((item, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary/50"
                      onClick={item.action}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "API Status", status: "Operational", percent: 100 },
                    { name: "Data Sync", status: "Real-time", percent: 100 },
                    { name: "Backup Status", status: "Current", percent: 100 },
                    { name: "Security Scan", status: "Passed", percent: 98 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                          {item.status}
                        </Badge>
                      </div>
                      <Progress value={item.percent} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    250+ Integrations Available
                  </span>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("integrations")}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {["Stripe", "QuickBooks", "Xero", "Microsoft 365", "Google Workspace", "DocuSign", "Zoom", "Slack", "Salesforce", "HubSpot", "Dropbox", "Box"].map((app, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      {app}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="px-3 py-1">
                    +238 more
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Management Tab */}
          <TabsContent value="practice">
            <PracticeManagement />
          </TabsContent>

          {/* AI Intake Tab */}
          <TabsContent value="intake">
            <AIIntakeForm />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <BillingAutomation />
          </TabsContent>

          {/* Trust Accounting Tab */}
          <TabsContent value="trust">
            <TrustAccounting />
          </TabsContent>

          {/* Document Assembly Tab */}
          <TabsContent value="documents">
            <DocumentAssembly />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PracticeAnalytics />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <IntegrationHub />
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
