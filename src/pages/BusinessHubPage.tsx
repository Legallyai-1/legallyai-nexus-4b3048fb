import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { arePaymentsEnabled } from "@/lib/env";
import { HubBrand } from "@/components/brand/HubBrand";
import { FirmHubOverview, type HubTab } from "@/components/business/FirmHubOverview";
import { findUserOrganization } from "@/lib/organizations";
import {
  Building2, Users, FileText, DollarSign, Shield,
  BarChart3, Briefcase, Lock, Globe,
  Loader2, Sparkles, Brain,
  GitBranch, Award, Activity, AlertCircle, LayoutGrid, type LucideIcon
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

// Section nav: every item opens a real hub tab (no dead links).
const NAV: { title: string; items: { tab: HubTab; label: string; icon: LucideIcon }[] }[] = [
  { title: "AI Workspace", items: [
    { tab: "overview", label: "Dashboard", icon: Activity },
    { tab: "practice", label: "Practice & Cases", icon: Briefcase },
    { tab: "workflows", label: "Case Workflows", icon: GitBranch },
    { tab: "documents", label: "Documents", icon: FileText },
    { tab: "intake", label: "AI Intake", icon: Users },
    { tab: "predictive", label: "Predictive AI", icon: Brain },
  ] },
  { title: "Firm & Finance", items: [
    { tab: "billing", label: "Billing", icon: DollarSign },
    { tab: "trust", label: "Trust Accounting", icon: Shield },
    { tab: "analytics", label: "Analytics", icon: BarChart3 },
    { tab: "team", label: "Team", icon: Users },
  ] },
  { title: "Tools & Settings", items: [
    { tab: "integrations", label: "Integrations", icon: Globe },
    { tab: "certifications", label: "Certifications", icon: Award },
  ] },
];

function HubSidebar({ active, onSelect }: { active: string; onSelect: (tab: HubTab) => void }) {
  return (
    <aside className="hub-side sticky top-0 flex h-screen shrink-0 flex-col gap-1 overflow-y-auto px-3 py-5" aria-label="Business Hub sections">
      <HubBrand className="mb-5 px-3" />
      <nav className="flex flex-col gap-6">
        {NAV.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <p className="hub-label mb-1 px-3 font-semibold">{section.title}</p>
            {section.items.map((item) => (
              <button
                key={item.tab}
                type="button"
                className="hub-side-item"
                aria-current={active === item.tab ? "page" : undefined}
                onClick={() => onSelect(item.tab)}
              >
                <item.icon className="h-[18px] w-[18px]" aria-hidden="true" /> {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <Link to="/dashboard" className="hub-side-item mt-auto pt-4">
        <LayoutGrid className="h-[18px] w-[18px]" aria-hidden="true" /> All LegallyAI tools
      </Link>
    </aside>
  );
}

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

  const openTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };
  const activeLabel = NAV.flatMap((section) => section.items).find((item) => item.tab === activeTab)?.label ?? "Dashboard";

  return (
    <MainLayout sidebar={<HubSidebar active={activeTab} onSelect={openTab} />}>
      <div className="hub-dash-bg min-h-full p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <p className="hub-label flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 hub-gold-icon" aria-hidden="true" /> Business Hub</p>
          <h1 className="hub-dash-title mt-1 text-2xl leading-[30px] sm:text-[28px] sm:leading-[34px] font-semibold">
            {activeTab === "overview" ? "Firm dashboard" : activeLabel}
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={openTab} className="space-y-4 sm:space-y-6">
          {/* Below md the section nav becomes a scrollable tab strip (the desktop sidebar is hidden). */}
          <div className="md:hidden"><TabsList className="!flex !flex-nowrap w-full justify-start overflow-x-auto p-1 h-auto gap-1">
            {NAV.flatMap((section) => section.items).map((item) => (
              <TabsTrigger key={item.tab} value={item.tab} className="min-h-[44px] shrink-0 text-xs flex items-center gap-1">
                <item.icon className="h-3.5 w-3.5" /> {item.label}
              </TabsTrigger>
            ))}
          </TabsList></div>

          <TabsContent value="overview" className="mt-0">
            <FirmHubOverview organizationId={organizationId} onOpenTab={openTab} />
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
