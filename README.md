# 🚀 LegallyAI - 100% Production Ready

**A complete legal AI platform that works with ONLY GitHub + Supabase!**

## ✨ What Makes This Special

✅ **Zero External Dependencies** - No Stripe, OpenAI, or Lovable API keys needed  
✅ **Database-Powered Payments** - All transactions stored in Supabase  
✅ **Local AI Knowledge Base** - 15+ legal topics with instant responses  
✅ **Document Templates** - NDA, Lease, Will, Contracts, and more  
✅ **Android Ready** - Java 17 configuration for mobile builds  
✅ **5-Minute Deploy** - Fork, configure, push, done!

## 🎯 Core Features

### 💬 AI Legal Chat
- **Local knowledge base** with 15+ legal topics
- Tenant rights, LLC formation, contracts, divorce, custody, wills, employment law, and more
- No external API calls - works 100% offline
- Instant responses with legal disclaimers

### 📄 Document Generation
- **Template system** with professional legal documents:
  - Non-Disclosure Agreements (NDA)
  - Residential Lease Agreements
  - Last Will and Testament
  - Service Contracts
- Automatic variable filling
- Download as formatted text

### 💳 Payment System
- **Database-only** payment processing
- Subscription tiers: Free, Premium ($9.99), Pro ($99)
- Transaction history tracking
- Credits/wallet system
- No Stripe integration required

### 🏢 Business Hub
- Rule-based client intake analysis
- Billing automation
- Compliance reporting
- Practice analytics
- All powered by database logic

## 🚀 Quick Deploy

### 1. Fork This Repo
```bash
# Click "Fork" button on GitHub
```

### 2. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy your project URL and anon key

### 3. Configure GitHub Secrets
Add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_PROJECT_ID` | Your project ID (from URL) |
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon/public key |
| `SUPABASE_ACCESS_TOKEN` | Get from [account tokens](https://app.supabase.com/account/tokens) |

**Quick setup with GitHub CLI:**
```bash
gh secret set VITE_SUPABASE_PROJECT_ID --body "your_project_id"
gh secret set VITE_SUPABASE_PUBLISHABLE_KEY --body "your_anon_key"
gh secret set VITE_SUPABASE_URL --body "https://your_project.supabase.co"
gh secret set SUPABASE_ACCESS_TOKEN --body "your_access_token"
```

### 4. Push to Main
```bash
git push origin main
```

**That's it!** GitHub Actions will:
- ✅ Run migrations (create payment tables)
- ✅ Deploy edge functions
- ✅ Build the app
- ✅ Deploy to production

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- Supabase CLI ([install instructions](https://supabase.com/docs/guides/cli))

### Setup
```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start Supabase locally
supabase start

# Start dev server
npm run dev
```

### Build for Production
```bash
npm run build
```

### Android Build
The `android/variables.gradle` file configures Java 17 for Android builds:
```bash
# With Capacitor CLI installed
npx cap sync android
npx cap build android
```

## 🔄 CI/CD with Supabase

This project uses GitHub Actions for automated deployment.

### Automatic Deployments

Every push to `main` branch triggers:
- ✅ Dependency installation and caching
- ✅ Code linting
- ✅ Production build
- ✅ Supabase database migrations
- ✅ Supabase Edge Functions deployment

### Setup Instructions

See Quick Deploy section above for complete setup guide.

### Supabase Functions

Edge Functions are located in `supabase/functions/`:
- `legal-chat/` - Local knowledge base AI chat (no external APIs)
- `generate-document/` - Template-based document generation
- `process-payment/` - Database-only payment processor
- `verify-payment/` - Query payment status from DB
- `check-subscription/` - Check user subscription tier
- `business-hub/` - Rule-based business logic
- `process-case-ai/` - Pattern-matching case analysis

All functions work without external API keys!

Deploy functions manually:
```bash
supabase functions deploy legal-chat
supabase functions deploy process-payment
```

### Database Migrations

The production-ready system includes these tables:
- `user_subscriptions` - Subscription tiers and status
- `user_payments` - Transaction history
- `user_credits` - Wallet/credits system
- `transaction_history` - All financial transactions
- `ad_impressions` - Ad revenue tracking

Migrations are in `supabase/migrations/`.

Apply migrations locally:
```bash
supabase db reset
```

Apply to production (automatic via GitHub Actions):
```bash
supabase db push
```

### Local Development with Supabase

```bash
# Start Supabase locally
supabase start

# Stop Supabase
supabase stop

# View local dashboard
# URL shown after 'supabase start'
```

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn-ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth
- **Payments**: Custom database system (no Stripe)
- **AI**: Local knowledge base (no OpenAI/Lovable)
- **Mobile**: Capacitor for Android (Java 17)

## 🎓 Features Breakdown

### Payment Tiers
- **Free**: Unlimited AI chat, 1 document/day
- **Premium** ($9.99/mo): Unlimited documents, PDF downloads
- **Pro** ($99/mo): Everything + client portal, case management, billing
- **Enterprise**: Custom pricing, unlimited users

### Legal Knowledge Topics
1. Tenant Rights & Eviction
2. LLC Formation & Business Law
3. Contracts & Agreements
4. Divorce & Family Law
5. Child Custody
6. Wills & Estate Planning
7. Employment Law
8. Small Claims Court
9. DUI/DWI Defense
10. Personal Injury
11. Bankruptcy
12. Trademarks
13. Non-Disclosure Agreements
14. Power of Attorney
15. General Legal Questions

### Document Templates
- Non-Disclosure Agreement (NDA)
- Residential Lease Agreement
- Last Will and Testament
- Service Agreement/Contract
- Custom documents (generic template)

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Input validation and sanitization
- Prompt injection protection
- No API keys exposed to frontend

## 📝 License

This project is built for production deployment. Customize as needed for your use case.

## 🤝 Contributing

This is a complete, production-ready system. Feel free to fork and customize!

## 📞 Support

For issues or questions, open a GitHub issue.

---

**Built with ❤️ for the legal tech community**
