-- Complete the remaining policies that weren't applied due to conflict

-- 6. micro_certifications - fix remaining policies (the SELECT policy already exists)
DROP POLICY IF EXISTS "Anyone can view certifications" ON public.micro_certifications;
CREATE POLICY "Anyone can view certifications" 
ON public.micro_certifications 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can modify certifications" ON public.micro_certifications;
CREATE POLICY "Admins can modify certifications" 
ON public.micro_certifications 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update certifications" ON public.micro_certifications;
CREATE POLICY "Admins can update certifications" 
ON public.micro_certifications 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete certifications" ON public.micro_certifications;
CREATE POLICY "Admins can delete certifications" 
ON public.micro_certifications 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- 7. notifications - Users can only insert notifications for themselves  
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 8. payment_predictions - Should require org membership
DROP POLICY IF EXISTS "Org members can manage payment predictions" ON public.payment_predictions;
CREATE POLICY "Org members can manage payment predictions" 
ON public.payment_predictions 
FOR ALL 
USING (public.is_org_member(auth.uid(), organization_id))
WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- 9. unbilled_time_alerts - Should require org membership
DROP POLICY IF EXISTS "Org members can manage alerts" ON public.unbilled_time_alerts;
CREATE POLICY "Org members can manage alerts" 
ON public.unbilled_time_alerts 
FOR ALL 
USING (public.is_org_member(auth.uid(), organization_id))
WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- 10. user_badges - Users can only receive badges for themselves
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" 
ON public.user_badges 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert badges" ON public.user_badges;
CREATE POLICY "System can insert badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 11. user_certifications - Users can only manage their own certifications
DROP POLICY IF EXISTS "Users can view own certifications" ON public.user_certifications;
CREATE POLICY "Users can view own certifications" 
ON public.user_certifications 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own certifications" ON public.user_certifications;
CREATE POLICY "Users can manage own certifications" 
ON public.user_certifications 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());