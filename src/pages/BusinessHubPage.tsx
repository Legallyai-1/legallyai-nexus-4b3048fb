import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { arePaymentsEnabled } from "@/lib/env";
import { findUserOrganization } from "@/lib/organizations";
import {
  Building2, Users, FileText, DollarSign, Shield,
  BarChart3, Briefcase, Lock, Globe,
  Loader2, Sparkles, Brain,
  GitBranch, Award, Activity, AlertCircle
} from "lucide-react";

// Hub tabs load on demand so the hub shell (and the upgrade prompt) stays light.
const named = <K extends string>(loader: () => Promise<Record<K, React.ComponentType<any>>>, key: K) =>
  lazy(() => loader().then((m) => ({ default: m[key] })));
const PracticeManagement = named(() => import("@/components/business/PracticeManagement"), "PracticeManagement");
const AIIntakeForm = named(() => import("@/components/business/AIIntakeForm"), "AIIntakeForm");
const TrustAccounting = named(() => import("@/components/business/TrustAccounting"), "TrustAccounting");
const DocumentAssembly = named(() => import("@/components/business/DocumentAssembly"), "DocumentAssembly");
const PracticeAnalytics = named(() => import("@/components/business/PracticeAnalytics"), "PracticeAnalytics");
const BillingAutomation = named(() => import("@/components/business/BillingAutomation"), "BillingAutomation");
const PredictiveAIPanel = named(() => import("@/components/business/PredictiveAIPanel"), "PredictiveAIPanel");
const AnalyticsDashboard = named(() => import("@/components/business/AnalyticsDashboard"), "AnalyticsDashboard");
const IntegrationHubPanel = named(() => import("@/components/business/IntegrationHubPanel"), "IntegrationHubPanel");
const CertificationCenter = named(() => import("@/components/business/CertificationCenter"), "CertificationCenter");
const CaseWorkflowManager = named(() => import("@/components/business/CaseWorkflowManager"), "CaseWorkflowManager");
const FirmTeamPanel = named(() => import("@/components/business/FirmTeamPanel"), "FirmTeamPanel");

type GateState = "checking" | "allowed" | "upgrade" | "error";

const TabFallback = () => (
  <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
);

function NeedsOrganization({ onSetup }: { onSetup: () => void }) {
  return (
    <Card>
      <CardContent className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">Set up your practice first. Your firm workspace is created the first time you add a client or case in the Practice tab.</p>
        <Button variant="outline" onClick={onSetup}>Go to Practice</Button>
      </CardContent>
    </Card>
  );
}

export default function BusinessHubPage() {
  const navigate = useNavigate();
  const [gate, setGate] = useState<GateState>("checking");
  const [activeTab, setActiveTab] = useState("overview");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const checkAccess = useCallback(async () => {
    setGate("checking");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Organization lookup is read-only; nothing is created on page load.
      try {
        const orgId = await findUserOrganization(user.id);
        setOrganizationId(orgId);
        setOrgError(null);
        if (orgId) {
          const [{ data: org }, { data: roles }] = await Promise.all([
            supabase.from("organizations").select("owner_id").eq("id", orgId).maybeSingle(),
            supabase.from("user_roles").select("role").eq("user_id", user.id).eq("organization_id", orgId),
          ]);
          setCanManage(org?.owner_id === user.id || (roles ?? []).some((r) => r.role === "owner" || r.role === "admin"));
        }
      } catch (e) {
        setOrganizationId(null);
        setOrgError(e instanceof Error ? e.message : "Could not load your organization");
      }

      // Firm tier is decided server-side (check-subscription firm_access): the user's own live
      // Firm/Enterprise plan, or active staff membership in an org whose owner has one.
      if (!arePaymentsEnabled()) {
        setGate("allowed");
        return;
      }
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error || typeof data?.firm_access !== "boolean") {
        setGate("error");
        return;
      }
      setGate(data.firm_access ? "allowed" : "upgrade");
    } catch (error) {
      console.error("Business hub access check failed:", error);
      setGate("error");
    }
  }, [navigate]);

  useEffect(() => { void checkAccess(); }, [checkAccess]);

  if (gate === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (gate === "upgrade" || gate === "error") {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 flex justify-center">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {gate === "upgrade" ? <Lock className="h-5 w-5 text-primary" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                {gate === "upgrade" ? "Business Hub is part of the Firm plan" : "We couldn't confirm your plan"}
              </CardTitle>
              <CardDescription>
                {gate === "upgrade"
                  ? "Case workflows, billing, trust accounting, document assembly, firm analytics and team invites are included with the Firm plan. Staff invited by a Firm-plan owner get access automatically."
                  : "Your plan check didn't complete. Try again in a moment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2">
              {gate === "upgrade" ? (
                <>
                  <Button asChild><Link to="/pricing">See the Firm plan</Link></Button>
                  <Button variant="outline" onClick={() => void checkAccess()}>I just upgraded – check again</Button>
                </>
              ) : (
                <Button onClick={() => void checkAccess()}>Try again</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const withOrg = (render: (orgId: string) => ReactNode) =>
    organizationId ? render(organizationId)
      : orgError ? <Card><CardContent className="p-6 text-sm text-muted-foreground">{orgError}</CardContent></Card>
      : <NeedsOrganization onSetup={() => setActiveTab("practice")} />;

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Building2 className="metal-icon h-8 w-8" />
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
            <TabsTrigger value="team" className="text-xs lg:text-sm flex items-center gap-1">
              <Users className="h-3 w-3" /> Team
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
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: "Case Workflows", desc: "Tasks and timelines per case", icon: GitBranch, action: () => setActiveTab("workflows") },
                    { title: "Predictive AI", desc: "Case outcome forecasts", icon: Brain, action: () => setActiveTab("predictive") },
                    { title: "Smart Intake", desc: "AI-powered client onboarding", icon: Users, action: () => setActiveTab("intake") },
                    { title: "Document Assembly", desc: "Generate docs from templates", icon: FileText, action: () => setActiveTab("documents") },
                    { title: "Billing", desc: "Invoices from logged time", icon: DollarSign, action: () => setActiveTab("billing") },
                    { title: "Team", desc: "Members, roles and invites", icon: Users, action: () => setActiveTab("team") },
                  ].map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      className="metal-card rounded-2xl p-4 flex items-start gap-3 text-left"
                      onClick={item.action}
                    >
                      <span className="metal-icon-well h-10 w-10 shrink-0"><item.icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{item.title}</span>
                        <span className="block text-xs text-[hsl(218_22%_30%)]">{item.desc}</span>
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <Suspense fallback={<TabFallback />}>
            <TabsContent value="practice"><PracticeManagement /></TabsContent>
            <TabsContent value="workflows"><CaseWorkflowManager organizationId={organizationId} /></TabsContent>
            <TabsContent value="predictive"><PredictiveAIPanel /></TabsContent>
            <TabsContent value="intake"><AIIntakeForm /></TabsContent>
            <TabsContent value="billing"><BillingAutomation /></TabsContent>
            <TabsContent value="trust"><TrustAccounting /></TabsContent>
            <TabsContent value="documents">
              <DocumentAssembly organizationId={organizationId} canManageTemplates={canManage} />
            </TabsContent>
            <TabsContent value="analytics">
              {withOrg((orgId) => (
                <div className="space-y-6">
                  <PracticeAnalytics organizationId={orgId} />
                  <AnalyticsDashboard organizationId={orgId} />
                </div>
              ))}
            </TabsContent>
            <TabsContent value="integrations">
              {withOrg((orgId) => <IntegrationHubPanel organizationId={orgId} />)}
            </TabsContent>
            <TabsContent value="certifications"><CertificationCenter /></TabsContent>
            <TabsContent value="team">
              {withOrg((orgId) => <FirmTeamPanel organizationId={orgId} />)}
            </TabsContent>
          </Suspense>

        </Tabs>
      </div>
    </MainLayout>
  );
}
