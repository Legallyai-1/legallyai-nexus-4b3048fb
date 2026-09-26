# Production Setup

## 1. Configure GitHub Actions inputs

Add the following repository variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_ADSENSE_CLIENT_ID`
- `VITE_ENABLE_ADSENSE`
- `VITE_ENABLE_PAYMENTS`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Add the following repository secrets:

- `VERCEL_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

## 2. Verify local configuration

```bash
cp .env.example .env
npm ci
npm run validate:env -- --target=client
npm run build
```

## 3. Deploy through GitHub Actions

Push to `main` or run the `Deploy to Vercel` workflow manually. The workflow now:

1. validates secrets and variables,
2. syncs browser + server variables to Vercel,
3. deploys to preview or production,
4. runs a deployment health check.

## 4. Production checks

Use `docs/PRODUCTION_CHECKLIST.md` immediately after deployment.
