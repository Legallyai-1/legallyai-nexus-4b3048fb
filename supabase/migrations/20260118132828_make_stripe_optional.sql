-- =====================================================================
-- Migration: Make Stripe Optional for LegallyAI
-- Description: Add Supabase-only payment tracking and make Stripe optional
-- =====================================================================

-- Add manual subscription management to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS manual_subscription_tier TEXT DEFAULT 'free' 
    CHECK (manual_subscription_tier IN ('free', 'premium', 'pro'));

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Make stripe_payment_id columns nullable (if they exist and are NOT NULL)
DO $$ 
BEGIN
  -- Check and alter custody_payments stripe_payment_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'custody_payments' 
    AND column_name = 'stripe_payment_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.custody_payments 
      ALTER COLUMN stripe_payment_id DROP NOT NULL;
  END IF;

  -- Check and alter loan_payments stripe_payment_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'loan_payments' 
    AND column_name = 'stripe_payment_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.loan_payments 
      ALTER COLUMN stripe_payment_id DROP NOT NULL;
  END IF;
END $$;

-- Create payment_records table for Supabase-only payment tracking
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'pro')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'manual', 'promotional')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_expires_at ON public.payment_records(expires_at);

-- Enable RLS on payment_records
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_records
CREATE POLICY "Users can view own payment records" 
  ON public.payment_records
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Helper function to check if user has admin or owner role
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can manage all payment records" 
  ON public.payment_records
  FOR ALL 
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'owner'::app_role)
  );

-- Function to check user subscription status (combines Stripe and manual payments)
CREATE OR REPLACE FUNCTION public.check_user_subscription(check_user_id UUID)
RETURNS TABLE (
  tier TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ,
  payment_method TEXT
) AS $$
DECLARE
  profile_tier TEXT;
  profile_expires TIMESTAMPTZ;
  record_tier TEXT;
  record_expires TIMESTAMPTZ;
  record_method TEXT;
BEGIN
  -- Get profile subscription info
  SELECT 
    COALESCE(p.manual_subscription_tier, 'free'),
    p.subscription_expires_at
  INTO profile_tier, profile_expires
  FROM public.profiles p
  WHERE p.id = check_user_id;

  -- Get latest active payment record
  SELECT 
    pr.tier,
    pr.expires_at,
    pr.payment_method
  INTO record_tier, record_expires, record_method
  FROM public.payment_records pr
  WHERE pr.user_id = check_user_id
    AND (pr.expires_at IS NULL OR pr.expires_at > NOW())
  ORDER BY pr.created_at DESC
  LIMIT 1;

  -- Return the highest tier and most recent expiration
  IF record_tier IS NOT NULL THEN
    -- Payment record exists
    RETURN QUERY SELECT 
      record_tier,
      (record_expires IS NULL OR record_expires > NOW()) as is_active,
      record_expires,
      record_method;
  ELSIF profile_tier IS NOT NULL AND profile_tier != 'free' THEN
    -- Manual subscription on profile
    RETURN QUERY SELECT 
      profile_tier,
      (profile_expires IS NULL OR profile_expires > NOW()) as is_active,
      profile_expires,
      'manual'::TEXT;
  ELSE
    -- Free tier
    RETURN QUERY SELECT 
      'free'::TEXT,
      true,
      NULL::TIMESTAMPTZ,
      'none'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update profiles updated_at when subscription changes
CREATE OR REPLACE FUNCTION public.update_profile_on_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_on_payment_record_change
  AFTER INSERT OR UPDATE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_on_subscription_change();

-- Add comment to payment_records table
COMMENT ON TABLE public.payment_records IS 'Tracks user subscription payments and tier access. Supports Stripe, manual, and promotional payments.';
COMMENT ON FUNCTION public.check_user_subscription(UUID) IS 'Returns the current subscription status for a user, checking both payment records and profile settings.';
