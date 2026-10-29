import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getAnthropicKey } from "../_shared/anthropic-key.ts";
import { consumePaidAIQuota, hasPaidAIQuota, paidAIQuotaResult } from "../_shared/paid-ai-access.ts";

class DailyAILimitError extends Error {
  constructor(readonly used: number, readonly limit: number) {
    super(`You've used today's ${limit} free AI requests. Upgrade for unlimited AI, or try again tomorrow.`);
  }
}
import { hasOrgAccess } from "../_shared/org-access.ts";
import { getOrganizationSeats, type OrganizationSeats } from "../_shared/organization-seats.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: string;
  organizationId?: string;
  matterId?: string;
  templateId?: string;
  variables?: Record<string, string>;
  intakeData?: Record<string, any>;
  billingData?: Record<string, any>;
}

interface ComplianceLog {
  severity: string;
  compliance_framework: string;
}

interface BillingEntry {
  amount: number;
  billable: boolean;
  billed: boolean;
  entry_type: string;
}

interface TrustAccount {
  current_balance: number;
}

async function callAnthropic(messages: { role: string; content: string }[], maxTokens = 2048): Promise<string | null> {
  const apiKey = getAnthropicKey();
  if (!apiKey) return null;
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const convo = messages.filter((m) => m.role !== "system");
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: convo,
      }),
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    return json.content?.find((b: { type?: string }) => b.type === "text")?.text ?? null;
  } catch (e) {
    console.error("Anthropic request failed:", e);
    return null;
  }
}

async function callAI(prompt: string, userId: string, authorization: string): Promise<string> {
  const quotaOptions = {
    userId,
    authorization,
    supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
    serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    anonKey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    reason: "business_hub",
  };
  if (!await hasPaidAIQuota(quotaOptions)) {
    const quota = paidAIQuotaResult(quotaOptions);
    if (quota?.status === "quota_exceeded") throw new DailyAILimitError(quota.used, quota.limit);
    throw new Error("Paid AI is unavailable or your AI credits are exhausted");
  }

  const content = await callAnthropic([{ role: 'user', content: prompt }]);
  if (!content) throw new Error("AI services are temporarily unavailable");
  if (!await consumePaidAIQuota(quotaOptions)) {
    throw new Error("Paid AI access changed before the analysis completed");
  }
  return content;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { action, organizationId, matterId, templateId, variables, intakeData, billingData } = body;

    console.log(`Business Hub action: ${action} by user ${user.id}`);

    // The service-role client bypasses RLS: firm-scoped actions require membership in that firm.
    // Billing, trust and compliance data are restricted to the firm's owners/admins.
    if (action !== 'document-assembly') {
      const level = action === 'ai-intake' || action === 'team' ? 'member' : 'admin';
      if (!await hasOrgAccess(supabase, user.id, organizationId, level)) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let result: any;

    switch (action) {
      case 'ai-intake':
        result = await processAIIntake(supabase, user.id, authHeader, organizationId!, intakeData!);
        break;

      case 'document-assembly':
        result = await assembleDocument(supabase, user.id, authHeader, templateId!, variables!);
        break;

      case 'billing-automation':
        result = await processBilling(supabase, organizationId!, matterId!, billingData!);
        break;

      case 'trust-reconciliation':
        result = await reconcileTrust(supabase, organizationId!);
        break;

      case 'compliance-report':
        result = await generateComplianceReport(supabase, organizationId!);
        break;

      case 'analytics':
        result = await getPracticeAnalytics(supabase, organizationId!);
        break;

      case 'team':
        result = await getTeam(supabase, user.id, organizationId!);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    await supabase.from('compliance_logs').insert({
      organization_id: organizationId,
      user_id: user.id,
      action: action,
      resource_type: 'business_hub',
      compliance_framework: 'general',
      severity: 'info'
    });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    if (error instanceof DailyAILimitError) {
      return new Response(
        JSON.stringify({ error: 'daily_ai_limit_reached', message: error.message, used: error.used, limit: error.limit }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    console.error('Business Hub error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processAIIntake(supabase: any, userId: string, authorization: string, organizationId: string, intakeData: Record<string, any>) {
  console.log('Processing AI intake for organization:', organizationId);
  
  const prompt = `Analyze this legal intake form and extract key information for case management:
  
  Client Name: ${intakeData.clientName}
  Contact: ${intakeData.email}, ${intakeData.phone}
  Legal Issue: ${intakeData.legalIssue}
  Description: ${intakeData.description}
  Urgency: ${intakeData.urgency}
  
  Provide a structured JSON response with:
  - suggested_practice_area
  - case_complexity (low/medium/high)
  - recommended_actions (array)
  - risk_assessment
  - estimated_timeline
  - potential_conflicts_to_check`;

  const analysis = await callAI(prompt, userId, authorization);
  
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      organization_id: organizationId,
      full_name: intakeData.clientName,
      email: intakeData.email,
      phone: intakeData.phone,
      notes: intakeData.description
    })
    .select()
    .single();

  if (clientError) throw clientError;

  const matterNumber = `M-${Date.now().toString(36).toUpperCase()}`;

  const { data: matter, error: matterError } = await supabase
    .from('matters')
    .insert({
      organization_id: organizationId,
      client_id: client.id,
      matter_number: matterNumber,
      name: `${intakeData.clientName} - ${intakeData.legalIssue}`,
      description: intakeData.description,
      practice_area: intakeData.practiceArea || 'General',
      status: 'pending'
    })
    .select()
    .single();

  if (matterError) throw matterError;

  return {
    client,
    matter,
    aiAnalysis: analysis
  };
}

async function assembleDocument(supabase: any, userId: string, authorization: string, templateId: string, variables: Record<string, string>) {
  console.log('Assembling document from template:', templateId);
  
  const { data: template, error } = await supabase
    .from('document_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;

  // Private firm templates are only usable by that firm's members (service role bypasses RLS).
  const templateAllowed = template.is_public === true || template.created_by === userId ||
    (template.organization_id && await hasOrgAccess(supabase, userId, template.organization_id, 'member'));
  if (!templateAllowed) throw new Error('Template not found');

  let assembledContent = template.content || '';
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    assembledContent = assembledContent.replace(regex, value);
  }

  const enhancePrompt = `Review and enhance this legal document for clarity and completeness. Keep the core content but improve language and ensure legal precision:

${assembledContent}

Return the enhanced document maintaining all original intent and legal requirements.`;

  const enhancedContent = await callAI(enhancePrompt, userId, authorization);

  await supabase
    .from('document_templates')
    .update({ usage_count: (template.usage_count || 0) + 1 })
    .eq('id', templateId);

  return {
    templateName: template.name,
    originalContent: assembledContent,
    enhancedContent,
    variables: template.variables
  };
}

async function processBilling(supabase: any, organizationId: string, matterId: string, billingData: Record<string, any>) {
  console.log('Processing billing for matter:', matterId);

  const { data: matter } = await supabase
    .from('matters')
    .select('*, client:clients(*)')
    .eq('id', matterId)
    .single();

  if (!matter) throw new Error('Matter not found');

  let amount = 0;
  if (billingData.type === 'time') {
    amount = (billingData.hours || 0) * (matter.hourly_rate || billingData.rate || 0);
  } else if (billingData.type === 'expense') {
    amount = billingData.amount || 0;
  } else if (billingData.type === 'flat_fee') {
    amount = matter.flat_fee_amount || billingData.amount || 0;
  }

  const { data: entry, error } = await supabase
    .from('billing_entries')
    .insert({
      organization_id: organizationId,
      matter_id: matterId,
      user_id: billingData.userId,
      entry_type: billingData.type,
      description: billingData.description,
      quantity: billingData.hours || 1,
      rate: matter.hourly_rate || billingData.rate || 0,
      amount,
      billable: billingData.billable !== false,
      activity_code: billingData.activityCode,
      expense_code: billingData.expenseCode,
      entry_date: billingData.date || new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (error) throw error;

  return {
    entry,
    matter: matter.name,
    client: matter.client?.full_name,
    totalAmount: amount
  };
}

async function reconcileTrust(supabase: any, organizationId: string) {
  console.log('Reconciling trust accounts for organization:', organizationId);

  const { data: accounts } = await supabase
    .from('trust_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  const reconciliationResults = [];

  for (const account of accounts || []) {
    const { data: transactions } = await supabase
      .from('trust_transactions')
      .select('*')
      .eq('trust_account_id', account.id)
      .eq('reconciled', false)
      .order('transaction_date', { ascending: true });

    let expectedBalance = account.reconciled_balance || 0;
    for (const tx of transactions || []) {
      if (['deposit', 'interest'].includes(tx.transaction_type)) {
        expectedBalance += Number(tx.amount);
      } else {
        expectedBalance -= Number(tx.amount);
      }
    }

    const discrepancy = Number(account.current_balance) - expectedBalance;

    reconciliationResults.push({
      accountId: account.id,
      accountName: account.account_name,
      currentBalance: account.current_balance,
      expectedBalance,
      discrepancy,
      unreconciledCount: transactions?.length || 0,
      status: Math.abs(discrepancy) < 0.01 ? 'balanced' : 'discrepancy'
    });
  }

  return {
    accounts: reconciliationResults,
    totalDiscrepancy: reconciliationResults.reduce((sum: number, r: any) => sum + Math.abs(r.discrepancy), 0),
    reconciliationDate: new Date().toISOString()
  };
}

async function generateComplianceReport(supabase: any, organizationId: string) {
  console.log('Generating compliance report for organization:', organizationId);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: logs } = await supabase
    .from('compliance_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const typedLogs: ComplianceLog[] = logs || [];

  const byFramework: Record<string, ComplianceLog[]> = {
    soc2: [],
    hipaa: [],
    gdpr: [],
    ccpa: [],
    general: []
  };

  for (const log of typedLogs) {
    const framework = log.compliance_framework || 'general';
    if (byFramework[framework]) {
      byFramework[framework].push(log);
    }
  }

  const bySeverity = {
    info: typedLogs.filter((l: ComplianceLog) => l.severity === 'info').length,
    warning: typedLogs.filter((l: ComplianceLog) => l.severity === 'warning').length,
    critical: typedLogs.filter((l: ComplianceLog) => l.severity === 'critical').length
  };

  return {
    period: {
      start: thirtyDaysAgo.toISOString(),
      end: new Date().toISOString()
    },
    totalEvents: typedLogs.length,
    byFramework: {
      soc2: byFramework.soc2.length,
      hipaa: byFramework.hipaa.length,
      gdpr: byFramework.gdpr.length,
      ccpa: byFramework.ccpa.length,
      general: byFramework.general.length
    },
    bySeverity,
    complianceScore: calculateComplianceScore(bySeverity),
    recentCriticalEvents: typedLogs
      .filter((l: ComplianceLog) => l.severity === 'critical')
      .slice(0, 5)
  };
}

function calculateComplianceScore(bySeverity: { info: number; warning: number; critical: number }): number {
  const totalEvents = bySeverity.info + bySeverity.warning + bySeverity.critical;
  if (totalEvents === 0) return 100;
  
  const weightedScore = (bySeverity.info * 0) + (bySeverity.warning * 10) + (bySeverity.critical * 50);
  const maxPenalty = totalEvents * 50;
  
  return Math.max(0, Math.round(100 - (weightedScore / maxPenalty * 100)));
}

async function getPracticeAnalytics(supabase: any, organizationId: string) {
  console.log('Getting practice analytics for organization:', organizationId);

  const { data: matters } = await supabase
    .from('matters')
    .select('status, practice_area, billing_type')
    .eq('organization_id', organizationId);

  const { data: billingEntries } = await supabase
    .from('billing_entries')
    .select('amount, billable, billed, entry_type')
    .eq('organization_id', organizationId);

  const { data: trustAccounts } = await supabase
    .from('trust_accounts')
    .select('current_balance')
    .eq('organization_id', organizationId);

  const typedBillingEntries: BillingEntry[] = billingEntries || [];
  const typedTrustAccounts: TrustAccount[] = trustAccounts || [];

  const mattersByStatus: Record<string, number> = {};
  const mattersByPracticeArea: Record<string, number> = {};
  
  for (const matter of matters || []) {
    mattersByStatus[matter.status] = (mattersByStatus[matter.status] || 0) + 1;
    if (matter.practice_area) {
      mattersByPracticeArea[matter.practice_area] = (mattersByPracticeArea[matter.practice_area] || 0) + 1;
    }
  }

  const totalBilled = typedBillingEntries
    .filter((e: BillingEntry) => e.billed)
    .reduce((sum: number, e: BillingEntry) => sum + Number(e.amount), 0);

  const totalUnbilled = typedBillingEntries
    .filter((e: BillingEntry) => !e.billed && e.billable)
    .reduce((sum: number, e: BillingEntry) => sum + Number(e.amount), 0);

  const totalTrustBalance = typedTrustAccounts
    .reduce((sum: number, a: TrustAccount) => sum + Number(a.current_balance), 0);

  // Live firm activity: every figure below is a count/sum of this organization's own rows.
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [clientsRes, casesRes, invoicesRes, timeRes, tasksRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('cases').select('status').eq('organization_id', organizationId).limit(5000),
    supabase.from('invoices').select('amount, status, paid_at, due_date').eq('organization_id', organizationId).limit(5000),
    supabase.from('time_entries').select('clock_in, clock_out, billable, hourly_rate')
      .eq('organization_id', organizationId).gte('clock_in', since30).not('clock_out', 'is', null).limit(5000),
    supabase.from('case_tasks').select('status, due_date').eq('organization_id', organizationId).neq('status', 'completed').limit(5000),
  ]);
  const casesByStatus: Record<string, number> = {};
  for (const c of casesRes.data || []) casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
  const invoiceRows: { amount: number; status: string | null; paid_at: string | null; due_date: string | null }[] = invoicesRes.data || [];
  const today = new Date(new Date().toISOString().slice(0, 10));
  const outstandingInvoices = invoiceRows.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const hours = (t: { clock_in: string; clock_out: string }) =>
    Math.max(0, (new Date(t.clock_out).getTime() - new Date(t.clock_in).getTime()) / 3_600_000);
  const timeRows: { clock_in: string; clock_out: string; billable: boolean | null; hourly_rate: number | null }[] = timeRes.data || [];
  const openTasks: { status: string; due_date: string | null }[] = tasksRes.data || [];

  return {
    clients: { total: clientsRes.count ?? 0 },
    cases: { total: (casesRes.data || []).length, byStatus: casesByStatus },
    invoices: {
      total: invoiceRows.length,
      outstandingAmount: outstandingInvoices.reduce((s, i) => s + Number(i.amount || 0), 0),
      overdueCount: outstandingInvoices.filter((i) => i.status === 'overdue' || (i.due_date && new Date(i.due_date) < today)).length,
      paidAmount: invoiceRows.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0),
    },
    time: {
      hoursLast30Days: Math.round(timeRows.reduce((s, t) => s + hours(t), 0) * 10) / 10,
      billableHoursLast30Days: Math.round(timeRows.filter((t) => t.billable).reduce((s, t) => s + hours(t), 0) * 10) / 10,
      billableValueLast30Days: Math.round(timeRows.filter((t) => t.billable).reduce((s, t) => s + hours(t) * Number(t.hourly_rate || 0), 0) * 100) / 100,
    },
    tasks: {
      open: openTasks.length,
      overdue: openTasks.filter((t) => t.due_date && new Date(t.due_date) < today).length,
    },
    matters: {
      total: matters?.length || 0,
      byStatus: mattersByStatus,
      byPracticeArea: mattersByPracticeArea
    },
    billing: {
      totalBilled,
      totalUnbilled,
      realizationRate: totalBilled > 0 ? Math.round((totalBilled / (totalBilled + totalUnbilled)) * 100) : 0
    },
    trust: {
      totalBalance: totalTrustBalance,
      accountCount: typedTrustAccounts.length
    }
  };
}

// Firm roster for the Business Hub Team tab. Caller must be a member (checked before dispatch).
// Colleague emails and pending invites are returned only to the firm's owners/admins.
async function getTeam(supabase: any, userId: string, organizationId: string) {
  const [orgRes, membersRes, rolesRes] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', organizationId).maybeSingle(),
    supabase.from('organization_members').select('user_id, job_title, department, is_active, created_at')
      .eq('organization_id', organizationId).limit(500),
    supabase.from('user_roles').select('user_id, role').eq('organization_id', organizationId).limit(1000),
  ]);
  if (orgRes.error || membersRes.error || rolesRes.error) throw new Error('Could not load team');
  const ownerId: string | null = orgRes.data?.owner_id ?? null;
  const members: { user_id: string; job_title: string | null; department: string | null; is_active: boolean | null; created_at: string }[] = membersRes.data || [];
  const roles: { user_id: string; role: string }[] = rolesRes.data || [];
  const isAdmin = ownerId === userId || roles.some((r) => r.user_id === userId && (r.role === 'owner' || r.role === 'admin'));

  const ids = [...new Set([ownerId, ...members.map((m) => m.user_id), ...roles.map((r) => r.user_id)].filter(Boolean))] as string[];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, full_name, display_name, email').in('id', ids)
    : { data: [] };
  const profileById = new Map((profiles || []).map((p: any) => [p.id, p]));

  const roster = ids.map((id) => {
    const member = members.find((m) => m.user_id === id);
    const profile: any = profileById.get(id);
    const memberRoles = roles.filter((r) => r.user_id === id).map((r) => r.role);
    if (id === ownerId && !memberRoles.includes('owner')) memberRoles.unshift('owner');
    return {
      user_id: id,
      name: profile?.full_name || profile?.display_name || null,
      email: isAdmin || id === userId ? profile?.email ?? null : null,
      roles: memberRoles,
      job_title: member?.job_title ?? null,
      department: member?.department ?? null,
      is_active: id === ownerId ? true : member ? member.is_active !== false : true,
      joined_at: member?.created_at ?? null,
      is_you: id === userId,
    };
  });

  let invites: unknown[] = [];
  if (isAdmin) {
    const { data, error } = await supabase
      .from('organization_invites')
      .select('id, email, role, expires_at, created_at')
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) invites = data || [];
  }

  // Seat usage for owners/admins (plan name + limit come from the owner's plan; null limit = no seat plan).
  let seats: OrganizationSeats | null = null;
  if (isAdmin) {
    try { seats = await getOrganizationSeats(supabase, organizationId); } catch { seats = null; }
  }

  return { members: roster, invites, canManage: isAdmin, seats };
}
