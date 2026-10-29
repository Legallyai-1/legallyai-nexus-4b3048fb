// Loads the lawyer dashboard numbers for ONE organization. Kept free of React and the
// Supabase singleton so it can be unit-tested with a fake client.

export interface DashboardStats {
  activeCases: number;
  clients: number;
  upcomingAppointments: number;
  pendingInvoices: number;
}

export interface DashboardAppointment {
  id: string;
  title: string;
  startTime: string;
  clientName: string;
}

export interface DashboardRecentCase {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  appointments: DashboardAppointment[];
  recentCases: DashboardRecentCase[];
  /** Sections that failed to load; the UI shows a warning instead of a silent zero. */
  failed: string[];
}

// Only these count as "upcoming"; cancelled / no-show / completed visits are excluded.
export const UPCOMING_APPOINTMENT_STATUSES = ["scheduled", "confirmed"] as const;

type Result = { data?: unknown; count?: number | null; error?: unknown };
// Minimal structural type for the parts of the Supabase query builder we use.
type Client = { from: (table: string) => any };

export async function loadDashboardData(
  client: Client,
  organizationId: string,
  now: Date = new Date(),
): Promise<DashboardData> {
  const nowIso = now.toISOString();
  const [cases, clients, appointments, invoices, recent] = (await Promise.all([
    client.from("cases").select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId).eq("status", "active"),
    client.from("clients").select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    client.from("appointments").select("id, title, start_time, clients(full_name)", { count: "exact" })
      .eq("organization_id", organizationId)
      .in("status", [...UPCOMING_APPOINTMENT_STATUSES])
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(5),
    client.from("invoices").select("amount")
      .eq("organization_id", organizationId).eq("status", "pending"),
    client.from("cases").select("id, title, status, updated_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(4),
  ])) as Result[];

  const failed: string[] = [];
  const check = (name: string, r: Result) => {
    if (r.error) failed.push(name);
    return !r.error;
  };

  const casesOk = check("cases", cases);
  const clientsOk = check("clients", clients);
  const apptOk = check("appointments", appointments);
  const invOk = check("invoices", invoices);
  const recentOk = check("recent activity", recent);

  const invoiceRows = (invOk && Array.isArray(invoices.data) ? invoices.data : []) as { amount: number | null }[];
  const apptRows = (apptOk && Array.isArray(appointments.data) ? appointments.data : []) as {
    id: string; title: string | null; start_time: string; clients?: { full_name?: string | null } | null;
  }[];
  const recentRows = (recentOk && Array.isArray(recent.data) ? recent.data : []) as {
    id: string; title: string; status: string; updated_at: string;
  }[];

  return {
    stats: {
      activeCases: casesOk ? cases.count ?? 0 : 0,
      clients: clientsOk ? clients.count ?? 0 : 0,
      upcomingAppointments: apptOk ? appointments.count ?? apptRows.length : 0,
      pendingInvoices: invoiceRows.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0),
    },
    appointments: apptRows.map((a) => ({
      id: a.id,
      title: a.title || "Appointment",
      startTime: a.start_time,
      clientName: a.clients?.full_name || "Unknown client",
    })),
    recentCases: recentRows.map((c) => ({ id: c.id, title: c.title, status: c.status, updatedAt: c.updated_at })),
    failed,
  };
}

/** "Today 2:30 PM", "Tomorrow 9:00 AM" or "Nov 4, 9:00 AM" — a bare time hid how far off a visit was. */
export function formatAppointmentWhen(startIso: string, now: Date = new Date(), locale?: string): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return "Time not set";
  const time = start.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((dayStart(start) - dayStart(now)) / 86_400_000);
  if (diffDays === 0) return `Today ${time}`;
  if (diffDays === 1) return `Tomorrow ${time}`;
  return `${start.toLocaleDateString(locale, { month: "short", day: "numeric" })}, ${time}`;
}
