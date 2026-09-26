# Troubleshooting

## `validate:secrets` fails

- Confirm `VERCEL_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SUPABASE_URL` exist as repository secrets.
- Confirm `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PROJECT_ID` exist as repository variables or secrets.

## Build fails with missing Vite env

Run:

```bash
npm run validate:env -- --target=client
```

The output lists every missing or invalid environment variable.

## Supabase auth/session issues

Use `getSupabaseSessionSafely()` and `subscribeToSupabaseAuthState()` from `src/integrations/supabase/helpers.ts` so transient auth failures are logged instead of crashing the app.

## Stripe webhook returns 400

- Confirm `STRIPE_WEBHOOK_SECRET` matches the live endpoint.
- Verify the deployed endpoint is `https://www.legallyai.ai/api/webhooks/stripe`.
- Check Vercel logs for `Stripe webhook verification failed` entries.

## AdSense does not render

- Confirm `VITE_ENABLE_ADSENSE=true` and `VITE_ADSENSE_CLIENT_ID` is set.
- The ad helpers hide unfilled slots after verification so the page layout remains stable.
