import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle, ArrowRight, BarChart3, CheckCircle2, ChevronRight, Feather, FileText,
  GitBranch, ListChecks, Loader2, Send, Sparkles, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LeeAvatar } from "@/components/brand/LeeAvatar";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";

// Business Hub overview. Every number, task and document shown here is read from the firm's own
// records (cases, case_tasks, document_templates, business-hub analytics). Nothing is sample data:
// when a firm has no records yet each panel shows an empty state that points to where to add them.

export type HubTab =
  | "overview" | "practice" | "workflows" | "predictive" | "intake" | "billing" | "trust"
  | "documents" | "analytics" | "integrations" | "certifications" | "team";

interface Props {
  organizationId: string | null;
  onOpenTab: (tab: HubTab) => void;
}

interface CaseProgress { id: string; title: string; done: number; total: number; nextTask: string | null }
interface Insights { openTasks: number; overdueTasks: number; hours30: number; billable30: number; outstanding: number; overdueInvoices: number; cases: number; matters: number; clients: number }
interface DocPreview { id: string; name: string; category: string | null; content: string; updatedAt: string }

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function PanelTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="hub-panel-title">{children}</h2>
      {action}
    </div>
  );
}

function TitleLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-[44px] md:min-h-[24px] items-center gap-0.5 rounded-md px-1 text-xs font-medium hub-gold-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]">
      {children} <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

function EmptyState({ icon: Icon, children }: { icon: typeof FileText; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-600">
      <Icon className="h-6 w-6 hub-gold-icon" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Live case progress: per case, how many of its workflow tasks are done (case_tasks). */
function useCaseProgress(organizationId: string | null) {
  const [state, setState] = useState<{ loading: boolean; items: CaseProgress[]; error: string | null }>({ loading: true, items: [], error: null });
  useEffect(() => {
    if (!organizationId) { setState({ loading: false, items: [], error: null }); return; }
    let cancelled = false;
    (async () => {
      const { data: tasks, error } = await supabase
        .from("case_tasks")
        .select("case_id, status, title, due_date")
        .eq("organization_id", organizationId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(1000);
      if (cancelled) return;
      if (error) { setState({ loading: false, items: [], error: "Could not load case tasks" }); return; }
      const byCase = new Map<string, CaseProgress>();
      for (const t of tasks ?? []) {
        const row = byCase.get(t.case_id) ?? { id: t.case_id, title: "", done: 0, total: 0, nextTask: null };
        row.total += 1;
        if (t.status === "completed") row.done += 1;
        else if (!row.nextTask) row.nextTask = t.title;
        byCase.set(t.case_id, row);
      }
      const ids = [...byCase.keys()];
      if (ids.length) {
        const { data: cases } = await supabase.from("cases").select("id, title").in("id", ids.slice(0, 200));
        for (const c of cases ?? []) { const row = byCase.get(c.id); if (row) row.title = c.title; }
      }
      if (cancelled) return;
      // In-progress cases first (most open tasks), then finished ones.
      const items = [...byCase.values()]
        .map((r) => ({ ...r, title: r.title || "Untitled case" }))
        .sort((a, b) => Number(a.done === a.total) - Number(b.done === b.total) || (b.total - b.done) - (a.total - a.done))
        .slice(0, 4);
      setState({ loading: false, items, error: null });
    })();
    return () => { cancelled = true; };
  }, [organizationId]);
  return state;
}

/** Firm insights from the business-hub "analytics" action (owners/admins only). */
function useInsights(organizationId: string | null) {
  const [state, setState] = useState<{ loading: boolean; data: Insights | null; error: string | null }>({ loading: true, data: null, error: null });
  useEffect(() => {
    if (!organizationId) { setState({ loading: false, data: null, error: null }); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.functions.invoke("business-hub", { body: { action: "analytics", organizationId } });
      if (cancelled) return;
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        setState({ loading: false, data: null, error: status === 403 ? "Firm insights are visible to your firm's owners and admins." : "Could not load firm insights." });
        return;
      }
      const s = data?.success ? data.data : null;
      if (!s) { setState({ loading: false, data: null, error: "Could not load firm insights." }); return; }
      setState({
        loading: false,
        error: null,
        data: {
          openTasks: s.tasks?.open ?? 0, overdueTasks: s.tasks?.overdue ?? 0,
          hours30: s.time?.hoursLast30Days ?? 0, billable30: s.time?.billableHoursLast30Days ?? 0,
          outstanding: s.invoices?.outstandingAmount ?? 0, overdueInvoices: s.invoices?.overdueCount ?? 0,
          cases: s.cases?.total ?? 0, matters: s.matters?.total ?? 0, clients: s.clients?.total ?? 0,
        },
      });
    })();
    return () => { cancelled = true; };
  }, [organizationId]);
  return state;
}

/** Most recently updated firm document template (the Documents tab's firm library). */
function useLatestDocument(organizationId: string | null) {
  const [state, setState] = useState<{ loading: boolean; doc: DocPreview | null }>({ loading: true, doc: null });
  useEffect(() => {
    if (!organizationId) { setState({ loading: false, doc: null }); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("document_templates")
        .select("id, name, category, content, updated_at")
        .eq("organization_id", organizationId)
        .not("content", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setState({ loading: false, doc: data?.content ? { id: data.id, name: data.name, category: data.category, content: data.content, updatedAt: data.updated_at } : null });
    })();
    return () => { cancelled = true; };
  }, [organizationId]);
  return state;
}

// [BRACKETED] parts of a firm template are the fields to fill in; they get the amber highlight.
function renderTemplate(content: string) {
  return content.split(/(\[[^\]\n]{1,80}\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part)
      ? <mark key={i} className="hub-highlight text-inherit" title="Field to fill in before sending">{part}</mark>
      : <span key={i}>{part}</span>,
  );
}

// Short chip labels (as in the Gemini layout); each sends the full prompt to Lee.
const CHIPS = [
  { label: "Draft standard NDA", prompt: "Draft a standard mutual NDA" },
  { label: "Run conflict check", prompt: "Checklist for a new-client conflict check" },
  { label: "Review liability cap", prompt: "Review a limitation of liability clause" },
];

function AskLeePanel({ docForReview }: { docForReview: DocPreview | null }) {
  const { messages, isLoading, sendMessage } = useAIChat({ hubType: "lawyer" });
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const visible = messages.filter((m) => m.role !== "system");
  const responding = isLoading;

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const ask = useCallback((text: string) => {
    const q = text.trim();
    if (!q || isLoading) return;
    setInput("");
    void sendMessage(q).catch(() => undefined); // errors are already toasted by useAIChat
  }, [isLoading, sendMessage]);

  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };

  return (
    <section className="hub-panel hub-panel-featured flex flex-col p-4 sm:p-5" aria-labelledby="ask-lee-title">
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 id="ask-lee-title" className="hub-panel-title flex items-center gap-2 !text-[15px]">
          <Sparkles className="h-4 w-4 hub-gold-icon" aria-hidden="true" /> Ask Lee · AI Partner
        </h2>
        <span className={cn("flex items-center gap-1.5 text-xs font-semibold", responding ? "text-amber-700" : "text-emerald-700")} aria-live="polite">
          <span className={cn("h-2 w-2 rounded-full", responding ? "bg-amber-500" : "bg-emerald-500")} aria-hidden="true" />
          {responding ? "Thinking…" : "Online"}
        </span>
      </div>

      <div className="flex justify-center py-3">
        <LeeAvatar heightClass="h-24 xl:h-[140px]" alt="Lee, the LegallyAI assistant" />
      </div>
      <div className="lee-wave mb-3" data-active={responding ? "true" : "false"} aria-hidden="true">
        {[0, 0.1, 0.2, 0.3, 0.4].map((d) => <span key={d} style={{ animationDelay: `${d}s` }} />)}
      </div>

      {visible.length === 0 ? (
        <p className="mb-4 text-center text-[13px] leading-5 text-slate-600">"Hi, I'm Lee. Let's inspect, analyze, or draft case material."</p>
      ) : (
        <div ref={logRef} className="mb-3 max-h-72 space-y-2 overflow-y-auto pr-1" role="log" aria-live="polite" aria-label="Conversation with Lee">
          {visible.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-[22px]",
                m.role === "user" ? "ml-auto bg-[#0F1E3D] text-white" : "border border-slate-200 bg-white text-slate-700",
              )}
            >
              {m.content || <Loader2 className="h-4 w-4 animate-spin text-[#B8932E]" aria-label="Lee is responding" />}
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button key={c.label} type="button" className="hub-chip" title={c.prompt} disabled={isLoading} onClick={() => ask(c.prompt)}>{c.label}</button>
        ))}
        {docForReview && (
          <button
            type="button"
            className="hub-chip max-w-full truncate"
            title={`Review "${docForReview.name}"`}
            disabled={isLoading}
            onClick={() => ask(`Review this firm template "${docForReview.name}" and flag risky or missing terms:\n\n${docForReview.content.slice(0, 4000)}`)}
          >
            Review "{docForReview.name}"
          </button>
        )}
      </div>

      <form onSubmit={submit} className="hub-chat-input">
        <label htmlFor="hub-lee-input" className="sr-only">Message Lee</label>
        <input
          id="hub-lee-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or instruction..."
          className="min-w-0 flex-1 self-stretch bg-transparent text-[13px] text-[#0F1E3D] placeholder:text-slate-500 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={isLoading || !input.trim()}
          className="inline-flex h-11 w-11 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full text-[#B8932E] hover:bg-[rgba(212,175,55,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
      <p className="mt-2 text-[11px] leading-4 text-slate-600">Lee provides legal information to support your work; attorneys remain responsible for advice given to clients.</p>
    </section>
  );
}

export function FirmHubOverview({ organizationId, onOpenTab }: Props) {
  const progress = useCaseProgress(organizationId);
  const insights = useInsights(organizationId);
  const latestDoc = useLatestDocument(organizationId);

  const workflows = useMemo(() => [
    { icon: Feather, title: "AI Document Drafting", desc: "First drafts and firm templates with fields to fill", tab: "documents" as const },
    { icon: Users, title: "Smart Client Intake", desc: "AI-assisted intake that turns answers into a client record", tab: "intake" as const },
    { icon: GitBranch, title: "Case Workflows", desc: "Stages, tasks and timelines for each case", tab: "workflows" as const },
  ], []);

  const ins = insights.data;
  const insightsEmpty = ins && !ins.cases && !ins.matters && !ins.clients && !ins.openTasks && !ins.hours30 && !ins.outstanding;

  return (
    <div className="hub-dash flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:items-start xl:gap-6">
      {/* Left column (desktop). On small screens the wrappers dissolve so cards follow the mobile order. */}
      <div className="contents xl:flex xl:flex-col xl:gap-6">
        <section className="hub-panel order-2 p-4 sm:p-5 xl:order-none" aria-labelledby="live-title">
          <PanelTitle action={<TitleLink onClick={() => onOpenTab("workflows")}>All case tasks</TitleLink>}>
            <span id="live-title">Live Case Progress</span>
          </PanelTitle>
          {progress.loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#B8932E]" /></div>
          ) : progress.error ? (
            <EmptyState icon={AlertCircle}>{progress.error}</EmptyState>
          ) : progress.items.length === 0 ? (
            <EmptyState icon={ListChecks}>
              No case tasks yet. Add a case in Practice, then give it tasks in Workflows to track progress here.
              <button type="button" onClick={() => onOpenTab("workflows")} className="mt-1 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium hub-gold-text hover:underline">Open Workflows <ArrowRight className="h-4 w-4" /></button>
            </EmptyState>
          ) : (
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {progress.items.map((c) => {
                const pct = Math.round((c.done / c.total) * 100);
                const complete = c.done === c.total;
                return (
                  <div key={c.id} className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-start justify-between gap-2 text-sm font-semibold leading-5">
                      <h3 className="min-w-0 break-words text-sm font-semibold leading-5 text-[#0F1E3D]">{c.title}</h3>
                      {complete ? (
                        <span className="flex shrink-0 items-center gap-1 text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Completed</span>
                      ) : (
                        <span className="shrink-0 font-bold tabular-nums hub-gold-text">{pct}% Complete</span>
                      )}
                    </div>
                    <div className="hub-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${c.title} tasks complete`}>
                      <span className={complete ? "hub-progress-done" : "hub-progress-gold"} style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                    <p className="text-[11px] leading-4 text-slate-600">
                      {c.done} of {c.total} task{c.total === 1 ? "" : "s"} done
                      {c.nextTask && !complete && <> · Next: <span className="text-slate-800">{c.nextTask}</span></>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="hub-panel order-3 p-4 sm:p-5 xl:order-none" aria-labelledby="workflows-title">
          <PanelTitle><span id="workflows-title">AI Workflows</span></PanelTitle>
          <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {workflows.map((w) => (
              <button key={w.title} type="button" className="hub-workflow min-w-[200px] snap-start sm:min-w-0" onClick={() => onOpenTab(w.tab)}>
                <w.icon className="hub-workflow-icon" strokeWidth={2.25} aria-hidden="true" />
                <span className="hub-workflow-title">{w.title}</span>
                <span className="hub-workflow-desc">{w.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="hub-panel order-5 p-4 sm:p-5 xl:order-none" aria-labelledby="insights-title">
          <PanelTitle action={ins && !insightsEmpty ? <TitleLink onClick={() => onOpenTab("analytics")}>Full analytics</TitleLink> : undefined}>
            <span id="insights-title">Firm Insights &amp; Metrics</span>
          </PanelTitle>
          {insights.loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#B8932E]" /></div>
          ) : !organizationId || insightsEmpty ? (
            <EmptyState icon={BarChart3}>No matters yet. Connect your case data to see insights.</EmptyState>
          ) : insights.error || !ins ? (
            <EmptyState icon={AlertCircle}>{insights.error ?? "Could not load firm insights."}</EmptyState>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Open tasks", value: String(ins.openTasks), sub: `${ins.overdueTasks} past due` },
                { label: "Hours logged (last 30 days)", value: `${ins.hours30.toFixed(1)} hrs`, sub: `${ins.billable30.toFixed(1)} billable` },
                { label: "Outstanding invoices", value: money(ins.outstanding), sub: `${ins.overdueInvoices} overdue` },
              ].map((m) => (
                <div key={m.label} className="flex flex-col gap-2">
                  <dt className="text-xs leading-4 text-slate-600">{m.label}</dt>
                  <dd className="flex flex-col gap-0.5">
                    <span className="hub-metric">{m.value}</span>
                    <span className="text-[11px] leading-4 text-slate-600">{m.sub}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      {/* Right column (desktop). */}
      <div className="contents xl:flex xl:flex-col xl:gap-6">
        <section className="hub-panel order-4 p-4 sm:p-5 xl:order-none" aria-labelledby="doc-title">
          <PanelTitle>
            <span id="doc-title">Document Workspace Preview</span>
          </PanelTitle>
          {latestDoc.loading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-[#B8932E]" /></div>
          ) : !latestDoc.doc ? (
            <EmptyState icon={FileText}>
              No firm documents yet. Save a template in Documents and its latest version shows here.
              <button type="button" onClick={() => onOpenTab("documents")} className="mt-1 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium hub-gold-text hover:underline">Open Documents <ArrowRight className="h-4 w-4" /></button>
            </EmptyState>
          ) : (
            <>
              <div className="hub-paper h-[250px] overflow-y-auto" tabIndex={0} aria-label={`Preview of ${latestDoc.doc.name}`}>
                <div className="hub-paper-tag">
                  {latestDoc.doc.category ? `${latestDoc.doc.category} · ` : ""}{latestDoc.doc.name}
                </div>
                <div className="whitespace-pre-wrap">{renderTemplate(latestDoc.doc.content.slice(0, 6000))}</div>
              </div>
              <p className="mt-3 text-[11px] leading-4 text-slate-600">
                Updated {new Date(latestDoc.doc.updatedAt).toLocaleDateString()} · <mark className="hub-highlight text-inherit">[highlighted]</mark> parts are fields to fill in. Use "Review" in Ask Lee for suggestions.
              </p>
              <div className="-ml-1 mt-1"><TitleLink onClick={() => onOpenTab("documents")}>Open in Documents</TitleLink></div>
            </>
          )}
        </section>

        <div className="order-1 xl:order-none">
          <AskLeePanel docForReview={latestDoc.doc} />
        </div>
      </div>
    </div>
  );
}
