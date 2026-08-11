You are a Senior Full-Stack Engineer tasked with finalizing the LegallyAI application for production deployment on Vercel + Supabase with zero costs and ad-based revenue only.

CRITICAL OBJECTIVES:
1. Remove ALL rating/score displays from frontend (10/10, 9.5/10, stars, reviews)
2. Disable entire payment/subscription system
3. Make 100% of app FREE forever (no premium tiers)
4. Monetize exclusively through Google AdSense, AdMob, and affiliate links
5. Implement free-tier Supabase (zero infrastructure costs)
6. Deploy production-ready AI chat via edge functions
7. Create referral system for user acquisition

CURRENT STATE:
- React + TypeScript + Vite frontend
- Supabase backend (auth, database, edge functions)
- Anthropic Claude API (claude-3-5-sonnet-20241022)
- Google AdSense (ca-pub-4991947741196600)
- Vercel hosting
- GitHub Actions CI/CD

TASKS TO COMPLETE IMMEDIATELY:

TASK 1: REMOVE ALL RATINGS FROM FRONTEND
- Search and delete: rating, /10, 10/10, 9.5/10, stars, testimonial, premium, upgrade, subscribe, "Coming Soon"
- Files to modify: src/pages/AIAssistantsPage.tsx, src/pages/Index.tsx, src/pages/PricingPage.tsx, src/components/dashboard/LexiAssistant.tsx
- Replace with: "Free", "Free Forever", "AI-Powered", "Share with Friends"
- Result: Zero star ratings visible on entire site

TASK 2: DISABLE PAYMENT SYSTEM
- Comment out/delete payment functions: process-payment, verify-payment, check-subscription, request-payout
- Update FloatingLeeAssistant.tsx: Remove isPremium check, allow all users
- Update PricingPage.tsx: Show all features as FREE (remove tier descriptions)
- Update auth flow: Don't check subscriptions on login
- Result: No payment processing anywhere

TASK 3: MAKE EVERYTHING FREE
- ChatPage.tsx: Remove auth requirement for chat
- All AI Assistants: Remove premium badges
- Document Generator: Allow unlimited free documents
- Voice Input: Enable for all users
- Database search: Remove "premium" from any feature flags

TASK 4: SUPABASE FREE-TIER SETUP
Database changes:
- KEEP: users table (auth), conversations table (chat history), documents table (generated docs)
- REMOVE: payment_subscriptions, payment_transactions, payment_invoices tables
- ADD: ad_impressions table (track views), referrals table (user rewards)

SQL to run:
```sql
-- Delete payment tables
DROP TABLE IF EXISTS payment_invoices;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS payment_subscriptions;

-- Create ad tracking
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  page TEXT,
  ad_slot TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create referral system
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id),
  referred_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  reward_status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own impressions" ON ad_impressions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);
```

TASK 5: EDGE FUNCTIONS DEPLOYMENT
- legal-chat: READY (already created, uses Anthropic API)
- Deploy command: supabase functions deploy legal-chat
- Set secrets: supabase secrets set ANTHROPIC_API_KEY=sk_ant_xxxxx

TASK 6: MONETIZATION INTEGRATION
AdSense (already in code, just activate):
- Verify ca-pub-4991947741196600 in Google AdSense dashboard
- Place ads on: ChatPage, each AI Assistant page, blog posts, landing page
- Code already exists: AdBanner, AdContainer components

AdMob (mobile):
- Sign up at Google AdMob
- Create ad units for mobile app
- Integrate AdMobBanner component on all mobile pages

Affiliate Program:
- Add links to legal services, document services, business tools
- 20-30% commission typical
- Track clicks via referral_links table

TASK 7: ENVIRONMENT VARIABLES
Update .env and Vercel:
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=[your_anon_key]
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
VITE_ENABLE_PAYMENTS=false
VITE_ADSENSE_CLIENT_ID=ca-pub-4991947741196600
VITE_ENABLE_ADSENSE=true
VITE_ENABLE_ADMOB=true
ANTHROPIC_API_KEY=sk_ant_xxxxx (Supabase secrets only, not frontend)

TASK 8: DEPLOYMENT CHECKLIST
1. Remove all ratings (search codebase)
2. Disable payment functions
3. Update PricingPage to show FREE only
4. Run: npm run build (check for errors)
5. Run: npm run lint (fix any issues)
6. Commit: git add . && git commit -m "Remove payments, make app 100% free"
7. Push: git push origin main
8. Supabase deploy: supabase functions deploy
9. Vercel auto-deploys on GitHub push
10. Test at your-domain.vercel.app

REVENUE MODEL:
- Month 1: 10k users, $50-100 revenue
- Month 3: 50k users, $250-500 revenue  
- Month 6: 100k users, $500-1000 revenue
- Month 12: 200k users, $1000-2000 revenue

Growth drivers: viral referral system, SEO, social media, influencer partnerships

FINAL RESULT:
- 100% free app (zero user payments)
- Zero infrastructure costs (Supabase free tier, Vercel free tier)
- 100% ad-based revenue
- Self-sustaining business model
- Production-ready deployment
- Unlimited scalability

PROVIDE:
1. Complete list of files to modify with line numbers
2. All React component changes to remove ratings/payments
3. SQL migrations to disable payments
4. Updated environment variables
5. Exact git commands to deploy
6. Verification steps to confirm everything works

START NOW - Provide the complete file-by-file modification plan for removing all ratings and payments.
