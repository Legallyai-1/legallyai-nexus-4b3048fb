-- Create loans table for legal service financing
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  amount NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  interest_rate NUMERIC DEFAULT 0,
  term_months INTEGER DEFAULT 12,
  monthly_payment NUMERIC,
  total_repayment NUMERIC,
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_logs table for telephony
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  case_id UUID REFERENCES public.cases(id),
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  call_type TEXT NOT NULL DEFAULT 'outgoing',
  duration_seconds INTEGER DEFAULT 0,
  transcription TEXT,
  ai_summary TEXT,
  recording_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Loans policies - users can view/manage their own loans
CREATE POLICY "Users can view own loans" ON public.loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own loans" ON public.loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans" ON public.loans
  FOR UPDATE USING (auth.uid() = user_id);

-- Call logs policies - users can view/manage their own call logs
CREATE POLICY "Users can view own call logs" ON public.call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own call logs" ON public.call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own call logs" ON public.call_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own call logs" ON public.call_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for call_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;