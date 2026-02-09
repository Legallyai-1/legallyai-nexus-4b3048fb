# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

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

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🔄 CI/CD with Supabase

This project uses GitHub Actions for automated deployment to Supabase.

### Automatic Deployments

Every push to `main` branch triggers:
- ✅ Dependency installation and caching
- ✅ Code linting
- ✅ Production build
- ✅ Supabase database migrations
- ✅ Supabase Edge Functions deployment

### Setup Instructions

#### 1. Configure GitHub Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID | Already set: `wejiqqtwnhevcjdllodr` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_URL` | Project URL | Already set: `https://wejiqqtwnhevcjdllodr.supabase.co` |
| `SUPABASE_ACCESS_TOKEN` | CLI access token | https://app.supabase.com/account/tokens |

**Quick setup with GitHub CLI:**
```bash
gh secret set VITE_SUPABASE_PROJECT_ID --body "wejiqqtwnhevcjdllodr"
gh secret set VITE_SUPABASE_PUBLISHABLE_KEY --body "YOUR_KEY"
gh secret set VITE_SUPABASE_URL --body "https://wejiqqtwnhevcjdllodr.supabase.co"
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_TOKEN"
```

#### 2. Supabase Access Token

1. Visit https://app.supabase.com/account/tokens
2. Generate a new token named "GitHub Actions"
3. Copy and add as `SUPABASE_ACCESS_TOKEN` secret

#### 3. Deploy

```bash
git push origin main
```

Check **Actions** tab to monitor deployment progress!

### Supabase Functions

Edge Functions are located in `supabase/functions/`:
- `webhook-handler/` - Handles incoming webhooks and logs to database

Deploy functions manually:
```bash
supabase functions deploy webhook-handler
```

### Database Migrations

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
