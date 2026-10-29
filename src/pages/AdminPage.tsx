import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Shield, ChevronLeft, Users, Briefcase, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { findUserOrganization } from "@/lib/organizations";
import { FirmTeamPanel, type FirmTeam } from "@/components/business/FirmTeamPanel";

const ROLE_SUMMARY: { role: string; summary: string }[] = [
  { role: "Owner", summary: "Full control of the firm, billing and settings." },
  { role: "Admin", summary: "Manages the team, invites and firm data." },
  { role: "Manager", summary: "Works with firm cases, clients and documents." },
  { role: "Lawyer", summary: "Works with firm cases, clients and documents." },
  { role: "Paralegal", summary: "Supports casework for the firm." },
  { role: "Employee", summary: "Basic staff access, including the time clock." },
];

interface OrgSettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  geoTracking: boolean;
}

const EMPTY_SETTINGS: OrgSettings = { name: "", email: "", phone: "", website: "", address: "", geoTracking: false };

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [team, setTeam] = useState<FirmTeam | null>(null);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>(EMPTY_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  // Server-side role verification (RLS still enforces every read and write below).
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'owner'])
          .limit(1);

        if (error) {
          console.error('Error checking role:', error);
          toast.error('Failed to verify access');
          navigate('/dashboard');
          return;
        }

        if (!roleData?.length) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/dashboard');
          return;
        }

        setIsAuthorized(true);
        const orgId = await findUserOrganization(user.id).catch(() => null);
        setOrganizationId(orgId);
        if (orgId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name, email, phone, website, address, geo_tracking_enabled')
            .eq('id', orgId)
            .maybeSingle();
          if (org) {
            setOrgSettings({
              name: org.name ?? "",
              email: org.email ?? "",
              phone: org.phone ?? "",
              website: org.website ?? "",
              address: org.address ?? "",
              geoTracking: !!org.geo_tracking_enabled,
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const handleSaveOrgSettings = async () => {
    if (!organizationId) return;
    if (!orgSettings.name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setSavingSettings(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: orgSettings.name.trim(),
          email: orgSettings.email.trim() || null,
          phone: orgSettings.phone.trim() || null,
          website: orgSettings.website.trim() || null,
          address: orgSettings.address.trim() || null,
          geo_tracking_enabled: orgSettings.geoTracking,
        })
        .eq('id', organizationId)
        .select('id');
      if (error) throw error;
      if (!data?.length) {
        toast.error("Only the firm owner can change these settings");
        return;
      }
      toast.success("Organization settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const activeMembers = team?.members.filter((m) => m.is_active) ?? [];
  const stats = [
    { label: "Team members", value: team ? activeMembers.length : "—", icon: Users, color: "text-legal-gold" },
    { label: "Lawyers", value: team ? activeMembers.filter((m) => m.roles.includes("lawyer")).length : "—", icon: Briefcase, color: "text-legal-cyan" },
    { label: "Pending invites", value: team ? (team.canManage ? team.invites.length : "—") : "—", icon: UserPlus, color: "text-purple-400" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-legal-gold" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
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
        {!organizationId ? (
          <Card>
            <CardHeader>
              <CardTitle>No firm found</CardTitle>
              <CardDescription>
                Your account isn't linked to a firm yet. Open the Business Hub to set one up, then come back here to manage your team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gold" onClick={() => navigate("/business-hub")}>Open Business Hub</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat) => (
                <Card key={stat.label}>
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

            <Tabs defaultValue="employees" className="space-y-6">
              <TabsList>
                <TabsTrigger value="employees">Team</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="settings">Organization Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="employees" className="space-y-4">
                <FirmTeamPanel organizationId={organizationId} onTeamLoaded={setTeam} />
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Roles</CardTitle>
                    <CardDescription>
                      Access is set by each person's role and enforced by the database. To give someone a role, invite them with it from the Team tab.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ROLE_SUMMARY.map((r) => (
                      <div key={r.role} className="p-3 rounded-lg border border-border">
                        <p className="font-semibold">{r.role}</p>
                        <p className="text-sm text-muted-foreground">{r.summary}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>Manage your law firm settings. Only the firm owner can save changes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Organization Name</Label>
                        <Input value={orgSettings.name} onChange={(e) => setOrgSettings(prev => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={orgSettings.email} onChange={(e) => setOrgSettings(prev => ({ ...prev, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={orgSettings.phone} onChange={(e) => setOrgSettings(prev => ({ ...prev, phone: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input value={orgSettings.website} onChange={(e) => setOrgSettings(prev => ({ ...prev, website: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={orgSettings.address} onChange={(e) => setOrgSettings(prev => ({ ...prev, address: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <Checkbox
                        id="geo-tracking"
                        checked={orgSettings.geoTracking}
                        onCheckedChange={(checked) => setOrgSettings(prev => ({ ...prev, geoTracking: !!checked }))}
                      />
                      <div>
                        <Label htmlFor="geo-tracking" className="font-medium cursor-pointer">Enable Geo Tracking</Label>
                        <p className="text-sm text-muted-foreground">Allow staff clock-in/out locations to be recorded</p>
                      </div>
                    </div>
                    <Button variant="gold" onClick={handleSaveOrgSettings} disabled={savingSettings}>
                      {savingSettings ? "Saving..." : "Save Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
