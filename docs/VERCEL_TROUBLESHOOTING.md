# Vercel Deployment Troubleshooting Guide

## 🚨 Issue: "Vercel cannot access repository"

This guide helps you resolve common Vercel deployment issues when connecting to your GitHub repository.

---

## Quick Diagnosis

**Repository:** `https://github.com/Legallyai-1/legallyai-nexus-4b3048fb`

### Common Causes & Solutions

---

## 🔐 Solution 1: Grant Vercel Access to Your GitHub Account

### Step-by-Step Instructions:

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/installations
   - Or navigate to: Settings → Applications → Installed GitHub Apps

2. **Find Vercel in Installed Apps**
   - Look for "Vercel" in the list of installed applications
   - If not installed, you need to install it first

3. **Configure Repository Access**
   - Click on "Vercel" → "Configure"
   - Under "Repository access", you have two options:
     - ✅ **All repositories** (easiest, gives Vercel access to all your repos)
     - ✅ **Only select repositories** (more secure, select specific repos)
   
4. **Add This Repository**
   - If using "Only select repositories":
     - Click the dropdown
     - Find and select: `Legallyai-1/legallyai-nexus-4b3048fb`
     - Click "Save"

5. **Return to Vercel**
   - Go back to your Vercel dashboard
   - Try importing the repository again

---

## 🔓 Solution 2: Make Repository Public (If Private)

### Check Repository Visibility:

1. **Go to Repository Settings**
   - Visit: https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/settings
   
2. **Check Visibility**
   - Scroll to bottom of settings page
   - Look for "Danger Zone" section
   - Check if repository is Private or Public

3. **Make Public (Optional)**
   - If the repo is Private and you want to make it Public:
     - Click "Change visibility"
     - Select "Make public"
     - Confirm the action
   
   ⚠️ **Note:** Only make public if you're comfortable with code being visible to everyone

---

## 🔗 Solution 3: Use Direct Import Method

### Import via Vercel Dashboard:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new

2. **Import Git Repository**
   - Click "Import Git Repository"
   - If asked to install Vercel on GitHub:
     - Click "Install Vercel"
     - Select your GitHub account: `Legallyai-1`
     - Grant access to the repository

3. **Enter Repository URL**
   - Paste: `https://github.com/Legallyai-1/legallyai-nexus-4b3048fb`
   - Click "Continue"

4. **Configure Project**
   - Project Name: `legallyai-nexus` (or your preferred name)
   - Framework Preset: `Vite` (should auto-detect)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-configured)
   - Output Directory: `dist` (auto-configured)

5. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
   VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```
   ⚠️ **Important:** You need to add your actual `VITE_SUPABASE_ANON_KEY`

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)

---

## 🔄 Solution 4: Re-authenticate Vercel with GitHub

### Steps to Reconnect:

1. **Disconnect Vercel from GitHub**
   - Go to: https://github.com/settings/applications
   - Find "Vercel" under "Authorized OAuth Apps"
   - Click "Revoke"

2. **Reconnect on Vercel**
   - Go to: https://vercel.com/login
   - Click "Continue with GitHub"
   - Authorize Vercel again
   - Grant repository access when prompted

3. **Try Deployment Again**
   - Return to Vercel dashboard
   - Import the repository

---

## 🛠️ Solution 5: Deploy via Vercel CLI

If web interface doesn't work, use the CLI:

### Install Vercel CLI:

```bash
npm install -g vercel
```

### Deploy from Command Line:

```bash
# Navigate to your project
cd /path/to/legallyai-nexus-4b3048fb

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? legallyai-nexus
# - Directory? ./
# - Override settings? No
```

### Set Environment Variables:

```bash
vercel env add VITE_SUPABASE_URL
# Enter: https://wejiqqtwnhevcjdllodr.supabase.co

vercel env add VITE_SUPABASE_PROJECT_ID
# Enter: wejiqqtwnhevcjdllodr

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: your_actual_anon_key
```

### Deploy to Production:

```bash
vercel --prod
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] You have a Vercel account (free tier works)
- [ ] You're logged into GitHub
- [ ] You're logged into Vercel
- [ ] Vercel has access to your GitHub account
- [ ] The repository exists and is accessible
- [ ] You have the correct Supabase credentials
- [ ] `vercel.json` is present in the repository ✅ (already configured)
- [ ] `package.json` has build scripts ✅ (already configured)

---

## 🔍 Verify Current Configuration

### Check `vercel.json`:

Your repository already has a properly configured `vercel.json`:

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
    "VITE_SUPABASE_PROJECT_ID": "wejiqqtwnhevcjdllodr"
  }
}
```

✅ **This is correct!** No changes needed to `vercel.json`.

---

## 🎯 Most Likely Solution

Based on the error "Vercel cannot access repository", the most common fix is:

### **Grant Vercel Access via GitHub Settings**

1. Go to: https://github.com/settings/installations
2. Click "Configure" next to Vercel
3. Select "Only select repositories"
4. Add: `Legallyai-1/legallyai-nexus-4b3048fb`
5. Click "Save"
6. Return to Vercel and try again

---

## 📞 Still Having Issues?

If none of the above solutions work:

### Check Vercel Status:
- Visit: https://www.vercel-status.com/
- Ensure Vercel services are operational

### Check GitHub Status:
- Visit: https://www.githubstatus.com/
- Ensure GitHub API is working

### Contact Support:
- Vercel Support: https://vercel.com/support
- Include error message and repository URL

---

## ✅ Success Indicators

After successful deployment, you should see:

1. **Vercel Dashboard:**
   - Project listed in your dashboard
   - Deployment status: "Ready"
   - Green checkmark on deployment

2. **Live URL:**
   - Format: `https://legallyai-nexus-4b3048fb.vercel.app`
   - Or custom domain if configured

3. **Environment Variables:**
   - All three Supabase variables set
   - Visible in project settings

4. **Deployment Logs:**
   - Build succeeded
   - No errors in logs

---

## 🚀 After Successful Deployment

### Test Your Application:

1. Visit your Vercel URL
2. Check that the app loads correctly
3. Test Supabase connection
4. Verify all features work

### Set Up Automatic Deployments:

- Every push to `main` branch will auto-deploy
- Pull request previews are automatically created
- Configure in: Project Settings → Git

### Add Custom Domain (Optional):

1. Go to: Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub App Installation Guide](https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-in-your-organization)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Repository Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated:** 2026-02-09  
**Repository:** https://github.com/Legallyai-1/legallyai-nexus-4b3048fb
