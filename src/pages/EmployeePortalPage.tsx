import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { findUserOrganization } from "@/lib/organizations";
import {
  User, ChevronLeft, Briefcase, Clock, FileText, Phone, Mail, MapPin,
  Calendar, Shield, Building2, Edit, Loader2
} from "lucide-react";
import { startOfWeek } from "date-fns";
import { LexiAssistant } from "@/components/dashboard/LexiAssistant";

interface PortalProfile {
  full_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
}

interface MyTimeEntry {
  id: string;
  clock_in: string;
  clock_out: string | null;
  description: string | null;
  billable: boolean | null;
}

const hoursBetween = (start: string, end: string | null) =>
  end ? Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000) : 0;

export default function EmployeePortalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [entries, setEntries] = useState<MyTimeEntry[]>([]);
  const [activeCases, setActiveCases] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const user = session.user;
      try {
        const [{ data: profileRow }, orgId, { data: timeRows }] = await Promise.all([
          supabase
            .from("profiles")
            // Only columns that exist on production public.profiles (display_name does not; selecting it returned 400).
            .select("full_name, email, phone, location, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),
          findUserOrganization(user.id).catch(() => null),
          supabase
            .from("time_entries")
            .select("id, clock_in, clock_out, description, billable")
            .eq("user_id", user.id)
            .order("clock_in", { ascending: false })
            .limit(50),
        ]);
        if (cancelled) return;
        setProfile(profileRow ? { ...profileRow, display_name: null } : {
          full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
          display_name: null,
          email: user.email ?? "",
          phone: null,
          location: null,
          avatar_url: null,
        });
        setEntries((timeRows ?? []) as MyTimeEntry[]);

        if (orgId) {
          const [{ data: org }, { data: roleRows }, { count }] = await Promise.all([
            supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
            supabase.from("user_roles").select("role").eq("user_id", user.id).eq("organization_id", orgId),
            supabase
              .from("cases")
              .select("id", { count: "exact", head: true })
              .eq("organization_id", orgId)
              .eq("assigned_lawyer_id", user.id)
              .in("status", ["intake", "active", "pending"]),
          ]);
          if (cancelled) return;
          setOrganizationName(org?.name ?? null);
          setRoles([...new Set((roleRows ?? []).map((r) => String(r.role)))]);
          setActiveCases(count ?? 0);
        }
      } catch (error) {
        console.error("Employee portal load error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-legal-gold" />
      </div>
    );
  }

  const name = profile.full_name || profile.display_name || profile.email;
  const initials = name.split(/[\s@]/).filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  const hoursThisWeek = entries
    .filter((e) => new Date(e.clock_in).getTime() >= weekStart)
    .reduce((sum, e) => sum + hoursBetween(e.clock_in, e.clock_out), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ai-assistants")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <User className="h-6 w-6 text-legal-gold" />
          <h1 className="text-xl font-display font-semibold">Employee Portal</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <LexiAssistant userType="business" userName={name.split(" ")[0]} />
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-legal-navy text-legal-gold text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-display font-bold mb-2">{name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {organizationName ?? "Not linked to a firm"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hours">My Hours</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-500/20">
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hours This Week</p>
                      <p className="font-semibold">{hoursThisWeek.toFixed(1)} hrs</p>
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
                      <p className="text-sm text-muted-foreground">Open cases assigned to you</p>
                      <p className="font-semibold">{activeCases ?? "—"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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

          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Hours</CardTitle>
                <CardDescription>
                  Time you've logged with the Time Clock. Pay stubs and direct deposit are handled by your firm's payroll provider, not LegallyAI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-3" />
                    <p>No time logged yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/timeclock")}>Open Time Clock</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <p className="font-medium">{new Date(entry.clock_in).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{entry.description || "No description"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.billable && <Badge variant="outline">Billable</Badge>}
                          <span className="font-semibold">
                            {entry.clock_out ? `${hoursBetween(entry.clock_in, entry.clock_out).toFixed(2)} h` : "In progress"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Access
                </CardTitle>
                <CardDescription>Roles assigned to you at {organizationName ?? "your firm"}</CardDescription>
              </CardHeader>
              <CardContent>
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You don't have a firm role yet. Ask your firm admin to invite you.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="outline" className="capitalize">{role}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  Contact your administrator to change your role.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
