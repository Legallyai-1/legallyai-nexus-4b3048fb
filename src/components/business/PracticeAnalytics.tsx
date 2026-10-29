import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Briefcase, Clock, DollarSign, Loader2, RefreshCw, Scale, Users, ListChecks, Landmark } from "lucide-react";

// Live firm snapshot from the business-hub "analytics" action. Every number is a count or sum
// of this organization's own records; nothing here is sample or estimated data.
interface FirmSnapshot {
  clients?: { total: number };
  cases?: { total: number; byStatus: Record<string, number> };
  invoices?: { total: number; outstandingAmount: number; overdueCount: number; paidAmount: number };
  time?: { hoursLast30Days: number; billableHoursLast30Days: number; billableValueLast30Days: number };
  tasks?: { open: number; overdue: number };
  matters: { total: number; byStatus: Record<string, number>; byPracticeArea: Record<string, number> };
  billing: { totalBilled: number; totalUnbilled: number };
  trust: { totalBalance: number; accountCount: number };
}

const money = (n: number | undefined) => `$${Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const label = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function PracticeAnalytics({ organizationId }: { organizationId: string }) {
  const [snapshot, setSnapshot] = useState<FirmSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("business-hub", {
        body: { action: "analytics", organizationId },
      });
      if (invokeError) {
        const status = (invokeError as { context?: { status?: number } }).context?.status;
        throw new Error(status === 403 ? "Firm snapshot is available to your firm's owners and admins." : invokeError.message);
      }
      if (!data?.success || !data.data) throw new Error(data?.error || "Could not load the firm snapshot");
      setSnapshot(data.data as FirmSnapshot);
    } catch (e) {
      setSnapshot(null);
      setError(e instanceof Error ? e.message : "Could not load the firm snapshot");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { void load(); }, [load]);

  const s = snapshot;
  const isEmpty = s && !s.clients?.total && !s.cases?.total && !s.matters.total && !s.invoices?.total && !s.time?.hoursLast30Days;
  const metrics = s ? [
    { title: "Clients", value: String(s.clients?.total ?? 0), sub: "on file", icon: Users },
    { title: "Cases", value: String(s.cases?.total ?? 0), sub: Object.entries(s.cases?.byStatus ?? {}).map(([k, v]) => `${v} ${label(k).toLowerCase()}`).join(" · ") || "none yet", icon: Scale },
    { title: "Matters", value: String(s.matters.total), sub: Object.entries(s.matters.byStatus).map(([k, v]) => `${v} ${label(k).toLowerCase()}`).join(" · ") || "none yet", icon: Briefcase },
    { title: "Hours (30 days)", value: (s.time?.hoursLast30Days ?? 0).toFixed(1), sub: `${(s.time?.billableHoursLast30Days ?? 0).toFixed(1)} billable · ${money(s.time?.billableValueLast30Days)}`, icon: Clock },
    { title: "Outstanding invoices", value: money(s.invoices?.outstandingAmount), sub: `${s.invoices?.overdueCount ?? 0} overdue · ${money(s.invoices?.paidAmount)} paid to date`, icon: DollarSign },
    { title: "Open tasks", value: String(s.tasks?.open ?? 0), sub: `${s.tasks?.overdue ?? 0} past due`, icon: ListChecks },
    { title: "Trust balance", value: money(s.trust.totalBalance), sub: `${s.trust.accountCount} account${s.trust.accountCount === 1 ? "" : "s"}`, icon: Landmark },
    { title: "Billing entries", value: money(s.billing.totalBilled), sub: `billed · ${money(s.billing.totalUnbilled)} unbilled`, icon: DollarSign },
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Firm snapshot</CardTitle>
          <CardDescription>Live totals from your firm's clients, cases, matters, time, invoices and trust accounts.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}
        {!loading && error && (
          <div role="alert" className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!loading && s && (
          <>
            {isEmpty && (
              <p className="mb-4 text-sm text-muted-foreground">
                No firm records yet. Add clients and cases in the Practice tab and log time in Time Clock; these totals update automatically.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.title} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><m.icon className="h-4 w-4" />{m.title}</div>
                  <p className="mt-1 text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
              ))}
            </div>
            {Object.keys(s.matters.byPracticeArea).length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold">Matters by practice area</h4>
                <div className="space-y-2">
                  {Object.entries(s.matters.byPracticeArea).sort((a, b) => b[1] - a[1]).map(([area, count]) => (
                    <div key={area} className="flex items-center gap-3 text-sm">
                      <span className="w-40 truncate">{area}</span>
                      <div className="h-2 flex-1 rounded bg-muted">
                        <div className="h-2 rounded bg-primary" style={{ width: `${(count / s.matters.total) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
