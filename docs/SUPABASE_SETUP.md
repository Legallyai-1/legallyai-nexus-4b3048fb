# Supabase Setup Guide

This guide shows how to set up the Supabase backend for LegallyAI.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project details:
   - Name: `legallyai-nexus`
   - Database Password: Generate strong password
   - Region: Choose closest to users
5. Wait for project creation (~2 minutes)

## 2. Run Database Migrations

### Option A: Supabase Dashboard (Recommended)

1. Go to SQL Editor in dashboard
2. Copy contents of each migration file from `supabase/migrations/`
3. Run migrations in order (oldest first)
4. Verify tables created in Database → Tables

### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 3. Deploy Edge Functions

### Option A: Supabase Dashboard

1. Go to Edge Functions in dashboard
2. Click "Deploy new function"
3. Upload each function folder from `supabase/functions/`
4. Deploy functions (24 total)

### Option B: Supabase CLI

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy verify-payment
supabase functions deploy check-subscription
# ... etc
```

## 4. Configure Environment Variables

Edge functions auto-receive these variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

No manual configuration needed!

## 5. Enable Email Authentication

1. Go to Authentication → Providers
2. Enable "Email"
3. Enable "Confirm email" (recommended)
4. Configure email templates (optional)

## 6. Get API Keys

1. Go to Settings → API
2. Copy these values:

```
Project URL: https://your-project.supabase.co
Anon/Public Key: eyJhbGc...
Service Role Key: eyJhbGc... (keep secret!)
Project Ref: your-project-ref
```

3. Add to your frontend `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

## 7. Verify Setup

1. Test authentication:
   - Sign up a test user
   - Verify email
   - Log in

2. Test database:
   - Create a test record
   - Verify RLS policies work

3. Test edge functions:
   - Call `verify-payment` function
   - Check response

## 8. Production Checklist

- [ ] All migrations run successfully
- [ ] All 24 edge functions deployed
- [ ] Email authentication enabled
- [ ] RLS enabled on all tables
- [ ] Test user can sign up/log in
- [ ] API keys copied to frontend
- [ ] Database backups enabled (Settings → Database)

## Troubleshooting

**Migration errors:**
- Run migrations in order
- Check for duplicate table names
- Verify RLS policies syntax

**Function deployment errors:**
- Check function logs in dashboard
- Verify all dependencies in import statements
- Test locally with `supabase functions serve`

**Authentication issues:**
- Verify email templates configured
- Check SMTP settings (if custom email)
- Test with different email provider

---

**Next:** [Deploy Frontend](./DEPLOYMENT.md)
