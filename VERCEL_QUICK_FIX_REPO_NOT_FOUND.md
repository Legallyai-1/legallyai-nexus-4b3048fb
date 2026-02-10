# 🔧 QUICK FIX: Vercel Can't Find Repository

## The Problem
Vercel doesn't show your repository in the import list.

## The Solution (5 Minutes)

### Step 1: Grant Vercel Access to GitHub

**This is the #1 most common issue!**

1. **Go to GitHub Settings**:
   - Open: https://github.com/settings/installations
   - OR: GitHub → Settings → Applications → Installed GitHub Apps

2. **Find "Vercel"** in the list

3. **Click "Configure"** next to Vercel

4. **Grant Access**:
   - Scroll down to "Repository access"
   - Select either:
     - **"All repositories"** (easiest, if you're okay with this)
     - **"Only select repositories"** → Click "Select repositories" → Choose `legallyai-nexus-4b3048fb`

5. **Click "Save"** at the bottom

6. **Go back to Vercel** and refresh - your repo should now appear!

---

## Alternative Solutions

### Option 2: Make Repository Public (If Applicable)

If your repo is private and you want it public:

1. Go to: https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/settings
2. Scroll to bottom → "Danger Zone"
3. Click "Change visibility" → "Make public"
4. Confirm

**Note**: Only do this if you're comfortable with the code being public.

---

### Option 3: Re-authenticate Vercel with GitHub

1. **In Vercel Dashboard**:
   - Go to: https://vercel.com/dashboard
   - Click your profile (bottom left)
   - Go to "Settings"

2. **Connected Accounts**:
   - Find "GitHub"
   - Click "Disconnect" (if connected)
   - Click "Connect" to reconnect

3. **Authorize Vercel**:
   - You'll be redirected to GitHub
   - Click "Authorize Vercel"
   - Make sure to grant access to your repositories

4. **Try importing again**

---

### Option 4: Use Direct Import Method

If the repo still doesn't show, use direct import:

1. **Get Your Repository URL**:
   ```
   https://github.com/Legallyai-1/legallyai-nexus-4b3048fb
   ```

2. **In Vercel**:
   - Go to: https://vercel.com/new
   - Look for "Import Git Repository"
   - Paste your repo URL in the search box
   - Click "Import"

3. **If prompted for access**:
   - Click "Adjust GitHub App Permissions"
   - Follow the prompts to grant access

---

### Option 5: Use Vercel CLI (Bypass GitHub Integration)

**This works even if GitHub integration has issues:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd /home/runner/work/legallyai-nexus-4b3048fb/legallyai-nexus-4b3048fb
vercel link

# Deploy
vercel --prod
```

**Follow the prompts**:
- Set up and deploy? **Yes**
- Which scope? Choose your account/team
- Link to existing project? **No** (create new)
- What's your project's name? `legallyai-nexus`
- In which directory is your code? `./` (current directory)
- Want to override settings? **No**

This creates the project and deploys it without needing the GitHub integration!

---

## Step-by-Step: Full Verification

### 1. Verify GitHub Integration

```bash
# Check if Vercel has access
# Go to: https://github.com/settings/installations
# Find "Vercel" and click "Configure"
# Verify your repo is listed
```

### 2. Check Repository Visibility

```bash
# Check if repo is public or private
# Go to: https://github.com/Legallyai-1/legallyai-nexus-4b3048fb
# Look for "Public" or "Private" badge near the repo name
```

### 3. Verify Vercel Account

```bash
# Make sure you're logged into the correct Vercel account
# Go to: https://vercel.com/dashboard
# Check the account name in bottom-left corner
# Should match the owner of the GitHub repo
```

---

## Why This Happens

**Common Reasons**:

1. **Permissions Not Granted** (90% of cases)
   - Vercel GitHub App doesn't have access to your repo
   - Fix: Grant access in GitHub settings (Option 1 above)

2. **Private Repository** (5% of cases)
   - Vercel can't see private repos without explicit permission
   - Fix: Grant access or make repo public

3. **Wrong Account** (3% of cases)
   - You're logged into different GitHub/Vercel accounts
   - Fix: Make sure accounts match

4. **New Repository** (2% of cases)
   - Repository was just created and Vercel hasn't refreshed
   - Fix: Wait 5 minutes or disconnect/reconnect GitHub

---

## Quick Diagnostic

Run these checks:

✅ **Is the repo on GitHub?**
- Visit: https://github.com/Legallyai-1/legallyai-nexus-4b3048fb
- Should load without 404 error

✅ **Do you own this repo?**
- Check the owner: `Legallyai-1`
- Are you logged into GitHub as this user/org?

✅ **Is Vercel connected to GitHub?**
- Check: https://vercel.com/dashboard (look for GitHub icon)
- Should show "Connected to GitHub"

✅ **Does Vercel have repo access?**
- Check: https://github.com/settings/installations
- Find Vercel → should list your repo

---

## After You Fix It

Once Vercel can see the repo:

1. **Import the Project**:
   - Click "Import" in Vercel
   - Select your repo

2. **Configure Build Settings**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL = https://wejiqqtwnhevcjdllodr.supabase.co
   VITE_SUPABASE_PROJECT_ID = wejiqqtwnhevcjdllodr
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Get your live URL!

---

## Still Not Working?

### Check These:

1. **Browser Cache**:
   - Clear cache and reload Vercel
   - Try incognito/private mode

2. **Different Browser**:
   - Try Chrome, Firefox, or Safari
   - Sometimes browser extensions block GitHub integration

3. **Vercel Support**:
   - Chat: https://vercel.com/support
   - Status: https://www.vercel-status.com/

4. **GitHub Status**:
   - Check: https://www.githubstatus.com/
   - Make sure GitHub API is operational

---

## Summary: The 2-Minute Fix

**Most likely fix (works 90% of the time)**:

1. Go to https://github.com/settings/installations
2. Find "Vercel" → Click "Configure"
3. Add repository: `Legallyai-1/legallyai-nexus-4b3048fb`
4. Save
5. Refresh Vercel dashboard
6. Repository should now appear!

---

## Need More Help?

See complete troubleshooting guide:
- `docs/VERCEL_TROUBLESHOOTING.md`
- `DEPLOYMENT_READY.md`

Or use Vercel CLI method (Option 5 above) which bypasses GitHub integration entirely!
