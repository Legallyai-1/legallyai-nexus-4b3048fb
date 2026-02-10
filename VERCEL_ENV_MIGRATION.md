# 🔄 Vercel Environment Variables Migration Guide

**From Next.js (`NEXT_PUBLIC_*`) to Vite (`VITE_*`)**

---

## 📋 Quick Answer

**"Is Supabase connected to Vercel?"**

**YES!** Your Supabase credentials are in Vercel ✅  
**BUT** They use Next.js naming instead of Vite naming ❌  
**FIX** Rename 3 variables in 2 minutes ⚡

---

## 🎯 The Problem

Your Vercel environment variables use **Next.js format** (`NEXT_PUBLIC_*`) but your project uses **Vite** which requires `VITE_*` format.

### Current Variables (Don't Work)

```
❌ NEXT_PUBLIC_SUPABASE_URL
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY
❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
⚠️  SUPABASE_SECRET_KEY (not needed in frontend)
⚠️  POSTGRES_URL (not needed - using Supabase client)
⚠️  POSTGRES_PRISMA_URL (not needed - no Prisma)
```

### Required Variables (Will Work)

```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_SUPABASE_PROJECT_ID
```

---

## 🚀 Quick Fix (2 Minutes)

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables

2. **Add Variable #1**
   - Click "Add New"
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://wejiqqtwnhevcjdllodr.supabase.co`
   - Environment: Production, Preview, Development (select all)
   - Save

3. **Add Variable #2**
   - Click "Add New"
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (Copy from your `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable)
   - Environment: Production, Preview, Development (select all)
   - Save

4. **Add Variable #3**
   - Click "Add New"
   - Name: `VITE_SUPABASE_PROJECT_ID`
   - Value: `wejiqqtwnhevcjdllodr`
   - Environment: Production, Preview, Development (select all)
   - Save

5. **Redeploy**
   - Vercel will automatically trigger a redeploy
   - Wait ~2 minutes for deployment to complete

### Method 2: Vercel CLI (Fastest)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Link to project
vercel link

# Add environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://wejiqqtwnhevcjdllodr.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key from Supabase

vercel env add VITE_SUPABASE_PROJECT_ID production
# Enter: wejiqqtwnhevcjdllodr

# Repeat for preview and development environments
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_SUPABASE_PROJECT_ID preview

# Trigger redeploy
vercel --prod
```

### Method 3: Update vercel.json (Alternative)

Update your `vercel.json` file:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "https://wejiqqtwnhevcjdllodr.supabase.co",
    "VITE_SUPABASE_PROJECT_ID": "wejiqqtwnhevcjdllodr",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

Then add the secret via CLI:
```bash
vercel secrets add supabase-anon-key "your_actual_anon_key_here"
```

---

## 🧪 Testing After Migration

### Test 1: Check Environment Variables

After deployment completes:

1. Open your deployed application
2. Press `F12` to open Developer Tools
3. Go to Console tab
4. Type:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log(import.meta.env.VITE_SUPABASE_PROJECT_ID)
```

**Expected Result:**
- All three should show their values
- None should be `undefined`

### Test 2: Sign Up Flow

1. Go to your app's signup page
2. Try creating a new account
3. Should work without errors ✅

### Test 3: Network Requests

1. Open DevTools → Network tab
2. Try any database operation (signup, login, etc.)
3. Should see successful requests to `wejiqqtwnhevcjdllodr.supabase.co` ✅

### Test 4: No Console Errors

1. Open DevTools → Console tab
2. Should be clean with no Supabase errors ✅

---

## 🗑️ Cleanup (Optional)

These variables are safe to delete (not used by Vite):

```
DELETE:
❌ NEXT_PUBLIC_SUPABASE_URL (was for Next.js)
❌ NEXT_PUBLIC_SUPABASE_ANON_KEY (was for Next.js)
❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (duplicate of anon key)
❌ POSTGRES_URL (not needed - using Supabase client)
❌ POSTGRES_PRISMA_URL (not needed - no Prisma in this project)
❌ SUPABASE_SECRET_KEY (backend only, not for frontend)
```

**How to delete:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Environment Variables
3. Find each variable → Click "..." → Delete
4. Confirm deletion

---

## ❓ Why This Happened

You likely followed a **Next.js + Supabase** tutorial or documentation, but your project uses **Vite**.

### Framework Differences

| Framework | Environment Variable Prefix | Example |
|-----------|----------------------------|---------|
| **Next.js** | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_SUPABASE_URL` |
| **Vite** | `VITE_*` | `VITE_SUPABASE_URL` |
| **Create React App** | `REACT_APP_*` | `REACT_APP_SUPABASE_URL` |

Each framework has its own convention for exposing environment variables to the browser.

---

## 📊 Variable Explanations

### `VITE_SUPABASE_URL`

**Purpose:** The URL of your Supabase project  
**Value:** `https://wejiqqtwnhevcjdllodr.supabase.co`  
**Used For:** 
- Initializing Supabase client
- All API requests
- Real-time subscriptions

### `VITE_SUPABASE_ANON_KEY`

**Purpose:** Public/anonymous key for browser-side Supabase access  
**Value:** Get from Supabase Dashboard → Settings → API  
**Used For:**
- Client authentication
- Row Level Security (RLS) enforcement
- Public data access

**Security Note:** This key is safe to expose in browser because Supabase enforces Row Level Security policies.

### `VITE_SUPABASE_PROJECT_ID`

**Purpose:** Your Supabase project identifier  
**Value:** `wejiqqtwnhevcjdllodr`  
**Used For:**
- Project identification
- Some SDK features
- Edge function routing

---

## ⚠️ Troubleshooting

### Problem: Variables still show `undefined`

**Solution 1:** Clear build cache
```bash
# In Vercel dashboard
Deployments → Latest → ... → Redeploy → Clear cache and redeploy
```

**Solution 2:** Check variable names exactly
- Must be exactly `VITE_SUPABASE_URL` (case-sensitive)
- No extra spaces
- No typos

**Solution 3:** Restart dev server locally
```bash
# Kill dev server
# Restart
npm run dev
```

### Problem: Still getting Supabase connection errors

**Check:**
1. Variables are in correct environment (Production, Preview, Development)
2. Deployment has completed successfully
3. No typos in variable names
4. Values are correct (no trailing spaces)

**Solution:**
```bash
# Re-verify your Supabase credentials
# Go to Supabase Dashboard → Settings → API
# Compare anon key and URL
```

### Problem: Build fails after adding variables

**Check:**
1. `vercel.json` syntax is valid JSON
2. No trailing commas in JSON
3. Quotes are properly closed

**Solution:**
```bash
# Validate JSON
cat vercel.json | jq .
# If error, fix JSON syntax
```

### Problem: Variables work locally but not in production

**Reason:** Different environment variable files

**Solution:**
1. Ensure variables are added to **Production** environment in Vercel
2. Not just Preview or Development
3. Redeploy to production after adding

---

## ✅ Success Checklist

After migration, verify:

- [ ] All 3 `VITE_*` variables added to Vercel
- [ ] Variables set for all environments (Production, Preview, Development)
- [ ] Deployment completed successfully
- [ ] Browser console shows variable values (not `undefined`)
- [ ] Sign up/login works without errors
- [ ] Network tab shows successful Supabase requests
- [ ] No Supabase-related console errors
- [ ] (Optional) Old `NEXT_PUBLIC_*` variables deleted

---

## 💡 Pro Tips

### Tip 1: Use Environment-Specific Values

For better security, use different Supabase projects for different environments:

```
Production:
  VITE_SUPABASE_URL=https://prod-project.supabase.co
  
Preview:
  VITE_SUPABASE_URL=https://staging-project.supabase.co
  
Development:
  VITE_SUPABASE_URL=http://localhost:54321
```

### Tip 2: Use Vercel Secrets for Sensitive Data

For extra security:
```bash
vercel secrets add supabase-anon-key "your_key"
```

Then reference in `vercel.json`:
```json
"env": {
  "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
}
```

### Tip 3: Keep Local and Remote Synced

Update your local `.env` file to match:
```env
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
```

---

## 🔗 Related Documentation

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/initializing)
- [docs/SUPABASE_VERCEL_CONNECTION.md](./SUPABASE_VERCEL_CONNECTION.md) - Connection verification guide
- [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) - Backend setup guide

---

## 📞 Need Help?

If you're still having issues after following this guide:

1. Check [SUPABASE_VERCEL_CONNECTION.md](./SUPABASE_VERCEL_CONNECTION.md) for connection troubleshooting
2. Review [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) for complete deployment checklist
3. See [docs/VERCEL_TROUBLESHOOTING.md](./docs/VERCEL_TROUBLESHOOTING.md) for Vercel-specific issues

---

## ✨ Summary

**What You Had:** Supabase credentials with Next.js naming  
**What You Need:** Same credentials with Vite naming  
**Time to Fix:** 2 minutes  
**Difficulty:** ⭐ Easy  
**Impact:** Full Supabase functionality restored ✅

**Just rename those 3 variables and you're 100% connected!** 🚀

---

*Last Updated: 2026-02-10*
