-- Business Hub Tables for Enterprise Practice Management

-- Matters/Practice Management Table
CREATE TABLE public.matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  matter_number text NOT NULL,
  name text NOT NULL,
  description text,
  practice_area text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'archived')),
  billing_type text DEFAULT 'hourly' CHECK (billing_type IN ('hourly', 'flat_fee', 'contingency', 'retainer', 'hybrid')),
  hourly_rate numeric DEFAULT 0,
  flat_fee_amount numeric,
  retainer_amount numeric,
  budget numeric,
  responsible_attorney_id uuid REFERENCES public.profiles(id),
  originating_attorney_id uuid REFERENCES public.profiles(id),
  open_date date DEFAULT CURRENT_DATE,
  close_date date,
  statute_of_limitations date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trust Accounts Table
CREATE TABLE public.trust_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  account_name text NOT NULL,
  account_number text,
  bank_name text,
  routing_number text,
  account_type text DEFAULT 'iolta' CHECK (account_type IN ('iolta', 'client_trust', 'operating', 'escrow')),
  current_balance numeric DEFAULT 0 NOT NULL,
  last_reconciled_at timestamptz,
  reconciled_balance numeric,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'frozen')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Trust Transactions Table
CREATE TABLE public.trust_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_account_id uuid REFERENCES public.trust_accounts(id) ON DELETE CASCADE NOT NULL,
  matter_id uuid REFERENCES public.matters(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'fee_payment', 'refund', 'interest')),
  amount numeric NOT NULL,
  running_balance numeric,
  description text,
  reference_number text,
  check_number text,
  payee text,
  payment_method text,
  reconciled boolean DEFAULT false,
  reconciled_at timestamptz,
  reconciled_by uuid REFERENCES public.profiles(id),
  transaction_date date DEFAULT CURRENT_DATE NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Integrations Table (250+ integration capability)
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  integration_type text NOT NULL,
  provider text NOT NULL,
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  credentials jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  sync_frequency text DEFAULT 'hourly',
  error_message text,
  webhook_url text,
  api_version text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Document Templates Table
CREATE TABLE public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  practice_area text,
  content text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Billing Entries Table
CREATE TABLE public.billing_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  matter_id uuid REFERENCES public.matters(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('time', 'expense', 'flat_fee', 'write_off', 'payment')),
  description text NOT NULL,
  quantity numeric DEFAULT 1,
  rate numeric DEFAULT 0,
  amount numeric NOT NULL,
  billable boolean DEFAULT true,
  billed boolean DEFAULT false,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  activity_code text,
  expense_code text,
  entry_date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Compliance Audit Logs Table (SOC 2, HIPAA, GDPR)
CREATE TABLE public.compliance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  compliance_framework text CHECK (compliance_framework IN ('soc2', 'hipaa', 'gdpr', 'ccpa', 'general')),
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Matters
CREATE POLICY "Org members can view matters" ON public.matters
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage matters" ON public.matters
  FOR ALL USING (
    has_role(auth.uid(), 'admin', organization_id) OR 
    has_role(auth.uid(), 'owner', organization_id) OR
    has_role(auth.uid(), 'manager', organization_id)
  );

CREATE POLICY "Assigned attorneys can update matters" ON public.matters
  FOR UPDATE USING (responsible_attorney_id = auth.uid());

-- RLS Policies for Trust Accounts
CREATE POLICY "Admin roles can manage trust accounts" ON public.trust_accounts
  FOR ALL USING (
    has_role(auth.uid(), 'admin', organization_id) OR 
    has_role(auth.uid(), 'owner', organization_id)
  );

CREATE POLICY "Managers can view trust accounts" ON public.trust_accounts
  FOR SELECT USING (
    has_role(auth.uid(), 'manager', organization_id) OR
    has_role(auth.uid(), 'lawyer', organization_id)
  );

-- RLS Policies for Trust Transactions
CREATE POLICY "Admin roles can manage trust transactions" ON public.trust_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.trust_accounts ta
      WHERE ta.id = trust_account_id
      AND (has_role(auth.uid(), 'admin', ta.organization_id) OR has_role(auth.uid(), 'owner', ta.organization_id))
    )
  );

CREATE POLICY "Org members can view trust transactions" ON public.trust_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trust_accounts ta
      WHERE ta.id = trust_account_id
      AND is_org_member(auth.uid(), ta.organization_id)
    )
  );

-- RLS Policies for Integrations
CREATE POLICY "Admin roles can manage integrations" ON public.integrations
  FOR ALL USING (
    has_role(auth.uid(), 'admin', organization_id) OR 
    has_role(auth.uid(), 'owner', organization_id)
  );

CREATE POLICY "Org members can view integrations" ON public.integrations
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

-- RLS Policies for Document Templates
CREATE POLICY "Public templates are viewable by all" ON public.document_templates
  FOR SELECT USING (is_public = true OR organization_id IS NULL);

CREATE POLICY "Org members can view org templates" ON public.document_templates
  FOR SELECT USING (organization_id IS NOT NULL AND is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage org templates" ON public.document_templates
  FOR ALL USING (
    organization_id IS NOT NULL AND (
      has_role(auth.uid(), 'admin', organization_id) OR 
      has_role(auth.uid(), 'owner', organization_id)
    )
  );

-- RLS Policies for Billing Entries
CREATE POLICY "Users can view own billing entries" ON public.billing_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own billing entries" ON public.billing_entries
  FOR INSERT WITH CHECK (user_id = auth.uid() AND is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update own unbilled entries" ON public.billing_entries
  FOR UPDATE USING (user_id = auth.uid() AND billed = false);

CREATE POLICY "Admins can manage all billing entries" ON public.billing_entries
  FOR ALL USING (
    has_role(auth.uid(), 'admin', organization_id) OR 
    has_role(auth.uid(), 'owner', organization_id)
  );

-- RLS Policies for Compliance Logs
CREATE POLICY "Admins can view compliance logs" ON public.compliance_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'admin', organization_id) OR 
    has_role(auth.uid(), 'owner', organization_id)
  );

CREATE POLICY "System can insert compliance logs" ON public.compliance_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_matters_org ON public.matters(organization_id);
CREATE INDEX idx_matters_client ON public.matters(client_id);
CREATE INDEX idx_matters_status ON public.matters(status);
CREATE INDEX idx_trust_transactions_account ON public.trust_transactions(trust_account_id);
CREATE INDEX idx_trust_transactions_date ON public.trust_transactions(transaction_date);
CREATE INDEX idx_billing_entries_matter ON public.billing_entries(matter_id);
CREATE INDEX idx_billing_entries_user ON public.billing_entries(user_id);
CREATE INDEX idx_compliance_logs_org ON public.compliance_logs(organization_id);
CREATE INDEX idx_compliance_logs_created ON public.compliance_logs(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON public.matters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trust_accounts_updated_at BEFORE UPDATE ON public.trust_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_billing_entries_updated_at BEFORE UPDATE ON public.billing_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();