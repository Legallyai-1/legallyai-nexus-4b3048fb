import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, FileText, Calendar, Clock, DollarSign, ChevronRight, Loader2,
  Upload, Search, PenLine, TrendingUp, BadgeCheck, MoreVertical, Plus, Briefcase, Sparkles,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { AskLeePanel } from "@/components/dashboard/AskLeePanel";
import { formatDistanceToNow } from "date-fns";
import { findUserOrganization } from "@/lib/organizations";
import { errorMessage } from "@/lib/mutationResult";
import { formatAppointmentWhen, loadDashboardData, type DashboardStats } from "@/lib/dashboardData";


interface RecentActivity {
  id: string;
  action: string;
  case_title: string;
  time: string;
}

interface UpcomingAppointment {
  id: string;
  time: string;
  client: string;
  type: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    clients: 0,
    upcomingAppointments: 0,
    pendingInvoices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchDashboardData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    setStatsLoading(true);
    setLoadError(null);
    try {
      const organizationId = await findUserOrganization(userId);
      if (!organizationId) {
        // New account without a practice yet: show the empty dashboard, don't create one on view.
        setStats({ activeCases: 0, clients: 0, upcomingAppointments: 0, pendingInvoices: 0 });
        setAppointments([]);
        setRecentActivity([]);
        return;
      }
      const data = await loadDashboardData(supabase, organizationId);
      setStats(data.stats);
      setAppointments(
        data.appointments.map((apt) => ({
          id: apt.id,
          time: formatAppointmentWhen(apt.startTime),
          client: apt.clientName,
          type: apt.title,
        }))
      );
      setRecentActivity(
        data.recentCases.map((c) => ({
          id: c.id,
          action: `Case status: ${c.status}`,
          case_title: c.title,
          time: formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true }),
        }))
      );
      if (data.failed.length) {
        setLoadError(`Some figures couldn't load (${data.failed.join(", ")}). Refresh to try again.`);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoadError(errorMessage(error, "We couldn't load your dashboard. Refresh to try again."));
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-legal-gold" />
        </div>
      </MainLayout>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(" ")[0];
  const casesTotal = recentActivity.length;
  const indexedPct = casesTotal === 0 ? 0 : Math.round((recentActivity.filter((a) => a.action.includes("active")).length / casesTotal) * 100);

  const workflows = [
    { title: "AI Document Drafting", icon: PenLine, active: true, to: "/generate", hint: "Letters, motions, agreements" },
    { title: "Document Forensic & OCR Upload", icon: Upload, to: "/custody", hint: "Drop a file for Lee to read" },
    { title: "Multijurisdictional Research", icon: Search, to: "/research", hint: "Plain-English research answers" },
  ];

  const metrics = [
    { label: "Active Cases", value: statsLoading ? "…" : String(stats.activeCases), sub: "Case Files & AI Analysis", icon: Briefcase, to: "/cases" },
    { label: "Upcoming Appointments", value: statsLoading ? "…" : String(stats.upcomingAppointments), sub: "Deadlines & hearings", icon: Calendar, to: "/appointments" },
    { label: "Pending Invoices", value: statsLoading ? "…" : `$${stats.pendingInvoices.toLocaleString()}`, sub: "Outstanding", icon: DollarSign, to: "/invoices" },
    { label: "Clients", value: statsLoading ? "…" : String(stats.clients), sub: "Firm Overview", icon: Users, to: "/clients" },
  ];

  return (
    <MainLayout>
      <div className="min-h-full p-4 md:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ===== Main column ===== */}
          <div className="min-w-0 space-y-8">
            {/* Live AI Processing */}
            <section aria-labelledby="live-ai">
              <div className="flex items-center justify-between gap-3">
                <h2 id="live-ai" className="font-display text-xl font-semibold">Live AI Processing</h2>
                <Button size="sm" className="gold-tile border-0 font-semibold hover:brightness-105" onClick={() => navigate("/chat")}><Plus className="h-4 w-4 mr-1" /> New AI Progress</Button>
              </div>
              {loadError && (
                <p role="alert" className="mt-2 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-sm text-amber-900">{loadError}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">Welcome back{firstName ? `, ${firstName}` : ""}. Here is what Lee is tracking for your practice.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="glass-panel rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{recentActivity[0] ? `Analyzing ${recentActivity[0].case_title}` : "Case file analysis"}</h3>
                      <p className="text-xs text-muted-foreground">{recentActivity[0] ? `Updated ${recentActivity[0].time}` : "Save a Lee answer to a case to start tracking"}</p>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-300/60">
                    <div className="h-full rounded-full bg-gradient-to-r from-[hsl(46_95%_78%)] to-[hsl(40_90%_52%)] transition-all" style={{ width: `${Math.max(indexedPct, casesTotal ? 8 : 0)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{casesTotal ? `${indexedPct}% of recent matters active` : "No matters yet"} · {stats.activeCases} active</p>
                </div>
                <div className="glass-panel rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">Deadlines on calendar</h3>
                      <p className="text-xs text-muted-foreground">Lee keeps hearings and filing dates in one place</p>
                    </div>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200"><BadgeCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" /></span>
                    <div>
                      <p className="text-sm font-medium">{appointments.length ? `Next: ${appointments[0].type}, ${appointments[0].time}` : "Nothing scheduled"}</p>
                      <p className="text-xs text-muted-foreground">{stats.upcomingAppointments} upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Workflows */}
            <section aria-labelledby="workflows">
              <h2 id="workflows" className="font-display text-xl font-semibold">Enterprise AI Workflows</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {workflows.map((w) => (
                  <button key={w.title} type="button" onClick={() => navigate(w.to)} data-active={w.active ? "true" : undefined} className="metal-card group relative flex min-h-[150px] flex-col justify-between rounded-2xl p-4 text-left">
                    <span className="font-display text-base font-bold leading-tight">{w.title}</span>
                    <span className="flex items-end justify-between">
                      <span className="text-xs text-[hsl(218_22%_30%)]">{w.hint}</span>
                      <span className="metal-icon-well h-11 w-11"><w.icon className="h-6 w-6" aria-hidden="true" /></span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Insights & Metrics */}
            <section aria-labelledby="insights">
              <h2 id="insights" className="font-display text-xl font-semibold">Firm Insights & Metrics</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m) => (
                  <button key={m.label} type="button" onClick={() => navigate(m.to)} className="metal-card flex flex-col rounded-2xl p-4 text-left">
                    <span className="text-sm font-semibold">{m.label}</span>
                    <span className="mt-2 flex items-end justify-between">
                      <span className="font-display text-3xl font-bold">{m.value}</span>
                      <m.icon className="metal-icon h-7 w-7" aria-hidden="true" />
                    </span>
                    <span className="mt-1 text-xs text-[hsl(218_22%_30%)]">{m.sub}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Document Workspace */}
            <section aria-labelledby="docs" className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id="docs" className="font-display text-xl font-semibold">Document Workspace</h2>
                <Button size="sm" variant="outline" className="bg-white/70" onClick={() => navigate("/generate")}><Sparkles className="h-4 w-4 mr-1" /> Draft with Lee</Button>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="rounded-xl border border-border/70 bg-white p-5 text-slate-800 shadow-inner">
                  <p className="text-center text-xs font-semibold tracking-wide text-slate-500">DOCUMENT REVIEW</p>
                  <p className="mt-1 text-center text-[11px] text-slate-400">Drafted & Reviewed by Lee</p>
                  {recentActivity.length === 0 ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm">No documents yet. Ask Lee to draft a letter, motion or agreement and it will appear here for review.</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"><Sparkles className="h-3 w-3" /> Suggested edits by Lee</span>
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {recentActivity.map((a) => (
                        <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                          <span className="truncate"><FileText className="mr-2 inline h-4 w-4 text-slate-400" aria-hidden="true" />{a.case_title}</span>
                          <span className="shrink-0 text-xs text-slate-500">{a.time}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Upcoming</h3>
                  {appointments.length === 0 && <p className="text-sm text-muted-foreground">No appointments scheduled.</p>}
                  {appointments.map((apt) => (
                    <button key={apt.id} type="button" onClick={() => navigate("/appointments")} className="flex w-full items-center gap-3 rounded-xl metal-card p-3 text-left">
                      <Clock className="h-4 w-4 metal-icon" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{apt.type}</span>
                        <span className="block text-xs text-muted-foreground">{apt.time} · {apt.client}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </button>
                  ))}
                  <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:bg-white/70" onClick={() => navigate("/appointments")}><TrendingUp className="h-4 w-4 mr-2" /> View all activity</Button>
                </div>
              </div>
            </section>
          </div>

          {/* ===== Ask Lee partner panel ===== */}
          <AskLeePanel userType="lawyer" className="xl:sticky xl:top-20 xl:h-[calc(100dvh-6rem)]" />
        </div>
      </div>
    </MainLayout>
  );
}
