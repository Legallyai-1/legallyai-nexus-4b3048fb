# Deployment Guide

This guide covers deploying LegallyAI to production.

## Prerequisites

- Supabase project set up (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- GitHub repository
- Domain name (optional)

---

## Deploy to Vercel

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Environment Variables

Add these in project settings:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 3. Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL

### 4. Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate (~24 hours)

---

## Deploy to Netlify

### 1. Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose your GitHub repository

### 2. Configure Build Settings

Build settings are already in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`

### 3. Environment Variables

Add in Site settings → Environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 4. Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Visit your deployment URL

---

## GitHub Actions (CI/CD)

The repository includes GitHub Actions for automated deployment.

### Setup

1. Add GitHub secrets (Settings → Secrets):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_ACCESS_TOKEN`

2. Push to main branch triggers:
   - Build
   - Tests
   - Supabase migrations
   - Edge function deployment

---

## Post-Deployment

### 1. Verify Deployment

- [ ] Website loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Edge functions respond

### 2. Configure DNS

Point your domain to:
- Vercel: Follow Vercel DNS instructions
- Netlify: Follow Netlify DNS instructions

### 3. Enable Analytics

Add Google Analytics (see [MONETIZATION.md](./MONETIZATION.md))

### 4. Monitor

- Set up uptime monitoring
- Configure error tracking
- Monitor performance metrics

---

## Troubleshooting

**Build Failures:**
- Check environment variables
- Verify Node.js version
- Review build logs

**Runtime Errors:**
- Check browser console
- Verify API keys
- Test Supabase connection

---

**Next:** [Configure Monetization](./MONETIZATION.md)
