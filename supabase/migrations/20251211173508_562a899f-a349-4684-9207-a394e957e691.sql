-- Predictive AI Tables
CREATE TABLE public.case_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  prediction_type TEXT NOT NULL, -- 'outcome', 'settlement', 'duration', 'risk'
  confidence_score NUMERIC(5,2) NOT NULL,
  predicted_value JSONB NOT NULL, -- {win_probability: 0.75, settlement_range: [10000, 50000]}
  factors JSONB, -- [{factor: 'judge_history', weight: 0.3, impact: 'positive'}]
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.prediction_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  model_type TEXT NOT NULL, -- 'case_outcome', 'settlement', 'billing', 'risk'
  model_data JSONB NOT NULL,
  training_metrics JSONB,
  accuracy_score NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case Workflow Tables
CREATE TABLE public.case_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  color TEXT,
  auto_tasks JSONB, -- [{task: 'File motion', deadline_offset_days: 5}]
  court_rules_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage_id UUID REFERENCES public.case_stages(id),
  assigned_to UUID REFERENCES public.profiles(id),
  due_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  is_auto_generated BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.case_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.conflict_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  checked_party TEXT NOT NULL,
  conflict_found BOOLEAN DEFAULT false,
  related_cases JSONB,
  checked_by UUID REFERENCES public.profiles(id),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced Billing Tables
CREATE TABLE public.billing_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  client_id UUID REFERENCES public.clients(id),
  matter_id UUID REFERENCES public.matters(id),
  rate_type TEXT NOT NULL, -- 'hourly', 'flat', 'contingency'
  rate_amount NUMERIC(10,2) NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  predicted_payment_date DATE,
  predicted_amount NUMERIC(10,2),
  confidence_score NUMERIC(5,2),
  risk_factors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.unbilled_time_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  billing_entry_id UUID REFERENCES public.billing_entries(id),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  amount_at_risk NUMERIC(10,2),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics Tables
CREATE TABLE public.analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- {widgets: [{type: 'chart', data_source: 'revenue'}]}
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- {revenue: 50000, utilization: 0.75, matters_active: 45}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.firm_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score NUMERIC(5,2),
  action_items JSONB,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Integration Hub Tables
CREATE TABLE public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  integration_name TEXT NOT NULL, -- 'quickbooks', 'docusign', 'outlook'
  integration_type TEXT NOT NULL, -- 'accounting', 'document', 'calendar', 'communication'
  api_endpoint TEXT,
  credentials_encrypted TEXT,
  settings JSONB,
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integration_configs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[], -- ['case.created', 'invoice.paid']
  secret_hash TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Academy Certification Tables
CREATE TABLE public.micro_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  required_courses TEXT[], -- course IDs
  required_quizzes TEXT[], -- quiz IDs
  passing_score INTEGER DEFAULT 80,
  badge_image_url TEXT,
  prediction_boost NUMERIC(5,2) DEFAULT 0, -- e.g., +10% win forecast
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  certification_id UUID REFERENCES public.micro_certifications(id) NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  certificate_url TEXT,
  score NUMERIC(5,2),
  verification_code TEXT UNIQUE
);

CREATE TABLE public.enrollment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  certification_id UUID REFERENCES public.micro_certifications(id) NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'enrolled',
  completed_courses TEXT[],
  completed_quizzes TEXT[]
);

-- Enable RLS
ALTER TABLE public.case_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conflict_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unbilled_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Org members can view predictions" ON public.case_predictions FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Org members can manage predictions" ON public.case_predictions FOR ALL USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can view models" ON public.prediction_models FOR SELECT USING (organization_id IS NULL OR is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can manage models" ON public.prediction_models FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Org members can view stages" ON public.case_stages FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can manage stages" ON public.case_stages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Org members can view tasks" ON public.case_tasks FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Org members can manage tasks" ON public.case_tasks FOR ALL USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can view timelines" ON public.case_timelines FOR SELECT USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_timelines.case_id AND is_org_member(auth.uid(), c.organization_id)));
CREATE POLICY "Org members can manage timelines" ON public.case_timelines FOR ALL USING (EXISTS (SELECT 1 FROM cases c WHERE c.id = case_timelines.case_id AND is_org_member(auth.uid(), c.organization_id)));

CREATE POLICY "Org members can view conflicts" ON public.conflict_checks FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Org members can manage conflicts" ON public.conflict_checks FOR ALL USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can view rates" ON public.billing_rates FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can manage rates" ON public.billing_rates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Org members can view payment predictions" ON public.payment_predictions FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "System can manage payment predictions" ON public.payment_predictions FOR ALL USING (true);

CREATE POLICY "Users can view own alerts" ON public.unbilled_time_alerts FOR SELECT USING (user_id = auth.uid() OR is_org_member(auth.uid(), organization_id));
CREATE POLICY "System can manage alerts" ON public.unbilled_time_alerts FOR ALL USING (true);

CREATE POLICY "Org members can view dashboards" ON public.analytics_dashboards FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "Admins can manage dashboards" ON public.analytics_dashboards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Org members can view snapshots" ON public.analytics_snapshots FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "System can manage snapshots" ON public.analytics_snapshots FOR ALL USING (true);

CREATE POLICY "Org members can view insights" ON public.firm_insights FOR SELECT USING (is_org_member(auth.uid(), organization_id));
CREATE POLICY "System can manage insights" ON public.firm_insights FOR ALL USING (true);

CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage badges" ON public.user_badges FOR INSERT WITH CHECK (true);

CREATE POLICY "Org admins can view integrations" ON public.integration_configs FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));
CREATE POLICY "Org admins can manage integrations" ON public.integration_configs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Org admins can view integration logs" ON public.integration_logs FOR SELECT USING (EXISTS (SELECT 1 FROM integration_configs ic WHERE ic.id = integration_logs.integration_id AND (has_role(auth.uid(), 'admin'::app_role, ic.organization_id) OR has_role(auth.uid(), 'owner'::app_role, ic.organization_id))));

CREATE POLICY "Org admins can manage webhooks" ON public.webhook_endpoints FOR ALL USING (has_role(auth.uid(), 'admin'::app_role, organization_id) OR has_role(auth.uid(), 'owner'::app_role, organization_id));

CREATE POLICY "Anyone can view certifications" ON public.micro_certifications FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage certifications" ON public.micro_certifications FOR ALL USING (true);

CREATE POLICY "Users can view own certs" ON public.user_certifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can manage user certs" ON public.user_certifications FOR ALL USING (true);

CREATE POLICY "Users can view own enrollment" ON public.enrollment_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own enrollment" ON public.enrollment_records FOR ALL USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_case_predictions_case ON public.case_predictions(case_id);
CREATE INDEX idx_case_tasks_case ON public.case_tasks(case_id);
CREATE INDEX idx_case_tasks_assigned ON public.case_tasks(assigned_to);
CREATE INDEX idx_case_timelines_case ON public.case_timelines(case_id);
CREATE INDEX idx_analytics_snapshots_org_date ON public.analytics_snapshots(organization_id, snapshot_date);
CREATE INDEX idx_user_certifications_user ON public.user_certifications(user_id);
CREATE INDEX idx_enrollment_user ON public.enrollment_records(user_id);