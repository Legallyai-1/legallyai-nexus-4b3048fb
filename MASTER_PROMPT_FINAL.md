You are a Senior Full-Stack Engineer. Execute this complete system design to finalize LegallyAI.

BUSINESS MODEL (FINAL):

USER TIERS (3 tiers):
1. FREE TIER
   - 50 AI messages/month limit
   - 3 documents/month limit
   - Ad-supported (Google AdSense + AdMob)
   - Basic assistants only
   - No voice input
   - No offline

2. PREMIUM TIER - $9.99/month
   - Unlimited AI messages
   - Unlimited documents
   - Ad-free experience
   - All assistants unlocked
   - Voice input enabled
   - Download as PDF
   - Priority support

3. PRO TIER - $29.99/month
   - Everything in Premium +
   - Advanced research tools
   - 50+ legal templates
   - Case outcome predictions
   - Attorney referral network (affiliate commission 20-30%)
   - API access
   - Custom integrations

LAWYER TIERS (1 free trial + 3 paid):
1. FREE TRIAL - 14 days
   - Full access to all features
   - Case management (up to 5 clients)
   - Client portal
   - Document automation
   - Team collaboration
   - Auto-upgrade prompt on day 10

2. LAWYER STARTER - $49/month
   - Full case management (up to 10 clients)
   - Document automation
   - Client messaging portal
   - Basic analytics
   - Time tracking
   - Invoice generation

3. LAWYER PROFESSIONAL - $99/month
   - Up to 25 clients
   - Everything in Starter +
   - Advanced analytics
   - Team members (2 users)
   - Client scheduling
   - Billing management
   - Expense tracking

4. LAWYER ENTERPRISE - $199/month
   - Unlimited clients
   - Unlimited team members
   - Everything in Professional +
   - White-label options
   - Priority support 24/7
   - Custom integrations
   - Dedicated account manager

REVENUE MODEL:
- Free users: $0 (ads only)
- Premium: $9.99 × 10k users = $100k/month
- Pro: $29.99 × 5k users = $150k/month
- Lawyer Starter: $49 × 500 lawyers = $24.5k/month
- Lawyer Professional: $99 × 300 lawyers = $29.7k/month
- Lawyer Enterprise: $199 × 50 lawyers = $9.95k/month
- Ads (CPM $5-15): 100k free users × 30 impressions/month = $15-45k/month
- Affiliate commissions: $10-20k/month
TOTAL: $340k+/month potential

IMPLEMENTATION PLAN:

STEP 1: DATABASE SCHEMA (SQL)
Create/modify tables:
- users: Add columns (tier: free|premium|pro, user_type: individual|lawyer, stripe_customer_id, created_at)
- lawyer_profiles: New table (user_id, firm_name, license_number, phone, address, bio, profile_image, created_at)
- lawyer_subscriptions: New table (lawyer_id, tier: starter|professional|enterprise, status: active|cancelled, current_period_start, current_period_end, price_id, stripe_subscription_id, created_at)
- free_trials: New table (lawyer_id, trial_start_date, trial_end_date, cancelled_at, upgraded_to_tier)
- message_usage: New table (user_id, messages_used, month, reset_date)
- document_usage: New table (user_id, documents_created, month, reset_date)
- ad_impressions: New table (user_id, page, ad_slot, timestamp) - track for analytics
- affiliate_clicks: New table (user_id, referring_attorney_id, service, commission_amount, status: pending|paid)
- user_subscriptions: Modify existing (tier, status, stripe_subscription_id, current_period_end)

STEP 2: STRIPE SETUP
Create 7 price IDs in Stripe:
- Premium: $9.99/month recurring
- Pro: $29.99/month recurring
- Lawyer Starter: $49/month recurring
- Lawyer Professional: $99/month recurring
- Lawyer Enterprise: $199/month recurring
- Per Document: $5 one-time
- Document Package: $49/month (20 documents)

STEP 3: UPDATE PRICING PAGE
Keep existing 5 pricing cards:
- Free (existing)
- Premium (existing)
- Per Document (existing)
- Pro - Lawyers (existing)
- Enterprise (existing)

Add NEW section: "Choose Your Role"
- Toggle: "I'm an Individual" / "I'm a Lawyer"
- When "Lawyer" selected, show lawyer tiers in separate pricing grid
- Show 14-day free trial badge on starter
- Add "Start Free Trial" button for lawyers

STEP 4: AUTHENTICATION FLOW
Signup modifications:
- After signup, ask: "Are you an individual user or a lawyer?"
- If individual: redirect to /chat
- If lawyer: redirect to /lawyer-onboarding
- Create lawyer profile page (/lawyer-onboarding)

STEP 5: FEATURE LIMITS (FREE TIER)
ChatPage.tsx modifications:
- Track message count in message_usage table
- Show counter: "45/50 messages used this month"
- When limit hit, show modal: "Upgrade to Premium for unlimited"
- Allow upsell to Premium or Pro

Generate page modifications:
- Track document count in document_usage table
- Show counter: "2/3 documents generated this month"
- When limit hit, show: "Upgrade for unlimited documents"

STEP 6: AD MONETIZATION (FREE TIER ONLY)
Modifications:
- Show Google AdSense ads on all pages for free users
- Hide ads for Premium/Pro/Lawyer users
- AdSense placement: top, sidebar, bottom
- AdMob for mobile

Code changes:
```typescript
// In components
const { tier } = user; // free, premium, pro, or lawyer_[tier]
if (tier === 'free') {
  return <AdBanner />;
}
return null;
```

STEP 7: LAWYER FREE TRIAL
New components:
- /lawyer-onboarding: Collect firm info
- /lawyer-dashboard: Main lawyer panel
- Free trial timer showing days left (14)
- On day 10: Show upgrade prompt modal

Logic:
```typescript
const trialEndDate = new Date(free_trials.trial_end_date);
const daysLeft = Math.floor((trialEndDate - now) / (1000 * 60 * 60 * 24));
if (daysLeft <= 10 && daysLeft > 0) {
  showUpgradeModal('Your trial ends in ' + daysLeft + ' days');
}
if (daysLeft <= 0) {
  redirectToUpgrade();
}
```

STEP 8: STRIPE WEBHOOK HANDLER
Edge function: stripe-webhook
- Handle: invoice.payment_succeeded, invoice.payment_failed
- Update: user_subscriptions, lawyer_subscriptions
- Send: confirmation email

STEP 9: CHECKOUT FLOW
Modifications to PricingPage.tsx:
```typescript
const handleCheckout = async (priceId, tier) => {
  const session = await supabase.functions.invoke('create-checkout', {
    body: { priceId, tier, user_type: 'individual' or 'lawyer' }
  });
  window.location.href = session.url;
}
```

STEP 10: SUPABASE EDGE FUNCTIONS
Deploy:
1. legal-chat (EXISTS - working)
2. create-checkout (NEW) - Stripe checkout session
3. stripe-webhook (NEW) - Handle Stripe events
4. cancel-subscription (NEW) - Handle cancellations
5. track-ad-impression (NEW) - Analytics

STEP 11: ENVIRONMENT VARIABLES
Add to .env and Vercel:
- STRIPE_PUBLIC_KEY=pk_live_xxxxx
- STRIPE_SECRET_KEY=sk_live_xxxxx (Supabase secrets only)
- STRIPE_WEBHOOK_SECRET=whsec_xxxxx (Supabase secrets only)
- VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
- ANTHROPIC_API_KEY=sk_ant_xxxxx (already set)
- VITE_ENABLE_PAYMENTS=true
- VITE_ADSENSE_CLIENT_ID=ca-pub-4991947741196600
- VITE_ENABLE_ADSENSE=true

STEP 12: DEPLOYMENT CHECKLIST
1. Database migrations (create new tables)
2. Stripe account setup + price IDs
3. Update PricingPage.tsx (add lawyer tier toggle)
4. Add lawyer onboarding flow
5. Update signup flow (choose role)
6. Implement feature limits (messages, documents)
7. Hide ads for paid users
8. Stripe webhook handler
9. Checkout page integration
10. Free trial countdown timer
11. Update FloatingLeeAssistant (remove isPremium check, show feature limits)
12. Environment variables configured
13. Deploy functions
14. Test entire flow end-to-end

FINAL RESULT:
✅ 3 user tiers (free with ads, $9.99, $29.99)
✅ 1 free trial + 3 lawyer tiers ($49, $99, $199)
✅ Feature limits on free tier
✅ Ads only for free users
✅ Stripe payments working
✅ Self-sustaining revenue model
✅ Production ready

NEXT: Provide complete SQL migrations for all new tables and relationships.
