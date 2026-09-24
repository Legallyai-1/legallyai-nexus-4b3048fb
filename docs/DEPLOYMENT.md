# Deployment Guide

This guide covers deploying LegallyAI to production.

## Prerequisites

- Supabase project set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- GitHub repository
- Domain name (optional)

## Supabase + Stripe production rollout

Use this sequence after the PR merges. Do **not** replay `supabase/schema.sql` or manually rerun every historical migration on an existing database. Apply only the pending forward migration(s), including:

- `20260924034737_restore_core_app_schema_and_stripe_billing.sql`

### 1. Link the production Supabase project

```bash
npx --yes supabase link --project-ref whdljtbtqisoszbrzdwq
```

### 2. Apply pending migrations

```bash
npx --yes supabase db push --project-ref whdljtbtqisoszbrzdwq
```

### 3. Set required Supabase Edge Function secrets

```bash
npx --yes supabase secrets set \
  STRIPE_SECRET_KEY="sk_live_***" \
  STRIPE_WEBHOOK_SECRET="whsec_***" \
  SUPABASE_URL="https://whdljtbtqisoszbrzdwq.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="***" \
  --project-ref whdljtbtqisoszbrzdwq
```

### 4. Deploy the billing-related Edge Functions

```bash
npx --yes supabase functions deploy create-checkout --project-ref whdljtbtqisoszbrzdwq
npx --yes supabase functions deploy check-subscription --project-ref whdljtbtqisoszbrzdwq
npx --yes supabase functions deploy verify-payment --project-ref whdljtbtqisoszbrzdwq
npx --yes supabase functions deploy webhook-handler --project-ref whdljtbtqisoszbrzdwq
```

`webhook-handler` is the Stripe-compatible endpoint in this repo and is configured with `verify_jwt = false` so Stripe can call it without a Supabase JWT.

### 5. Point Stripe to the Supabase webhook endpoint

Configure this production webhook URL in Stripe:

```text
https://whdljtbtqisoszbrzdwq.supabase.co/functions/v1/webhook-handler
```

Subscribe Stripe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded`

### 6. Verify the repaired schema

Run these checks in the Supabase SQL editor after the migration deploys:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'ai_chat_history'
  and column_name = 'session_id';

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'organizations'
  and column_name = 'owner_id';

select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('has_role', 'is_org_member', 'deduct_ai_credits');

select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'organization_members',
    'user_roles',
    'clients',
    'ai_chat_history',
    'ai_credits_ledger',
    'subscriptions',
    'webhook_logs'
  );
```

### 7. Smoke-test the critical paths

- Sign up or log in as a test user and confirm `profiles.credits` and `profiles.subscription_tier` exist.
- Create an organization and confirm the creator can insert the initial `organization_members` row.
- Save and reload AI chat history using a non-UUID session id.
- Complete a Stripe checkout in test mode and confirm `webhook_logs`, `subscriptions`, and `profiles.subscription_tier` update idempotently.
- Confirm the legacy `public.org_members` table still exists and remains untouched.

---

## Deploy to Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository

**⚠️ Having trouble connecting?** See [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) for detailed solutions to common access issues.

### 2. Configure Environment Variables

Add these in project settings:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

### 4. Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (~24 hours)

---

## Deploy to Netlify

### 1. Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose your GitHub repository

### 2. Configure Build Settings

Build settings are already in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`

### 3. Environment Variables

Add in Site settings → Environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Visit your deployment URL

---

## GitHub Actions (CI/CD)

The repository includes GitHub Actions for automated deployment.

### Setup

1. Add GitHub secrets (Settings → Secrets):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_ACCESS_TOKEN`

2. Push to main branch triggers:
   - Build
   - Tests
   - Supabase migrations
   - Edge function deployment

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Website loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Edge functions respond

### 2. Configure DNS

Point your domain to:
- Vercel: Follow Vercel DNS instructions
- Netlify: Follow Netlify DNS instructions

### 3. Enable Analytics

Add Google Analytics (see [MONETIZATION.md](./MONETIZATION.md))

### 4. Monitor

- Set up uptime monitoring
- Configure error tracking
- Monitor performance metrics

---

## Troubleshooting

### Common Issues

**Repository Access Issues:**
- See detailed guide: [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md)
- Most common: Vercel needs GitHub app permissions

**Build Failures:**
- Check environment variables
- Verify Node.js version
- Review build logs

**Runtime Errors:**
- Check browser console
- Verify API keys
- Test Supabase connection

---

## 📚 Related Documentation

- [Vercel Troubleshooting Guide](./VERCEL_TROUBLESHOOTING.md) - Detailed repository access solutions
- [Configure Monetization](./MONETIZATION.md) - Set up revenue streams
- [Supabase Setup](./SUPABASE_SETUP.md) - Backend configuration

---

**Next:** [Configure Monetization](./MONETIZATION.md)
