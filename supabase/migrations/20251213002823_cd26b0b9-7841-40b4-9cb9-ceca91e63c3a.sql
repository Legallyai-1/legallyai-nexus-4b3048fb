-- Bug reports table for beta testers
CREATE TABLE public.bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email text,
  reporter_name text,
  hub_name text,
  page_url text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category text DEFAULT 'bug' CHECK (category IN ('bug', 'ui', 'performance', 'feature', 'crash', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  steps_to_reproduce text,
  expected_behavior text,
  actual_behavior text,
  browser_info text,
  device_info text,
  screenshot_url text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  priority integer DEFAULT 3,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Test users table for tracking test scenarios
CREATE TABLE public.test_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  test_persona text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('individual', 'lawyer', 'law_firm', 'client', 'employee', 'student')),
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  organization_size text CHECK (organization_size IN ('solo', 'small', 'medium', 'large', 'enterprise')),
  hubs_to_test text[] DEFAULT '{}',
  test_scenarios jsonb DEFAULT '[]',
  tests_completed jsonb DEFAULT '[]',
  issues_found integer DEFAULT 0,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Test scenarios table
CREATE TABLE public.test_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name text NOT NULL,
  scenario_name text NOT NULL,
  description text,
  steps jsonb NOT NULL,
  expected_result text,
  user_types text[] DEFAULT '{}',
  priority integer DEFAULT 3,
  is_automated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Test results table
CREATE TABLE public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_user_id uuid REFERENCES public.test_users(id) ON DELETE CASCADE,
  scenario_id uuid REFERENCES public.test_scenarios(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'skipped', 'blocked')),
  notes text,
  error_message text,
  screenshot_url text,
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Bug reports policies
CREATE POLICY "Anyone can create bug reports" ON public.bug_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own bug reports" ON public.bug_reports FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage all bug reports" ON public.bug_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Test users policies
CREATE POLICY "Admins can manage test users" ON public.test_users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);
CREATE POLICY "Users can view own test profile" ON public.test_users FOR SELECT USING (user_id = auth.uid());

-- Test scenarios policies
CREATE POLICY "Anyone can view test scenarios" ON public.test_scenarios FOR SELECT USING (true);
CREATE POLICY "Admins can manage test scenarios" ON public.test_scenarios FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Test results policies
CREATE POLICY "Users can manage own test results" ON public.test_results FOR ALL USING (
  EXISTS (SELECT 1 FROM public.test_users WHERE id = test_results.test_user_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all test results" ON public.test_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
);

-- Create updated_at trigger for bug_reports
CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();