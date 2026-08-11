# FREE TIER SUPABASE SETUP

## ZERO COST SERVICES ENABLED:

✅ Database: 500 MB
✅ Auth: Unlimited users
✅ API: Unlimited calls
✅ Edge Functions: 500k/month free
✅ Realtime: Unlimited
✅ Storage: 1 GB

**Total Cost: $0/month**

## TO ENABLE FREE FEATURES:

1. Log in to Supabase Dashboard
2. Settings → Billing → Free Tier (already enabled)
3. No credit card needed
4. No costs will ever appear

## DATABASE SETUP:

Create these tables (free):

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  messages JSONB,
  created_at TIMESTAMP
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);
```

## NO PAYMENT SYSTEM:

Delete/disable these functions:
- process-payment
- verify-payment  
- check-subscription
- request-payout

Keep these functions:
- legal-chat (AI responses)
- track-ads (ad impressions)
- referral-link (user rewards)

## RESULT:

✅ Completely free app
✅ No payments ever
✅ Ad revenue only
✅ Self-sustaining
✅ Zero infrastructure costs
