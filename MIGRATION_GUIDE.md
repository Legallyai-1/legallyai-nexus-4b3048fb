# Migration Guide: Making Stripe Optional

This guide helps existing LegallyAI deployments migrate to the new Stripe-optional architecture.

## Overview

This migration enables your LegallyAI instance to run without Stripe while maintaining all functionality. Existing Stripe integrations will continue to work if configured.

## What's Changed

### Database Schema
- Added `manual_subscription_tier` to `profiles` table
- Added `subscription_expires_at` to `profiles` table
- Made `stripe_payment_id` nullable in payment tables
- Created new `payment_records` table for Supabase-only tracking
- Added `check_user_subscription()` function

### Edge Functions
- `verify-payment`: Now works without Stripe, checks Supabase first
- `create-checkout`: Returns helpful error when Stripe disabled
- `customer-portal`: Returns helpful error when Stripe disabled
- `get-stripe-analytics`: Works with Supabase payment records

### Frontend
- PricingPage shows disabled state when Stripe not configured
- Environment variable controls: `VITE_ENABLE_PAYMENTS`

## Migration Steps

### Step 1: Backup Your Database

**IMPORTANT:** Always backup before running migrations!

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or use Supabase Dashboard
# Settings → Database → Backups → Create Backup
```

### Step 2: Run the Migration

```bash
# Pull latest code
git pull origin main

# Apply migration
supabase db push
```

Or manually apply the migration file:
`supabase/migrations/20260118132828_make_stripe_optional.sql`

### Step 3: Update Environment Variables

Add the new payment toggle to your `.env`:

```bash
# Set to 'true' if you have Stripe configured and want to use it
# Set to 'false' or omit to disable automated payments
VITE_ENABLE_PAYMENTS=false
```

**If you have Stripe configured and want to keep using it:**

```bash
VITE_ENABLE_PAYMENTS=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxxxx  # Your existing key
STRIPE_SECRET_KEY=sk_xxxxx  # Your existing key
```

### Step 4: Update Edge Functions

Redeploy all updated edge functions:

```bash
supabase functions deploy verify-payment
supabase functions deploy create-checkout
supabase functions deploy customer-portal
supabase functions deploy get-stripe-analytics
```

### Step 5: Verify Migration

1. Check database migration applied:
```sql
SELECT * FROM payment_records LIMIT 1;
-- Should return empty result (table exists)

SELECT manual_subscription_tier, subscription_expires_at 
FROM profiles LIMIT 1;
-- Should return columns (may be null)
```

2. Test subscription check function:
```sql
SELECT * FROM check_user_subscription('any-user-uuid');
-- Should return tier, is_active, expires_at, payment_method
```

3. Test edge functions:
```bash
# Test verify-payment
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/verify-payment \
  -H "Authorization: Bearer YOUR_USER_TOKEN"

# Should return subscription status
```

### Step 6: Rebuild and Redeploy

```bash
# Rebuild frontend
npm run build

# Redeploy to Vercel/Netlify
vercel --prod
# or
netlify deploy --prod
```

## Migrating Existing Stripe Customers

If you have existing Stripe customers and want to track them in Supabase too:

### Option 1: Sync Manually (Recommended)

Create payment records for active subscribers:

```sql
-- For each active Stripe subscriber, create a payment record
INSERT INTO payment_records (
  user_id,
  tier,
  amount,
  payment_method,
  verified_at,
  expires_at,
  metadata
)
VALUES (
  'user-uuid',
  'premium',  -- or 'pro'
  9.99,       -- or 99.00
  'stripe',
  NOW(),
  NOW() + INTERVAL '1 year',  -- or their actual expiration
  '{"stripe_customer_id": "cus_xxxxx"}'::jsonb
);
```

### Option 2: Keep Using Stripe Only

If you prefer to keep using Stripe exclusively:

```bash
# Keep VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_PAYMENTS=true
```

The `verify-payment` function will check Stripe first and fall back to Supabase records.

## Rolling Back

If you need to rollback this migration:

### Step 1: Restore Database Backup

```bash
# Restore from backup
supabase db dump < backup-YYYYMMDD.sql
```

### Step 2: Revert Code Changes

```bash
git revert HEAD~1  # or specific commit
```

### Step 3: Redeploy

```bash
supabase functions deploy --all
npm run build
vercel --prod  # or netlify deploy --prod
```

## Testing Your Migration

### Test Scenario 1: Stripe Enabled

```bash
# Set in .env
VITE_ENABLE_PAYMENTS=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

Expected behavior:
- ✅ Pricing page shows payment buttons
- ✅ Clicking "Subscribe" opens Stripe checkout
- ✅ `verify-payment` checks Stripe first
- ✅ Analytics shows Stripe data

### Test Scenario 2: Stripe Disabled

```bash
# Set in .env
VITE_ENABLE_PAYMENTS=false
# Omit Stripe keys
```

Expected behavior:
- ✅ Pricing page shows "Contact Admin" buttons
- ✅ Alert banner explains payments are disabled
- ✅ Clicking subscribe shows helpful toast message
- ✅ `verify-payment` checks Supabase payment_records only
- ✅ Analytics shows Supabase payment data

### Test Scenario 3: Manual Subscription Grant

```sql
-- Grant premium to user
INSERT INTO payment_records (user_id, tier, amount, payment_method)
VALUES ('user-uuid', 'premium', 0, 'promotional');
```

Expected behavior:
- ✅ User has premium access
- ✅ `verify-payment` returns `hasPaid: true`
- ✅ Dashboard shows premium features unlocked

## Common Issues

### Issue: Migration fails with "column already exists"

**Solution:** The migration is idempotent and checks for existing columns. Safe to run again.

### Issue: verify-payment returns error after migration

**Cause:** Edge function not redeployed

**Solution:**
```bash
supabase functions deploy verify-payment
```

### Issue: Existing Stripe subscriptions not recognized

**Cause:** `VITE_ENABLE_PAYMENTS` not set to `true`

**Solution:** Set `VITE_ENABLE_PAYMENTS=true` in your environment

### Issue: "STRIPE_SECRET_KEY is not set" in logs (but payments disabled)

**Expected behavior:** This is normal when `VITE_ENABLE_PAYMENTS=false`

The edge functions check for Stripe keys but gracefully handle when they're missing.

## Best Practices Post-Migration

1. **Monitor Both Systems**: If using Stripe, monitor both Stripe dashboard and Supabase analytics

2. **Backup Regularly**: Schedule automatic database backups

3. **Document Admin Access**: Keep list of users with manual subscriptions

4. **Audit Trail**: The `payment_records` table maintains full history

5. **Test Payment Flow**: Regularly test checkout process (use Stripe test mode)

## Getting Help

If you encounter issues:

1. Check Supabase edge function logs:
   ```bash
   supabase functions logs verify-payment
   ```

2. Check database migration status:
   ```sql
   SELECT * FROM _supabase_migrations ORDER BY version DESC LIMIT 5;
   ```

3. Verify environment variables are set correctly

4. Review this migration guide

5. Check GitHub issues or create new one

## Success Criteria

After migration, verify:

- [ ] Database migration applied successfully
- [ ] Edge functions redeployed
- [ ] Environment variables updated
- [ ] Frontend rebuilt and redeployed
- [ ] Payment verification works (with or without Stripe)
- [ ] Existing Stripe subscriptions still work (if Stripe enabled)
- [ ] Manual subscription grants work
- [ ] Analytics accessible
- [ ] No breaking changes to existing functionality

**Migration Complete! ✅**

Your LegallyAI instance now supports both Stripe and Supabase-only payment modes.
