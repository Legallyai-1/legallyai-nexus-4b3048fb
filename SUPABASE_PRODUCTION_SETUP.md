# Supabase production setup

The frontend cannot create Supabase users, run database migrations, deploy Edge Functions, or supply an AI-provider key by itself. Complete these steps before offering paid access.

## 1. Configure frontend variables

Set these in the hosting provider for every deployment environment. Use the **publishable/anon** key only; never expose a service-role key in a `VITE_` variable.

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

In Supabase Authentication settings, set the Site URL to the production site and add these redirect URLs:

```text
https://YOUR_DOMAIN/auth
https://YOUR_DOMAIN/login
https://YOUR_DOMAIN/reset-password
```

## 2. Apply the database schema

From this repository, link the intended project and apply every tracked migration:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 3. Configure and deploy AI chat

AI chat requires an Anthropic API key stored only as a Supabase secret. Choose a model enabled for the Anthropic account; the function defaults to `claude-sonnet-4-20250514` when `ANTHROPIC_MODEL` is not set.

```bash
supabase secrets set ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
supabase secrets set ANTHROPIC_MODEL=claude-sonnet-4-20250514
supabase functions deploy legal-chat
supabase functions deploy api-proxy
```

`legal-chat` and `api-proxy` now require a valid Supabase session. Do not change either function to anonymous access: anonymous use can expose the AI budget and proxy to abuse.

## 4. Verify before charging customers

1. Create a fresh account and confirm the email.
2. Sign in and verify the application redirects successfully.
3. Send a chat message and confirm an AI response arrives.
4. Test password reset with an approved redirect URL.
5. Test payment flows only after the selected payment provider and webhooks are configured.

Do not market unavailable features, invented usage figures, ratings, guaranteed outcomes, or unlimited service until those claims are independently supportable and technically enforced.
