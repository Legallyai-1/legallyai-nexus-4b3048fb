# Deployment Guide

## Vercel (Recommended)

### One-Click Deploy
1. Click the "Deploy to Vercel" button in README
2. Connect your GitHub account
3. Add environment variables:
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Manual Deploy
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Auto-Deploy Setup
1. Connect repo to Vercel
2. Every git push to `main` auto-deploys
3. Preview URLs for every PR

## Netlify

### One-Click Deploy
1. Click "Deploy to Netlify" button
2. Connect GitHub
3. Add environment variables
4. Deploy!

### Manual Deploy
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Custom Server

### Build
```bash
npm run build
```

### Serve
```bash
npm install -g serve
serve -s dist -p 3000
```

## Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `legallyai.ai`)
3. Update DNS records as shown
4. Wait for SSL certificate

### Netlify
1. Domain Settings → Add domain
2. Update DNS records
3. Enable HTTPS

## Environment Variables

### Production
```env
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
```

### Preview/Staging
```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key
VITE_SUPABASE_PROJECT_ID=your_staging_id
```

## CI/CD

GitHub Actions automatically:
- ✅ Runs tests on every PR
- ✅ Builds preview for every PR
- ✅ Deploys to production on merge to `main`
- ✅ Runs security scans

## Monitoring

- **Uptime:** Use Vercel Analytics or UptimeRobot
- **Errors:** Sentry integration (optional)
- **Performance:** Vercel Speed Insights

## Rollback

### Vercel
```bash
vercel rollback
```

### Netlify
1. Deploys → Select previous deploy
2. Click "Publish deploy"
