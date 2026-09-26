# Production Checklist

- [ ] `npm run validate:secrets` passes in GitHub Actions.
- [ ] `npm run validate:env -- --target=deployment` passes.
- [ ] Vercel workflow synced all required browser and server variables.
- [ ] `https://www.legallyai.ai` loads successfully.
- [ ] `https://www.legallyai.ai/auth` loads successfully.
- [ ] `https://www.legallyai.ai/pricing` loads successfully.
- [ ] `https://www.legallyai.ai/api/webhooks/stripe` returns `405` for `GET`.
- [ ] Supabase JWKS endpoint returns `200`.
- [ ] Stripe webhook signing secret matches the deployed endpoint.
- [ ] AdSense is enabled only when `VITE_ENABLE_ADSENSE=true` and unfilled slots fall back cleanly.
