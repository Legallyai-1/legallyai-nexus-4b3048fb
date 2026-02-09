# 🚀 LegallyAI Deployment Guide

## Quick Deploy (5 Minutes)

Deploy LegallyAI to production with **just Supabase** - no external API keys needed!

### Prerequisites

- GitHub account
- Supabase account (free tier available)
- Vercel/Netlify account (optional, for hosting)

### Step 1: Fork/Clone Repository

```bash
git clone https://github.com/Legallyai-1/legallyai-nexus-4b3048fb.git
cd legallyai-nexus-4b3048fb
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Set database password (save it!)
5. Wait for project to initialize (~2 minutes)

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add **only these required values**:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

Get these from: Supabase Dashboard → Settings → API

**That's it!** You're ready to run the app locally:

```bash
npm run dev
```

### Step 4: Run Database Migrations

Apply all database migrations to set up your schema:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

### Step 5: Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy verify-payment
supabase functions deploy create-checkout
supabase functions deploy customer-portal
supabase functions deploy get-stripe-analytics
# ... deploy other functions as needed
```

Set environment variables for functions:

```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 6: Deploy to Vercel/Netlify (Optional)

**Vercel:**

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

**Netlify:**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

---

## 🎯 Production Configuration

### Required Environment Variables

```bash
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For edge functions only
```

### Optional: Enable Stripe Payments

Stripe is **completely optional**. The app works fully without it.

To enable automated payments:

1. Get Stripe API keys from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

2. Add to `.env`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
VITE_ENABLE_PAYMENTS=true
```

3. Deploy edge functions with Stripe secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
```

4. Restart your application

**The app will automatically:**
- Enable payment buttons
- Use Stripe for checkout
- Track payments in both Stripe and Supabase

### Optional: Enable AdSense/AdMob

For monetization without Stripe:

```bash
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxx
VITE_ADMOB_APP_ID=ca-app-pub-xxxxx
```

---

## 📱 Mobile App Deployment (Capacitor)

### Build for Android

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Follow signing wizard
3. Upload to Google Play Console

### Build for iOS

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select target device/simulator
2. Product → Archive
3. Upload to App Store Connect

---

## 🔧 Manual Payment Management

When Stripe is disabled, admins can manually grant subscriptions.

### Grant Subscription via SQL

Connect to your Supabase database and run:

```sql
-- Grant Premium subscription to user (expires in 1 year)
INSERT INTO payment_records (user_id, tier, amount, payment_method, expires_at)
VALUES (
  'user-uuid-here',
  'premium',
  9.99,
  'manual',
  NOW() + INTERVAL '1 year'
);
```

### Grant Lifetime Subscription

```sql
-- Grant Pro subscription with no expiration
INSERT INTO payment_records (user_id, tier, amount, payment_method)
VALUES (
  'user-uuid-here',
  'pro',
  99.00,
  'promotional'
);
```

### Check User Subscription Status

```sql
SELECT * FROM check_user_subscription('user-uuid-here');
```

---

## 🎨 Customization

### Update Branding

- Logo: Replace files in `public/` directory
- Colors: Edit `tailwind.config.ts`
- Domain: Update in Supabase → Authentication → URL Configuration

### Add Custom Domain

**Vercel:**
1. Vercel Dashboard → Domains → Add
2. Follow DNS setup instructions

**Netlify:**
1. Netlify Dashboard → Domain Management → Add Custom Domain
2. Update DNS records

**Supabase:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Add custom domain to allowed redirect URLs

---

## 🔐 Security Best Practices

### Production Checklist

- [ ] Enable RLS on all tables
- [ ] Use service role key only in edge functions
- [ ] Never commit `.env` file to git
- [ ] Enable 2FA on Supabase account
- [ ] Set up database backups
- [ ] Configure CORS origins in edge functions
- [ ] Use HTTPS only in production
- [ ] Implement rate limiting
- [ ] Monitor error logs

### Stripe Security (if enabled)

- [ ] Use webhook signatures
- [ ] Validate all price IDs
- [ ] Use test mode for development
- [ ] Never expose secret keys to frontend

---

## 📊 Monitoring & Analytics

### Database Analytics

Access built-in analytics:

```bash
# Get Supabase payment analytics
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/get-stripe-analytics \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Returns:
- Total revenue
- Active subscriptions
- Recent transactions
- Revenue streams

### Error Monitoring

Check edge function logs:

```bash
supabase functions logs verify-payment
```

---

## 🆘 Troubleshooting

### "Payments are disabled" error

**Cause:** `VITE_ENABLE_PAYMENTS` not set to `true` or Stripe keys missing

**Fix:** 
1. Add Stripe keys to `.env`
2. Set `VITE_ENABLE_PAYMENTS=true`
3. Restart dev server

### Database migration failed

**Cause:** Migration already applied or syntax error

**Fix:**
```bash
# Reset local database
supabase db reset

# Re-apply migrations
supabase db push
```

### Edge function not found

**Cause:** Function not deployed

**Fix:**
```bash
# Deploy specific function
supabase functions deploy function-name
```

### Build errors

**Cause:** Missing dependencies or TypeScript errors

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

---

## 🚀 CI/CD with GitHub Actions

Automated deployment is configured in `.github/workflows/`.

### Required GitHub Secrets

Add these in: Repository → Settings → Secrets and Variables → Actions

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
SUPABASE_ACCESS_TOKEN
```

Optional (if Stripe enabled):
```
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

Every push to `main` will:
1. Install dependencies
2. Run linting
3. Build production bundle
4. Deploy edge functions
5. Run migrations

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs) (optional)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Guide](https://docs.github.com/en/actions)

---

## ✅ Deployment Checklist

Before going live:

- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] RLS policies enabled
- [ ] Custom domain configured (optional)
- [ ] Stripe configured (optional)
- [ ] Mobile app built (optional)
- [ ] Analytics set up
- [ ] Error monitoring enabled
- [ ] Backups configured
- [ ] Terms & Privacy pages updated
- [ ] Admin account created
- [ ] Test user flows end-to-end

**Congratulations! 🎉 Your LegallyAI instance is production-ready!**
