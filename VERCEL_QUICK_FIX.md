# Quick Fix: Vercel Can't Access Repository

## 🚨 Problem
Vercel shows: "Cannot access repository" or "Repository not found"

## ✅ Fastest Solution (2 minutes)

### Step 1: Grant Vercel Access
1. Open: https://github.com/settings/installations
2. Find "Vercel" → Click "Configure"
3. Under "Repository access":
   - Select "Only select repositories"
   - Add: `Legallyai-1/legallyai-nexus-4b3048fb`
4. Click "Save"

### Step 2: Return to Vercel
1. Go back to Vercel dashboard
2. Click "Import Project"
3. Paste: `https://github.com/Legallyai-1/legallyai-nexus-4b3048fb`
4. Click "Continue"

### Step 3: Configure & Deploy
1. Add these environment variables:
   ```
   VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
   VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
   VITE_SUPABASE_ANON_KEY=your_actual_key_here
   ```
2. Click "Deploy"

## 🎯 Done!

Your app will be live at: `https://legallyai-nexus-4b3048fb.vercel.app`

---

## 📖 Need More Help?

See full guide: [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md)

## 🔑 Don't Have Your Supabase Key?

1. Go to: https://supabase.com/dashboard
2. Select your project: `wejiqqtwnhevcjdllodr`
3. Go to: Settings → API
4. Copy the "anon public" key
5. Paste it as `VITE_SUPABASE_ANON_KEY` in Vercel

---

**Repository:** https://github.com/Legallyai-1/legallyai-nexus-4b3048fb
