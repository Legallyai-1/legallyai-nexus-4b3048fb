-- Remove remaining overly permissive policies and ensure proper ones exist

-- 1. analytics_snapshots
DROP POLICY IF EXISTS "System can manage snapshots" ON public.analytics_snapshots;

-- 2. bug_reports
DROP POLICY IF EXISTS "Anyone can create bug reports" ON public.bug_reports;

-- 3. cases_imported
DROP POLICY IF EXISTS "Service role can manage cases" ON public.cases_imported;

-- 4. compliance_logs
DROP POLICY IF EXISTS "System can insert compliance logs" ON public.compliance_logs;

-- 5. firm_insights
DROP POLICY IF EXISTS "System can manage insights" ON public.firm_insights;

-- 6. micro_certifications
DROP POLICY IF EXISTS "Admins can manage certifications" ON public.micro_certifications;

-- 7. notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

-- 8. payment_predictions
DROP POLICY IF EXISTS "System can manage payment predictions" ON public.payment_predictions;

-- 9. unbilled_time_alerts
DROP POLICY IF EXISTS "System can manage alerts" ON public.unbilled_time_alerts;

-- 10. user_badges
DROP POLICY IF EXISTS "System can manage badges" ON public.user_badges;

-- 11. user_certifications
DROP POLICY IF EXISTS "System can manage user certs" ON public.user_certifications;