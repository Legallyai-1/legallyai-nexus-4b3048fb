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
  Loader2, ChevronRight, ArrowUpRight, Sparkles, Brain,
  GitBranch, Award, Target, Activity
} from "lucide-react";

// Import hub components
import { PracticeManagement } from "@/components/business/PracticeManagement";
import { AIIntakeForm } from "@/components/business/AIIntakeForm";
import { TrustAccounting } from "@/components/business/TrustAccounting";
import { DocumentAssembly } from "@/components/business/DocumentAssembly";
import { IntegrationHub } from "@/components/business/IntegrationHub";
import { PracticeAnalytics } from "@/components/business/PracticeAnalytics";
import { BillingAutomation } from "@/components/business/BillingAutomation";

// Import new advanced components
import { PredictiveAIPanel } from "@/components/business/PredictiveAIPanel";
import { AnalyticsDashboard } from "@/components/business/AnalyticsDashboard";
import { IntegrationHubPanel } from "@/components/business/IntegrationHubPanel";
import { CertificationCenter } from "@/components/business/CertificationCenter";
import { CaseWorkflowManager } from "@/components/business/CaseWorkflowManager";

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

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              Business Hub
              
            </h1>
            <p className="text-muted-foreground mt-1">
              Law firm management tools with AI-assisted drafting
            </p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap w-full bg-muted/30 p-1 h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs lg:text-sm flex items-center gap-1">
              <Activity className="h-3 w-3" /> Overview
            </TabsTrigger>
            <TabsTrigger value="practice" className="text-xs lg:text-sm flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Practice
            </TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs lg:text-sm flex items-center gap-1">
              <GitBranch className="h-3 w-3" /> Workflows
            </TabsTrigger>
            <TabsTrigger value="predictive" className="text-xs lg:text-sm flex items-center gap-1">
              <Brain className="h-3 w-3" /> Predictive AI
            </TabsTrigger>
            <TabsTrigger value="intake" className="text-xs lg:text-sm flex items-center gap-1">
              <Users className="h-3 w-3" /> AI Intake
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs lg:text-sm flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Billing
            </TabsTrigger>
            <TabsTrigger value="trust" className="text-xs lg:text-sm flex items-center gap-1">
              <Shield className="h-3 w-3" /> Trust
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs lg:text-sm flex items-center gap-1">
              <FileText className="h-3 w-3" /> Documents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs lg:text-sm flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs lg:text-sm flex items-center gap-1">
              <Globe className="h-3 w-3" /> Integrations
            </TabsTrigger>
            <TabsTrigger value="certifications" className="text-xs lg:text-sm flex items-center gap-1">
              <Award className="h-3 w-3" /> Certifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions with Predictive AI */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Powered Actions
                  </CardTitle>
                  <CardDescription>Automate your practice with intelligent workflows</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Case Workflows", desc: "Automated task pipelines", icon: GitBranch, action: () => setActiveTab("workflows") },
                    { title: "Predictive AI", desc: "Case outcome forecasts", icon: Brain, action: () => setActiveTab("predictive") },
                    { title: "Smart Intake", desc: "AI-powered client onboarding", icon: Users, action: () => setActiveTab("intake") },
                    { title: "Document Assembly", desc: "Generate docs from templates", icon: FileText, action: () => setActiveTab("documents") },
                    { title: "Auto-Billing", desc: "Intelligent invoice generation", icon: DollarSign, action: () => setActiveTab("billing") },
                    { title: "Certifications", desc: "Team skill tracking", icon: Award, action: () => setActiveTab("certifications") },
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
            </div>
          </TabsContent>

          {/* Practice Management Tab */}
          <TabsContent value="practice">
            <PracticeManagement />
          </TabsContent>

          {/* Case Workflows Tab */}
          <TabsContent value="workflows">
            <CaseWorkflowManager />
          </TabsContent>

          {/* Predictive AI Tab */}
          <TabsContent value="predictive">
            <PredictiveAIPanel />
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

          {/* Analytics Tab - Enhanced with new dashboard */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <AnalyticsDashboard />
              <PracticeAnalytics />
            </div>
          </TabsContent>

          {/* Integrations Tab - Enhanced with API layer */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <IntegrationHubPanel />
              <IntegrationHub />
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications">
            <CertificationCenter />
          </TabsContent>

        </Tabs>
      </div>
    </MainLayout>
  );
}
