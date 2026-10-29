import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertCircle, Copy, Loader2, Mail, RefreshCw, UserPlus, Users } from "lucide-react";

interface TeamMember {
  user_id: string;
  name: string | null;
  email: string | null;
  roles: string[];
  job_title: string | null;
  department: string | null;
  is_active: boolean;
  joined_at: string | null;
  is_you: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

export interface FirmTeam {
  members: TeamMember[];
  invites: PendingInvite[];
  canManage: boolean;
}

// Owner invites are not offered here; invite-member only lets owners create them anyway.
const INVITE_ROLES = ["admin", "manager", "lawyer", "paralegal", "employee"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function invokeError(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: unknown }).context;
  if (context instanceof Response) {
    const body = await context.clone().json().catch(() => null);
    if (typeof body?.error === "string") return body.error;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Real roster + invites for one organization, via business-hub "team" and invite-member. */
export function FirmTeamPanel({ organizationId, onTeamLoaded }: { organizationId: string; onTeamLoaded?: (team: FirmTeam) => void }) {
  const [team, setTeam] = useState<FirmTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof INVITE_ROLES)[number]>("lawyer");
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<{ email: string; link: string; expiresAt: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("business-hub", { body: { action: "team", organizationId } });
      if (err) throw new Error(await invokeError(err, "Could not load your team"));
      if (!data?.success) throw new Error(data?.error || "Could not load your team");
      const next = data.data as FirmTeam;
      setTeam(next);
      onTeamLoaded?.(next);
    } catch (e) {
      setTeam(null);
      setError(e instanceof Error ? e.message : "Could not load your team");
    } finally {
      setLoading(false);
    }
  }, [organizationId, onTeamLoaded]);

  useEffect(() => { void load(); }, [load]);

  const invite = async () => {
    const address = email.trim().toLowerCase();
    if (!EMAIL_RE.test(address)) { toast.error("Enter a valid email address"); return; }
    setInviting(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("invite-member", { body: { organizationId, email: address, role } });
      if (err) throw new Error(await invokeError(err, "Could not create the invite"));
      if (!data?.inviteLink) throw new Error(data?.error || "Could not create the invite");
      setLastInvite({ email: address, link: data.inviteLink, expiresAt: data.expiresAt });
      setEmail("");
      toast.success("Invite link created");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the invite");
    } finally {
      setInviting(false);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } catch {
      toast.error("Copy failed. Select the link and copy it manually.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team</CardTitle>
          <CardDescription>People in your firm and their roles.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && !team && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" /><span>{error}</span>
          </div>
        )}

        {team && (
          <div className="space-y-2">
            {team.members.length === 0 && <p className="text-sm text-muted-foreground">No members yet.</p>}
            {team.members.map((m) => (
              <div key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.name || m.email || "Team member"}{m.is_you && <span className="text-muted-foreground"> (you)</span>}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[m.email && m.name ? m.email : null, m.job_title, m.department].filter(Boolean).join(" · ") || "\u00a0"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {m.roles.length === 0 && <Badge variant="outline">member</Badge>}
                  {m.roles.map((r) => <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>)}
                  {!m.is_active && <Badge variant="outline">inactive</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}

        {team?.canManage && (
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-semibold flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite someone</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="email" placeholder="colleague@yourfirm.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Select value={role} onValueChange={(v) => setRole(v as (typeof INVITE_ROLES)[number])}>
                <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVITE_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => void invite()} disabled={inviting || !email.trim()}>
                {inviting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />} Create invite
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              LegallyAI doesn't email the invite. Copy the link and send it to them yourself; it works once, for that email address.
            </p>
            {lastInvite && (
              <div className="space-y-2 rounded-md bg-muted/40 p-3">
                <p className="text-sm">Invite link for <strong>{lastInvite.email}</strong> (expires {new Date(lastInvite.expiresAt).toLocaleDateString()}):</p>
                <div className="flex gap-2">
                  <Input readOnly value={lastInvite.link} onFocus={(e) => e.currentTarget.select()} />
                  <Button variant="outline" onClick={() => void copyLink(lastInvite.link)}><Copy className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">This link is shown only now. If you lose it, create a new invite.</p>
              </div>
            )}
            {team.invites.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Pending invites</h5>
                {team.invites.map((i) => (
                  <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="truncate">{i.email}</span>
                    <span className="text-xs text-muted-foreground"><span className="capitalize">{i.role}</span> · expires {new Date(i.expires_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {team && !team.canManage && (
          <p className="text-xs text-muted-foreground">Ask your firm's owner or an admin to invite new people.</p>
        )}
      </CardContent>
    </Card>
  );
}
