-- Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  hub text,
  reference_id uuid,
  reference_type text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications for any user (via service role)
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Create loan_payments table for repayment tracking
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid REFERENCES public.loans(id) NOT NULL,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  stripe_payment_id text,
  late_fee numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on loan_payments
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own loan payments"
ON public.loan_payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own loan payments"
ON public.loan_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage loan payments"
ON public.loan_payments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;