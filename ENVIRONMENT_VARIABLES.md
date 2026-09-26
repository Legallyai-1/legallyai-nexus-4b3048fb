# Environment Variables

LegallyAI uses a split configuration model:

- `VITE_*` variables are public browser/runtime settings.
- non-`VITE_*` variables stay server-side for Vercel API routes and deployment automation.

## Required browser variables

```env
VITE_SUPABASE_URL=https://whdljtbtqisoszbrzdwq.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key_here
VITE_SUPABASE_PROJECT_ID=whdljtbtqisoszbrzdwq
VITE_ADSENSE_CLIENT_ID=ca-pub-4991947741196600
VITE_ENABLE_ADSENSE=true
VITE_ENABLE_PAYMENTS=true
```

Use either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`; the app accepts both and normalizes them at build time.

## Required server variables

```env
SUPABASE_URL=https://whdljtbtqisoszbrzdwq.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_admin_key_here
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
OPENAI_API_KEY=your_openai_api_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=dakota-lefavers-projects
VERCEL_PROJECT_ID=prj_KSzIDIhU2EzZo8Fr24KQOMogqEmZ
```

## Validation entry points

- `vite.config.ts` validates required browser variables during `npm run build`.
- `npm run validate:env -- --target=client` validates browser configuration locally or in CI.
- `npm run validate:env -- --target=deployment` validates deployment-time browser/server configuration.
- `npm run validate:secrets` checks the GitHub Actions / Vercel secret set before deployment.

## Recommended storage

- Put browser-safe values in GitHub repository variables and sync them to Vercel.
- Put secret values in GitHub repository secrets and sync them to Vercel at deploy time.
- Never commit real `.env` files. Use `.env.example` only.
