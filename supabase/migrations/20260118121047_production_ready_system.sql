-- ============================================
-- PRODUCTION TRANSACTION & MONETIZATION SYSTEM
-- ============================================

-- User Subscriptions (replaces Stripe)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Payments (transaction history)
CREATE TABLE IF NOT EXISTS user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'demo',
  status TEXT DEFAULT 'completed',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'document', 'credits', 'upgrade')),
  tier TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
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
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own payments" ON user_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON transaction_history FOR SELECT USING (auth.uid() = user_id);

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_tier(uid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT tier FROM user_subscriptions 
     WHERE user_id = uid AND status = 'active' 
     AND (expires_at IS NULL OR expires_at > now()) 
     LIMIT 1),
    'free'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
