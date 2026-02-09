# GitHub Actions Deployment to Vercel

This repository includes automated deployment to Vercel via GitHub Actions using `amondnet/vercel-action`.

## Overview

The workflow `.github/workflows/vercel-deploy.yml` automatically:
- ✅ Deploys the `main` branch to **production** on Vercel
- ✅ Deploys pull requests to **preview** environments with alias domains
- ✅ Comments on PRs with preview URLs and deployment info
- ✅ Creates GitHub deployments for tracking
- ✅ Supports custom alias domains per PR and branch

## Prerequisites

### Disable Vercel for GitHub Integration

To use GitHub Actions instead of Vercel's automatic deployments, disable the Vercel for GitHub integration:

1. **Create or update `vercel.json` in your project root:**

```json
{
  "version": 2,
  "github": {
    "enabled": false
  }
}
```

This prevents Vercel from auto-deploying when you push to GitHub.

### Skip Vercel's Build Step

Since we build in GitHub Actions, configure Vercel to skip its build:

**Method 1 - Via Vercel Dashboard:**
1. Go to Project Settings → General
2. Framework Preset: Select "Other"
3. Build Command: Enable override and leave empty
4. Output Directory: `dist`

**Method 2 - Via vercel.json:**

```json
{
  "version": 2,
  "github": {
    "enabled": false
  },
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ]
}
```

## Setup Instructions

### 1. Link Your Project to Vercel

Run locally in your project directory:

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
```
? Set up and deploy "~/legallyai-nexus"? [Y/n] y
? Which scope do you want to deploy to? [Your Organization]
? Link to existing project? [y/N] y
? What's the name of your existing project? legallyai-nexus
🔗 Linked to your-org/legallyai-nexus (created .vercel)
```

This creates a `.vercel/project.json` file containing:
```json
{
  "orgId": "your_org_id",
  "projectId": "your_project_id"
}
```

**Note:** Add `.vercel` to your `.gitignore` (already done in this repo).

### 2. Get Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name: "GitHub Actions Deploy"
4. Scope: Full Account (or specific team)
5. Copy the token immediately (shown only once)

### 3. Configure GitHub Secrets

Add these secrets to your repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value | Description |
|------------|-------|-------------|
| `VERCEL_TOKEN` | `vercel_xxxxx...` | From step 2 |
| `VERCEL_ORG_ID` | From `.vercel/project.json` | Your org/team ID |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | Your project ID |
| `VITE_SUPABASE_URL` | `https://wejiqqtwnhevcjdllodr.supabase.co` | Already configured |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key | Already configured |
| `VITE_SUPABASE_PROJECT_ID` | `wejiqqtwnhevcjdllodr` | Already configured |

### 4. Configure Vercel Environment Variables

In your Vercel project dashboard:

**Project Settings → Environment Variables**

Add these for **Production** and **Preview** environments:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://wejiqqtwnhevcjdllodr.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | `wejiqqtwnhevcjdllodr` |

**Important:** Do NOT add `VERCEL_AI_GATEWAY_KEY` here - it's only for Supabase Edge Functions.

## Workflow Features

### Production Deployment

**Triggers:** Push to `main` branch

**Behavior:**
- Builds the application with production env vars
- Deploys to Vercel with `--prod` flag
- Assigns to: `https://legallyai-nexus.vercel.app`
- Creates production deployment

### Preview Deployment  

**Triggers:** Pull request opened/updated

**Behavior:**
- Builds the application
- Deploys to preview environment
- Assigns alias: `pr-{NUMBER}.legallyai-nexus.vercel.app`
- Comments on PR with:
  - Preview URL
  - Deployment name
  - Commit SHA
- Updates comment on subsequent pushes

### Example PR Comment

```markdown
## 🚀 Vercel Deployment

Your PR has been successfully deployed to Vercel!

| Name | Link |
|------|------|
| 🔨 Latest commit | abc123... |
| 🔍 Preview URL | https://pr-42.legallyai-nexus.vercel.app |
| 📝 Deployment Name | legallyai-nexus-abc123 |

---
*Powered by Vercel via GitHub Actions*
```

## Custom Alias Domains

The workflow supports custom domain aliases using variables:

```yaml
alias-domains: |
  pr-{{PR_NUMBER}}.legallyai-nexus.vercel.app
  {{BRANCH}}.legallyai-nexus.vercel.app
```

**Variables:**
- `{{PR_NUMBER}}` - PR number
- `{{BRANCH}}` - Branch name
- `{{USER}}` - Repository owner
- `{{REPO}}` - Repository name
- `{{SHA}}` - Commit SHA

**Note:** Wildcard domains (e.g., `*.legallyai-nexus.vercel.app`) must be configured in Vercel first.

## Manual Deployment

Deploy manually using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Failures

**Check GitHub Actions logs:**
1. Go to Actions tab in repository
2. Click failed workflow run
3. Expand "Build application" step

**Common issues:**
- Missing environment variables in GitHub Secrets
- Build script errors
- Node.js version mismatch (should be 18+)

### Deployment Not Triggered

1. Verify workflow file exists: `.github/workflows/vercel-deploy.yml`
2. Check GitHub Actions is enabled (Settings → Actions → General)
3. Ensure commit doesn't contain `[skip ci]`
4. Verify branch name is `main` (not `master`)

### Preview URL Not Commenting

1. Ensure `GITHUB_TOKEN` has proper permissions
2. Check workflow has `pull_request` event trigger
3. Verify `github-comment: true` in workflow
4. Review Actions logs for API errors

### Vercel Token Invalid

1. Token may have expired - create a new one
2. Ensure token has correct scope (team vs. personal)
3. Check `VERCEL_ORG_ID` matches token's organization

### Build Succeeds but Deployment Fails

1. Verify `dist` directory is created by build
2. Check `vercel.json` configuration
3. Ensure Vercel project is linked correctly
4. Check Vercel project limits (free tier restrictions)

## Advanced Configuration

### Skip CI for Specific Commits

Add `[skip ci]` to commit message:

```bash
git commit -m "Update README [skip ci]"
```

### Deploy Specific Branch to Production

Modify workflow trigger:

```yaml
on:
  push:
    branches:
      - main
      - production  # Add another branch
```

### Custom Build Commands

Add build steps before deployment:

```yaml
- name: Run tests
  run: npm test

- name: Build application
  run: npm run build:production
```

### Environment-Specific Configuration

Use different env vars per environment:

```yaml
- name: Build application
  env:
    VITE_API_URL: ${{ github.ref == 'refs/heads/main' && secrets.PROD_API_URL || secrets.DEV_API_URL }}
  run: npm run build
```

## Monitoring & Logs

### View Deployments

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** Repository → Actions tab  
- **GitHub Deployments:** Repository → Deployments

### Access Logs

- **Build logs:** GitHub Actions → Workflow run → Build step
- **Runtime logs:** Vercel Dashboard → Project → Deployments → Function logs
- **Edge function logs:** Supabase Dashboard → Edge Functions

## Security Best Practices

✅ **Implemented:**
- API keys stored as GitHub Secrets (encrypted at rest)
- Vercel token has minimal required scope
- Preview deployments isolated per PR
- Environment variables not logged in Actions
- `.vercel` directory in `.gitignore`

❌ **Never commit:**
- `.vercel/` directory
- Vercel tokens
- API keys
- `.env` files with real values

## Performance Optimization

### Build Caching

The workflow uses npm cache for faster installs:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Caches node_modules
```

### Vercel Edge Network

Deployments are automatically distributed to Vercel's edge network for low latency worldwide.

### Build Time Optimization

Current build steps:
1. npm ci (~30s with cache)
2. npm run build (~60s)
3. Vercel deploy (~20s)

Total: ~2 minutes per deployment

## Cost Considerations

### Free Tier Limits (Vercel Hobby)

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function execution
- ⚠️ No custom domains on preview (use Vercel subdomains)

### Pro Tier Benefits

- Custom domains on preview
- Team collaboration
- Advanced analytics
- Higher limits

## Related Documentation

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [amondnet/vercel-action](https://github.com/amondnet/vercel-action)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)

---

**Last Updated:** 2026-02-09  
**Workflow:** `.github/workflows/vercel-deploy.yml`

