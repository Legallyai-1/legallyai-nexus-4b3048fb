-- Production Transaction System Migration
-- This migration creates all tables needed for a database-only monetization system

-- User Payment Records
CREATE TABLE IF NOT EXISTS user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'completed',
  transaction_type TEXT NOT NULL, -- 'subscription', 'document', 'credits'
  tier TEXT, -- 'free', 'premium', 'pro', 'enterprise'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Credits/Wallet
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction History
CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10,2),
  credits_change INTEGER,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ad Revenue Tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ad_unit_id TEXT NOT NULL,
  page_path TEXT,
  impression_time TIMESTAMPTZ DEFAULT now(),
  clicked BOOLEAN DEFAULT false,
  revenue_cents INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payments" ON user_payments;
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own transactions" ON transaction_history;
DROP POLICY IF EXISTS "Users can view own ad impressions" ON ad_impressions;

-- RLS Policies (users see only their own data)
CREATE POLICY "Users can view own payments" ON user_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON transaction_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own ad impressions" ON ad_impressions FOR SELECT USING (auth.uid() = user_id);

-- Function to check user tier
CREATE OR REPLACE FUNCTION get_user_tier(uid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(tier, 'free')
    FROM user_subscriptions
    WHERE user_id = uid AND status = 'active' AND (expires_at IS NULL OR expires_at > now())
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_user_credits(uid UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_earned)
  VALUES (uid, amount, amount)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_credits.balance + amount,
      lifetime_earned = user_credits.lifetime_earned + amount,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend credits
CREATE OR REPLACE FUNCTION spend_user_credits(uid UUID, amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance FROM user_credits WHERE user_id = uid;
  
  IF current_balance IS NULL OR current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_credits
  SET balance = balance - amount,
      lifetime_spent = lifetime_spent + amount,
      updated_at = now()
  WHERE user_id = uid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_id ON transaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);

-- Initialize free tier for existing users
INSERT INTO user_subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Initialize credits for existing users
INSERT INTO user_credits (user_id, balance)
SELECT id, 0
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
