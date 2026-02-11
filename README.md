# 🚀 LegallyAI - The Ultimate Legal AI Platform

**Production-ready legal tech platform powered by GitHub + Supabase ONLY.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Legallyai-1/legallyai-nexus-4b3048fb)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Legallyai-1/legallyai-nexus-4b3048fb)

---
## 🚀 Quick Start (No Stripe Required!)

This app is **production-ready** with just **GitHub + Supabase**. Stripe is completely optional.

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Setup Instructions

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials (REQUIRED)
# Stripe variables can be left blank - app works without them!

# Step 5: Start the development server
npm run dev
```

### Required Environment Variables

Only these are **required** to run the app:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

Get these from your Supabase project dashboard → Settings → API

### Optional: Enable Google AdSense

Google AdSense is already integrated and works out of the box with the default client ID. To use your own:

1. Get your AdSense publisher ID from [google.com/adsense](https://www.google.com/adsense)
2. Add to `.env`:
   ```bash
   VITE_ADSENSE_CLIENT_ID=ca-pub-YOUR_PUBLISHER_ID
   ```
3. Update the client ID in `index.html` (line 34)
4. Restart your dev server

AdSense ads will automatically appear on key pages (home, AI assistants, pricing, etc.).

### Optional: Enable Stripe Payments

Stripe is **completely optional**. The app works fully without it using:
- Manual subscription management via admin panel
- AdSense/AdMob for monetization (no API keys needed)

To enable automated Stripe payments (optional):

1. Get your Stripe keys from [dashboard.stripe.com](https://dashboard.stripe.com/apikeys)
2. Add to `.env`:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   VITE_ENABLE_PAYMENTS=true
   ```
3. Restart your dev server

**That's it!** The app will automatically use Stripe when configured, or fallback to Supabase-only payments.

### Manual Payment Verification (When Stripe is Disabled)

Admins can manually grant subscription access via the admin panel:

1. Navigate to Admin Dashboard
2. Go to Payment Records section
3. Add payment record for user:
   - Select user
   - Choose tier (free/premium/pro)
   - Set expiration date (optional for lifetime access)
   - Select payment method (manual/promotional)
4. User gets immediate access to tier features

All manual payments are tracked in the `payment_records` table with full audit trail.

## How can I edit this code?

## ✨ Features

- **15+ AI Legal Assistants** - Custody, DUI, Divorce, Wills, Employment, etc.
- **Full Business Hub** - Practice management, billing, trust accounting
- **Database Subscriptions** - No Stripe SDK required
- **Real Ad Revenue** - AdSense (web) + AdMob (mobile)
- **Bank Payouts** - Withdraw earnings directly
- **Android App** - Built with Capacitor
- **Zero External APIs** - Works 100% with GitHub + Supabase

---

## 🚀 Quick Start (5 minutes)

### 1. Deploy Backend (Supabase)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run migrations (see `SUPABASE_SETUP.md`)
4. Deploy edge functions (see `SUPABASE_SETUP.md`)
5. Copy Project URL and Anon Key

### 2. Deploy Frontend (Vercel/Netlify)

**Vercel:**
1. Click "Deploy with Vercel" button above
2. Connect GitHub repo
3. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```
4. Deploy!

**⚠️ Vercel Access Issues?** See [docs/VERCEL_TROUBLESHOOTING.md](./docs/VERCEL_TROUBLESHOOTING.md) for solutions.

**Netlify:**
1. Click "Deploy to Netlify" button above
2. Connect GitHub repo
3. Add same environment variables
4. Deploy!

### 3. Configure Monetization (15 minutes)

**AdSense (Web):**
1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Get Publisher ID (format: `pub-XXXXXXXXXXXXXXXX`)
3. Update `public/ads.txt` with your Publisher ID
4. Create ad units and get slot IDs
5. Update `src/components/ads/AdBanner.tsx` with real slot IDs

**AdMob (Mobile):**
1. Sign up at [admob.google.com](https://admob.google.com)
2. Create app "LegallyAI"
3. Create banner ad units for each page
4. Update `src/components/ads/AdMobBanner.tsx` with unit IDs
5. Update `android/app/src/main/AndroidManifest.xml` with app ID

**Bank Account:**
1. Log in to your deployed app
2. Go to Account → Earnings
3. Connect bank account
4. Request payout when balance > $100

---

## 💰 Revenue Streams

| Stream | Potential Revenue |
|--------|------------------|
| **AdSense (Web)** | $0.05-$0.50 per impression |
| **AdMob (Mobile)** | $0.05-$1.00 per impression |
| **Premium Subscriptions** | $9.99/month |
| **Pro Subscriptions** | $99/month (lawyers) |
| **Document Sales** | $5/document |
| **Enterprise Plans** | Custom pricing |

---

## 📱 Build Android APK

```bash
# Install dependencies
npm install

# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Build APK
cd android
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Signed Release (requires keystore):**
```bash
./gradlew assembleRelease
```

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn-ui + Tailwind CSS
- **Backend:** Supabase (100% of backend)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Authentication
  - Storage
- **Mobile:** Capacitor
- **Ads:** Google AdSense + AdMob
- **Payments:** Database + Manual Processing
- **Deployment:** Vercel / Netlify
- **CI/CD:** GitHub Actions

---

## 📁 Project Structure

```
legallyai-nexus-4b3048fb/
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── pages/                # Page components
│   ├── integrations/         # Supabase client
│   └── lib/                  # Utilities
├── supabase/
│   ├── functions/            # Edge functions (backend API)
│   └── migrations/           # Database schema
├── android/                  # Android app
├── public/                   # Static assets
│   └── ads.txt               # AdSense verification
├── docs/                     # Documentation
│   ├── SUPABASE_SETUP.md     # Backend setup guide
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── MONETIZATION.md       # Revenue setup
│   └── BANK_INTEGRATION.md   # Payout setup
└── package.json
```

---

## 🔒 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Authentication required for sensitive operations
- ✅ Environment variables for secrets
- ✅ HTTPS only
- ✅ Regular security audits (CodeQL)
- ✅ No API keys in frontend code

---

## 🌍 Environment Variables

**Required (Frontend):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

**Auto-Injected (Supabase Edge Functions):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=auto_injected
SUPABASE_ANON_KEY=auto_injected
```

**Removed (Not Needed Anymore):**
- ❌ LOVABLE_API_KEY
- ❌ OPENAI_API_KEY
- ❌ STRIPE_SECRET_KEY

---

## 📚 Documentation

- [Supabase Setup Guide](./docs/SUPABASE_SETUP.md) - Backend deployment
- [Deployment Guide](./docs/DEPLOYMENT.md) - Frontend deployment
- [**Vercel Troubleshooting**](./docs/VERCEL_TROUBLESHOOTING.md) - Fix repository access issues ⚠️
- [Monetization Guide](./docs/MONETIZATION.md) - AdSense + AdMob setup
- [Bank Integration Guide](./docs/BANK_INTEGRATION.md) - Payout setup
- [API Documentation](./docs/API.md) - Edge function reference
- [Architecture Overview](./docs/ARCHITECTURE.md) - System design

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/discussions)
- **Email:** support@legallyai.ai
- **Docs:** [Documentation](./docs)

---

## 🎯 Deployment Checklist

- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Deploy edge functions
- [ ] Deploy to Vercel/Netlify
- [ ] Configure AdSense
- [ ] Configure AdMob
- [ ] Connect bank account
- [ ] Test payment flow
- [ ] Test ad impressions
- [ ] Build Android APK
- [ ] Test app end-to-end
- [ ] ✅ GO LIVE!

---

**Built with 💙 by the LegallyAI team**

*Powered by GitHub + Supabase. No external dependencies.*

