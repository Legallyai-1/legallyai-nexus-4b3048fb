# Production Deployment Notes

## Overview
This document outlines the production-ready configuration of LegallyAI after removing UI graphics and ensuring proper integration with Supabase and Vercel.

## Changes Made

### 1. UI Cleanup
- ✅ Removed all "10/10 graphics" from throughout the application
- ✅ Removed "Exceeds Siri/Bixby" marketing claims
- ✅ Cleaned up AI assistant descriptions to be more professional
- ✅ Updated comparison tables to remove exaggerated claims

### 2. Vercel Configuration
- ✅ Created `vercel.json` with proper build settings
- ✅ Configured SPA routing to handle client-side navigation
- ✅ Added security headers (X-Frame-Options, CSP, etc.)
- ✅ Documented required environment variables

### 3. Supabase Integration
- ✅ Verified Supabase client configuration
- ✅ Confirmed authentication works with localStorage persistence
- ✅ Tested edge function connectivity
- ✅ Validated environment variables are properly set

### 4. Google AdSense Support
- ✅ AdSense script already integrated in index.html
- ✅ Added VITE_ADSENSE_CLIENT_ID to environment variables
- ✅ Configured with publisher ID: ca-pub-4991947741196600
- ✅ Ad components (AdBanner, SidebarAd, AdMobBanner) already functional

### 5. Production Readiness

#### Authentication Flow
The signup and login flows are **production-ready** with:
- Strong password validation (8+ chars, uppercase, lowercase, number)
- Email validation with proper regex
- Name validation with character restrictions
- Proper error handling and user feedback
- Session persistence via localStorage
- Email verification workflow (optional, configured in Supabase)

#### Payment/Subscription Flow
The payment system is **production-ready** with graceful degradation:
- Stripe integration with proper price IDs configured
- Secure checkout flow via Supabase Edge Functions
- Proper error handling when Stripe is not configured
- Manual subscription grants available via SQL
- Payment records tracked in Supabase
- Environment variable toggle: `VITE_ENABLE_PAYMENTS`

**Current State**: Payments are **disabled** by default (VITE_ENABLE_PAYMENTS=false)

To enable automated Stripe payments:
1. Add Stripe keys to `.env`:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   VITE_ENABLE_PAYMENTS=true
   ```
2. Deploy edge functions with Stripe secrets
3. Restart the application

**Manual Subscription Alternative**:
When Stripe is disabled, admins can grant subscriptions via SQL:
```sql
INSERT INTO payment_records (user_id, tier, amount, payment_method, expires_at)
VALUES ('user-uuid', 'premium', 9.99, 'manual', NOW() + INTERVAL '1 year');
```

## Deployment Instructions

### Vercel Deployment

1. **Connect Repository to Vercel**
   ```bash
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   ```
   VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
   VITE_ADSENSE_CLIENT_ID=ca-pub-4991947741196600
   ```

   Optional (if enabling Stripe):
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   VITE_ENABLE_PAYMENTS=true
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Supabase Configuration

1. **Ensure RLS Policies are Enabled**
   - Navigate to Supabase Dashboard → Database → Tables
   - Verify RLS is enabled on all tables
   - Review and update policies as needed

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy check-subscription
   supabase functions deploy verify-payment
   supabase functions deploy customer-portal
   supabase functions deploy get-stripe-analytics
   # ... deploy other functions as needed
   ```

3. **Set Secrets for Edge Functions**
   ```bash
   supabase secrets set SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

   If enabling Stripe:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

### Authentication Configuration

In Supabase Dashboard → Authentication → URL Configuration:
- Add production URL to allowed redirect URLs
- Add production URL to site URL
- Configure email templates for production domain

## Monetization Options

### Option 1: Google AdSense (Active)
- **Status**: Fully configured and ready
- **Publisher ID**: ca-pub-4991947741196600
- **Components**: AdBanner, SidebarAd, AdMobBanner
- **Locations**: Integrated throughout pages and layouts
- **Revenue**: Pay-per-click from Google ads

### Option 2: Stripe Subscriptions (Configurable)
- **Status**: Code ready, requires keys to activate
- **Plans**: Free, Premium ($9.99/mo), Pro ($99/mo), Per-Document ($5)
- **Setup**: Add Stripe keys and set VITE_ENABLE_PAYMENTS=true
- **Revenue**: Direct subscription revenue

### Option 3: Manual Subscriptions (Always Available)
- **Status**: Available via SQL
- **Use Case**: Custom deals, promotional access
- **Setup**: Direct database insert via Supabase SQL editor

## Testing Checklist

- [x] Build completes without errors
- [x] No TypeScript compilation errors
- [x] Supabase client initializes correctly
- [x] Authentication flow works end-to-end
- [x] AdSense ads load properly
- [x] Payment flow handles disabled state gracefully
- [ ] Test on production Vercel deployment
- [ ] Verify all environment variables set correctly
- [ ] Test edge function connectivity in production
- [ ] Confirm email templates work with production domain

## Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **Service Role Key**: Only use in edge functions, never expose to client
3. **RLS Policies**: Ensure all tables have proper Row Level Security
4. **CORS**: Edge functions configured with proper CORS headers
5. **Headers**: Security headers configured in vercel.json

## Monitoring

- **Error Tracking**: Check Vercel logs and Supabase function logs
- **Analytics**: Use Supabase dashboard for usage metrics
- **Revenue**: 
  - AdSense: Google AdSense dashboard
  - Stripe: Stripe dashboard (when enabled)
  - Manual: SQL queries on payment_records table

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs (optional)
- Google AdSense: https://support.google.com/adsense

## Known Issues

- Some ESLint warnings exist (mostly `any` types in existing code)
- These are pre-existing and not related to production readiness
- Can be addressed in future refactoring

## Next Steps

1. Deploy to Vercel and test in production environment
2. Configure custom domain (optional)
3. Set up monitoring and error tracking
4. If enabling Stripe, test payment flow end-to-end
5. Monitor AdSense revenue and optimize ad placements
6. Gather user feedback and iterate

---

**Application is production-ready for real user signups and monetization via AdSense.**
**Stripe payments can be enabled at any time by adding API keys.**
