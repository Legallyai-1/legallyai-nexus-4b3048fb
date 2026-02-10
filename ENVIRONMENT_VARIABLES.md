# Environment Variables Configuration Guide

This document explains the correct environment variable names to use for Supabase and Vercel integration.

## ✅ Correct Variable Names

### Frontend (Vite) Variables

These variables are used in the React frontend and **MUST** have the `VITE_` prefix to be accessible in the browser:

```env
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
```

### Backend (Edge Functions) Variables

These variables are used in Supabase Edge Functions and are automatically injected by Supabase:

```env
SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel AI Gateway Variable

Used for AI features in edge functions:

```env
VERCEL_AI_GATEWAY_KEY=your_vercel_ai_gateway_key_here
```

## 🔄 Variable Name Mapping

### What Supabase Calls It vs What We Use

| Supabase Dashboard | Our Variable Name | Usage |
|-------------------|-------------------|-------|
| Project URL | `VITE_SUPABASE_URL` (frontend) | Supabase API endpoint |
| anon/public key | `VITE_SUPABASE_ANON_KEY` (frontend) | Public API key for client |
| service_role key | Auto-injected in edge functions | Admin API key (backend only) |
| Project Ref | `VITE_SUPABASE_PROJECT_ID` | Project identifier |

### What Vercel Uses

| Vercel Config | Our Variable Name | Usage |
|--------------|-------------------|-------|
| Environment Variables | `VITE_SUPABASE_URL` | Must be set in Vercel Dashboard |
| Environment Variables | `VITE_SUPABASE_ANON_KEY` | Must be set in Vercel Dashboard |
| Environment Variables | `VITE_SUPABASE_PROJECT_ID` | Must be set in Vercel Dashboard |
| Vercel Secrets | `@supabase-anon-key` | Secret reference in vercel.json |

## 📝 How to Set Variables

### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values from Supabase Dashboard → Settings → API

### For Vercel Deployment

#### Option 1: Vercel Dashboard
1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://wejiqqtwnhevcjdllodr.supabase.co`
   - Environment: Production, Preview, Development

#### Option 2: Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://wejiqqtwnhevcjdllodr.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add VITE_SUPABASE_PROJECT_ID
# Paste: wejiqqtwnhevcjdllodr
```

#### Option 3: Using Secrets (Advanced)
```bash
# Create a secret
vercel secrets add supabase-anon-key "your_actual_anon_key"

# Reference in vercel.json
{
  "env": {
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### For Supabase Edge Functions

1. Via Supabase CLI:
   ```bash
   supabase secrets set VERCEL_AI_GATEWAY_KEY=your_key_here
   ```

2. Via Supabase Dashboard:
   - Go to Edge Functions → Environment Variables
   - Add: `VERCEL_AI_GATEWAY_KEY`

## ❌ Common Mistakes

### Wrong Prefix
```env
# ❌ WRONG - Next.js naming (we use Vite)
NEXT_PUBLIC_SUPABASE_URL=...

# ✅ CORRECT - Vite naming
VITE_SUPABASE_URL=...
```

### Wrong Variable Name
```env
# ❌ WRONG - Old naming
VITE_SUPABASE_PUBLISHABLE_KEY=...

# ✅ CORRECT - Current naming
VITE_SUPABASE_ANON_KEY=...
```

### Missing Prefix
```env
# ❌ WRONG - No prefix (won't be accessible in frontend)
SUPABASE_URL=...

# ✅ CORRECT - With VITE_ prefix
VITE_SUPABASE_URL=...
```

## 🧪 Verification

### Check Frontend Variables

Open browser console on your deployed app and run:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log(import.meta.env.VITE_SUPABASE_PROJECT_ID)
```

All should show values (not `undefined`).

### Check Edge Function Variables

In your edge function, add:

```typescript
console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
console.log('VERCEL_AI_GATEWAY_KEY:', Deno.env.get('VERCEL_AI_GATEWAY_KEY') ? 'Set' : 'Not set')
```

Check the logs - all should show values.

## 📚 Related Files

- `.env.example` - Template for local development
- `vercel.json` - Vercel deployment configuration
- `src/integrations/supabase/client.ts` - Uses frontend variables
- `supabase/functions/legal-chat/index.ts` - Uses backend variables

## 🆘 Troubleshooting

### App can't connect to Supabase
- **Check:** Are `VITE_*` variables set in Vercel Dashboard?
- **Fix:** Add all 3 variables in Vercel → Settings → Environment Variables

### AI chat not working
- **Check:** Is `VERCEL_AI_GATEWAY_KEY` set in Supabase?
- **Fix:** Run `supabase secrets set VERCEL_AI_GATEWAY_KEY=...`

### Variables are undefined in browser
- **Check:** Do they have the `VITE_` prefix?
- **Fix:** Rename to start with `VITE_`

### Changes not reflected after deployment
- **Check:** Did you redeploy after changing variables?
- **Fix:** Redeploy with `vercel --prod`

## ✅ Summary

**For Frontend (browser):** Use `VITE_*` prefix  
**For Backend (edge functions):** Variables auto-injected by Supabase  
**For Vercel:** Set all `VITE_*` variables in dashboard  
**For Supabase:** Set `VERCEL_AI_GATEWAY_KEY` in secrets  

That's it! Keep it simple and consistent.
