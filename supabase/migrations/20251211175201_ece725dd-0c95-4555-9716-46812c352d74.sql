
-- DUI Hub tables
CREATE TABLE public.dui_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  case_number TEXT,
  arrest_date DATE,
  bac_level NUMERIC,
  breathalyzer_data JSONB DEFAULT '{}',
  state TEXT DEFAULT 'CA',
  county TEXT,
  court_name TEXT,
  status TEXT DEFAULT 'active',
  plea_type TEXT,
  outcome TEXT,
  predicted_outcome JSONB,
  prediction_confidence NUMERIC,
  timeline JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.dui_hearing_sims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.dui_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sim_type TEXT DEFAULT 'voice',
  transcript JSONB DEFAULT '[]',
  outcome_prediction JSONB,
  feedback TEXT,
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Will/Estate Hub tables
CREATE TABLE public.will_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  testator_name TEXT NOT NULL,
  testator_state TEXT DEFAULT 'CA',
  assets JSONB DEFAULT '[]',
  beneficiaries JSONB DEFAULT '[]',
  family_tree JSONB DEFAULT '{}',
  trust_type TEXT,
  tax_implications JSONB,
  multi_state_compliance JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.will_clause_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  clause_name TEXT NOT NULL,
  clause_text TEXT NOT NULL,
  state_specific TEXT[],
  is_public BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.inheritance_sims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  will_id UUID REFERENCES public.will_cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  scenario_name TEXT,
  scenario_params JSONB,
  results JSONB,
  tax_impact JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Parole/Probation tables
CREATE TABLE public.parole_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  offender_name TEXT NOT NULL,
  case_number TEXT,
  offense_type TEXT,
  start_date DATE,
  end_date DATE,
  supervision_level TEXT DEFAULT 'standard',
  officer_name TEXT,
  conditions JSONB DEFAULT '[]',
  check_ins JSONB DEFAULT '[]',
  violations JSONB DEFAULT '[]',
  compliance_score NUMERIC DEFAULT 100,
  recidivism_risk NUMERIC,
  rehab_plan JSONB,
  geo_restrictions JSONB,
  linked_dui_case UUID REFERENCES public.dui_cases(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.rehab_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parole_case_id UUID REFERENCES public.parole_cases(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'individual',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  progress_score NUMERIC,
  gamification_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Persistent Chat Storage
CREATE TABLE public.ai_chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hub_type TEXT NOT NULL,
  session_id UUID NOT NULL,
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  searchable_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_chat_history_user ON public.ai_chat_history(user_id);
CREATE INDEX idx_chat_history_hub ON public.ai_chat_history(hub_type);
CREATE INDEX idx_chat_history_search ON public.ai_chat_history USING gin(to_tsvector('english', searchable_text));

-- Enhanced Custody tables
CREATE TABLE public.custody_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  case_number TEXT,
  parent1_name TEXT,
  parent2_name TEXT,
  children JSONB DEFAULT '[]',
  state TEXT DEFAULT 'CA',
  custody_type TEXT,
  parenting_plan JSONB,
  support_calculation JSONB,
  conflict_level TEXT DEFAULT 'low',
  risk_score NUMERIC,
  shared_calendar JSONB DEFAULT '[]',
  expenses JSONB DEFAULT '[]',
  violations JSONB DEFAULT '[]',
  communications JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  linked_dui_case UUID REFERENCES public.dui_cases(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.custody_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custody_case_id UUID REFERENCES public.custody_cases(id) ON DELETE CASCADE,
  payer_id UUID,
  amount NUMERIC NOT NULL,
  due_date DATE,
  paid_date DATE,
  status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  arrears NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.custody_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custody_case_id UUID REFERENCES public.custody_cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  geo_coords JSONB,
  parent_id UUID,
  synced_outlook BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Revenue share tracking
CREATE TABLE public.revenue_share_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead matching for DUI
CREATE TABLE public.dui_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT,
  email TEXT,
  phone TEXT,
  state TEXT,
  county TEXT,
  geo_location JSONB,
  case_details TEXT,
  matched_lawyer_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dui_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dui_hearing_sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.will_clause_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inheritance_sims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parole_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rehab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_share_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dui_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own DUI cases" ON public.dui_cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own hearing sims" ON public.dui_hearing_sims FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wills" ON public.will_cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public clauses viewable" ON public.will_clause_library FOR SELECT USING (is_public = true OR organization_id IS NULL);
CREATE POLICY "Users can manage own inheritance sims" ON public.inheritance_sims FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own parole cases" ON public.parole_cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own rehab sessions" ON public.rehab_sessions FOR ALL USING (EXISTS (SELECT 1 FROM parole_cases WHERE id = parole_case_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage own chat history" ON public.ai_chat_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custody cases" ON public.custody_cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own custody payments" ON public.custody_payments FOR ALL USING (EXISTS (SELECT 1 FROM custody_cases WHERE id = custody_case_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage own calendar events" ON public.custody_calendar_events FOR ALL USING (EXISTS (SELECT 1 FROM custody_cases WHERE id = custody_case_id AND user_id = auth.uid()));
CREATE POLICY "Users can view own revenue transactions" ON public.revenue_share_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own leads" ON public.dui_leads FOR ALL USING (auth.uid() = matched_lawyer_id);

-- Seed will clause library
INSERT INTO public.will_clause_library (category, clause_name, clause_text, state_specific) VALUES
('revocation', 'Standard Revocation', 'I hereby revoke all prior wills and codicils.', ARRAY['ALL']),
('executor', 'Primary Executor', 'I appoint [EXECUTOR_NAME] as the Executor of this Will.', ARRAY['ALL']),
('guardian', 'Minor Guardian', 'I appoint [GUARDIAN_NAME] as guardian of my minor children.', ARRAY['ALL']),
('residuary', 'Residuary Estate', 'I give the residue of my estate to [BENEFICIARY_NAME].', ARRAY['ALL']),
('trust', 'Dynasty Trust CA', 'I establish a dynasty trust under California law...', ARRAY['CA']),
('tax', 'Estate Tax Minimization', 'To minimize estate taxes, I direct my Executor...', ARRAY['ALL']),
('digital', 'Digital Assets', 'I grant my Executor access to all digital accounts...', ARRAY['ALL']),
('pet', 'Pet Trust', 'I establish a trust for the care of my pet [PET_NAME]...', ARRAY['ALL']);
