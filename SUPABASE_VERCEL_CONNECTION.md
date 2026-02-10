# 🔗 Supabase ↔ Vercel Connection Guide

## Quick Answer

**Are Supabase and Vercel connected?**

**Status: PARTIALLY CONNECTED** ⚠️

- ✅ Configuration exists
- ❌ Missing critical API key (`VITE_SUPABASE_ANON_KEY`)
- 🔧 2-minute fix available

---

## Current Connection Status

### ✅ What's Already Configured

**In `vercel.json`:**
```json
{
  "env": {
    "VITE_SUPABASE_URL": "https://wejiqqtwnhevcjdllodr.supabase.co",
    "VITE_SUPABASE_PROJECT_ID": "wejiqqtwnhevcjdllodr"
  }
}
```

**In `src/integrations/supabase/client.ts`:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);
```

### ❌ What's Missing

**Critical Environment Variable:**
- `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`)

**Without this key:**
- ❌ Supabase client fails to initialize
- ❌ All database queries fail
- ❌ Authentication doesn't work
- ❌ App shows connection errors

---

## How to Connect (3 Easy Options)

### Option 1: Vercel Dashboard (Recommended - Most Visual)

**Step 1: Get Your Supabase Key**
1. Go to https://app.supabase.com
2. Select your project: `wejiqqtwnhevcjdllodr`
3. Click **Settings** (gear icon) in sidebar
4. Click **API** in settings menu
5. Find **Project API keys** section
6. Copy the **anon** / **public** key (starts with `eyJ...`)

**Step 2: Add to Vercel**
1. Go to https://vercel.com/dashboard
2. Select your project (legallyai-nexus-4b3048fb)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New** button
6. Fill in:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: [paste your Supabase anon key]
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
7. Click **Save**
8. Go to **Deployments** tab
9. Click **⋯** on latest deployment → **Redeploy**

**Done!** ✅ Connection established.

---

### Option 2: Vercel CLI (Fastest - For Developers)

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login
vercel login

# 3. Link your project
cd /path/to/legallyai-nexus-4b3048fb
vercel link

# 4. Add environment variable
vercel env add VITE_SUPABASE_ANON_KEY

# When prompted:
# - Paste your Supabase anon key
# - Select: Production (y)
# - Select: Preview (y)
# - Select: Development (y)

# 5. Redeploy
vercel --prod
```

**Done!** ✅ Connection established.

---

### Option 3: Update vercel.json (Advanced)

**⚠️ Security Note**: Never commit actual keys to `vercel.json`! Use Vercel secrets instead.

**Step 1: Create Vercel Secret**
```bash
# This stores the key securely
vercel secrets add supabase-anon-key "your_actual_key_here"
```

**Step 2: Update vercel.json**
```json
{
  "env": {
    "VITE_SUPABASE_URL": "https://wejiqqtwnhevcjdllodr.supabase.co",
    "VITE_SUPABASE_PROJECT_ID": "wejiqqtwnhevcjdllodr",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Step 3: Deploy**
```bash
vercel --prod
```

**Done!** ✅ Connection established.

---

## How to Verify Connection

### Test 1: Check Environment Variables

After deployment, open your app in browser and run in console:

```javascript
// Should show Supabase URL
console.log(import.meta.env.VITE_SUPABASE_URL)
// Output: "https://wejiqqtwnhevcjdllodr.supabase.co"

// Should show anon key (starts with eyJ...)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
// Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// If both show values → ✅ Environment variables configured
// If either shows undefined → ❌ Missing configuration
```

### Test 2: Try Authentication

1. Go to your deployed app
2. Click **Sign Up** or **Login**
3. Try creating an account
4. **Expected result**: Account created successfully
5. **If it fails**: Check browser console for errors

### Test 3: Check Network Requests

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Try any action (login, load data, etc.)
4. Look for requests to `wejiqqtwnhevcjdllodr.supabase.co`
5. **Expected**: Requests should succeed (200 status)
6. **If failing**: Check request headers for missing auth

### Test 4: Supabase Client Health Check

Add this to your app temporarily:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Test connection
supabase
  .from('profiles')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  });
```

---

## Troubleshooting

### Issue 1: "undefined is not a valid URL"

**Symptoms:**
```
Error: Invalid URL
  at new URL (native)
```

**Cause**: Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`

**Fix:**
1. Check Vercel env vars are set
2. Redeploy after adding env vars
3. Clear browser cache

---

### Issue 2: "Invalid API key"

**Symptoms:**
```
{
  "message": "Invalid API key",
  "code": "invalid_api_key"
}
```

**Cause**: Wrong key or key mismatch

**Fix:**
1. Verify you copied the **anon/public** key (not service_role)
2. Check for extra spaces or newlines
3. Regenerate key in Supabase if needed

---

### Issue 3: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://wejiqqtwnhevcjdllodr.supabase.co' 
from origin 'https://yourapp.vercel.app' has been blocked by CORS
```

**Cause**: Supabase project URL allowlist doesn't include Vercel domain

**Fix:**
1. Go to Supabase Dashboard
2. Settings → API → URL Configuration
3. Add your Vercel domain to allowed origins:
   - `https://yourapp.vercel.app`
   - `https://yourapp-*.vercel.app` (for preview deployments)
4. Save

---

### Issue 4: "Environment variable updated but not showing"

**Symptoms**: Updated env var but app still fails

**Cause**: Deployment uses cached build

**Fix:**
1. Go to Vercel Dashboard → Deployments
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. ✅ Check "Clear cache and redeploy"
5. Deploy

---

## Connection Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  React App (Deployed on Vercel)                │    │
│  │                                                  │    │
│  │  Environment Variables:                         │    │
│  │  - VITE_SUPABASE_URL                            │    │
│  │  - VITE_SUPABASE_ANON_KEY ← CRITICAL!          │    │
│  │  - VITE_SUPABASE_PROJECT_ID                     │    │
│  │                                                  │    │
│  │  ┌────────────────────────────────────────┐    │    │
│  │  │  Supabase Client                       │    │    │
│  │  │  createClient(URL, ANON_KEY)           │    │    │
│  │  └────────────────────────────────────────┘    │    │
│  │                      │                           │    │
│  └──────────────────────┼───────────────────────────┘    │
│                         │                                │
│                         │ HTTPS Requests                 │
│                         │ (Auth, Database, Storage)      │
│                         ↓                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────┼───────────────────────────────┐
│                         ↓                                │
│              Supabase Backend                            │
│      (wejiqqtwnhevcjdllodr.supabase.co)                 │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────┐  │
│  │  PostgreSQL    │  │  Auth Service  │  │  Storage │  │
│  │  Database      │  │                │  │          │  │
│  └────────────────┘  └────────────────┘  └──────────┘  │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐                │
│  │  Edge          │  │  Real-time     │                │
│  │  Functions     │  │  Subscriptions │                │
│  └────────────────┘  └────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

**Key Points:**
- 🔑 Anon key is safe to expose (read-only, RLS protected)
- 🔒 Service role key is SECRET (never expose to client)
- 🌐 All communication is HTTPS encrypted
- 🛡️ Row Level Security (RLS) enforces permissions

---

## What Works Once Connected

### ✅ Authentication
- Sign up with email/password
- Login with email/password
- OAuth providers (Google, GitHub, etc.)
- Password reset
- Email verification
- Session management

### ✅ Database Operations
- Read data from tables
- Insert new records
- Update existing records
- Delete records
- Join queries
- Full-text search
- Transactions

### ✅ Real-time Features
- Live data updates
- Presence (who's online)
- Broadcast messages
- Database change subscriptions

### ✅ Storage
- Upload files
- Download files
- Public/private buckets
- Signed URLs
- Image transformations

### ✅ Edge Functions
- Call Supabase Edge Functions
- Server-side logic
- API integrations
- Background jobs

---

## Security Best Practices

### ✅ DO:
- ✅ Use anon/public key in frontend
- ✅ Store service role key in Supabase (auto-injected)
- ✅ Use environment variables
- ✅ Enable Row Level Security (RLS)
- ✅ Validate all inputs
- ✅ Use prepared statements (automatic with Supabase)

### ❌ DON'T:
- ❌ Commit keys to Git
- ❌ Use service role key in frontend
- ❌ Disable RLS on public tables
- ❌ Trust client-side validation
- ❌ Hardcode credentials

---

## Performance Optimization

### Connection Pooling
Supabase handles this automatically. Each client connection is pooled.

### Caching
```typescript
// Enable query caching
const { data } = await supabase
  .from('profiles')
  .select('*')
  .cache(300); // Cache for 5 minutes
```

### Lazy Loading
```typescript
// Only load data when needed
const { data } = await supabase
  .from('large_table')
  .select('*')
  .range(0, 9) // First 10 records only
  .limit(10);
```

---

## Success Checklist

Use this to verify everything is working:

- [ ] ✅ `VITE_SUPABASE_URL` set in Vercel
- [ ] ✅ `VITE_SUPABASE_ANON_KEY` set in Vercel
- [ ] ✅ `VITE_SUPABASE_PROJECT_ID` set in Vercel
- [ ] ✅ Redeployed after adding env vars
- [ ] ✅ Browser console shows env vars
- [ ] ✅ Can sign up for new account
- [ ] ✅ Can login with existing account
- [ ] ✅ Network requests succeed (200 status)
- [ ] ✅ No CORS errors
- [ ] ✅ No console errors about Supabase
- [ ] ✅ Data loads from database
- [ ] ✅ Can create/update/delete records

**All checked?** 🎉 **Supabase and Vercel are fully connected!**

---

## Need Help?

### Resources
- 📚 Supabase Docs: https://supabase.com/docs
- 📚 Vercel Docs: https://vercel.com/docs
- 💬 Supabase Discord: https://discord.supabase.com
- 💬 Vercel Support: https://vercel.com/support

### Common Documentation
- `DEPLOYMENT_READY.md` - Full deployment guide
- `NEXT_STEPS_CHECKLIST.md` - Step-by-step deployment
- `START_HERE.md` - Quick start guide
- `docs/SUPABASE_SETUP.md` - Supabase configuration
- `docs/API_AUDIT_REPORT.md` - All API keys explained

---

## Summary

**Current Status**: Configuration exists, missing 1 environment variable

**Required Action**: Add `VITE_SUPABASE_ANON_KEY` to Vercel (2 minutes)

**After Fix**: Full Supabase ↔ Vercel connection established! 🚀

**Next Step**: Follow Option 1, 2, or 3 above to add the missing key.
