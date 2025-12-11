-- Create storage bucket for loan documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('loan-documents', 'loan-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for loan documents bucket
CREATE POLICY "Users can view own loan documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own loan documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'loan-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all loan documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'loan-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
));

-- Add platform_fee column to loans table
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;

-- Add verification_data column to store identity verification
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS verification_data jsonb DEFAULT '{}';

-- Add document_urls column for uploaded verification documents
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS document_urls jsonb DEFAULT '[]';

-- Create loan_transactions table for tracking profit sharing
CREATE TABLE IF NOT EXISTS public.loan_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid REFERENCES public.loans(id),
  transaction_type text NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  stripe_transfer_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on loan_transactions
ALTER TABLE public.loan_transactions ENABLE ROW LEVEL SECURITY;

-- Admin-only access to loan transactions
CREATE POLICY "Admins can manage loan transactions"
ON public.loan_transactions FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
));