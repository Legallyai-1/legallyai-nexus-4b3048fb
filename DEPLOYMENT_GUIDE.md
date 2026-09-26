# Deployment Guide

## Build-time validation

`vite.config.ts` validates the required browser environment before Vite builds. Missing Supabase or AdSense configuration fails the build early.

## Runtime / CI validation

```bash
npm run validate:secrets
npm run validate:env -- --target=deployment
npm run validate:deployment
```

## Vercel workflow behavior

- public `VITE_*` values are read from repository variables or secrets,
- server-only values are read from repository secrets,
- both sets are synchronized to the target Vercel environment before deploy,
- the deployment is smoke-tested after publication.

## Supabase / Stripe health verification

- `src/integrations/supabase/helpers.ts` exposes `checkSupabaseHealth()`.
- `api/webhooks/stripe.ts` exposes `checkStripeHealth()`.

## Rollback

If deployment validation fails, use the previous successful Vercel deployment from the dashboard and re-run the workflow after correcting the missing configuration.
