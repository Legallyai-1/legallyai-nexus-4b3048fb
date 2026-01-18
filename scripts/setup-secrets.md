# GitHub Secrets Setup Guide

## Required Secrets

Add these secrets to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. VITE_SUPABASE_PROJECT_ID
- **Value**: `wejiqqtwnhevcjdllodr`
- **Description**: Your Supabase project reference ID

### 2. VITE_SUPABASE_PUBLISHABLE_KEY
- **Value**: Your Supabase anon/publishable key
- **Get it from**: Supabase Dashboard → Project Settings → API → anon public
- **Note**: This is a public key safe to use in client-side code

### 3. VITE_SUPABASE_URL
- **Value**: `https://wejiqqtwnhevcjdllodr.supabase.co`
- **Description**: Your Supabase project URL

### 4. SUPABASE_ACCESS_TOKEN
- **Value**: Generate from https://app.supabase.com/account/tokens
- **Description**: Personal access token for Supabase CLI
- **Required for**: Database migrations and function deployments

## Quick Setup with GitHub CLI

```bash
# Make sure you have GitHub CLI installed and authenticated
gh auth login

# Set secrets (replace values with your actual secrets)
gh secret set VITE_SUPABASE_PROJECT_ID --body "wejiqqtwnhevcjdllodr"
gh secret set VITE_SUPABASE_PUBLISHABLE_KEY --body "YOUR_ANON_KEY_HERE"
gh secret set VITE_SUPABASE_URL --body "https://wejiqqtwnhevcjdllodr.supabase.co"
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_ACCESS_TOKEN_HERE"
```

## How to Get Supabase Access Token

1. Go to https://app.supabase.com/account/tokens
2. Click "Generate new token"
3. Give it a name like "GitHub Actions"
4. Copy the token (you won't see it again!)
5. Add it as `SUPABASE_ACCESS_TOKEN` secret

## Important Notes

**Service Role Key**: Edge Functions automatically have access to `SUPABASE_SERVICE_ROLE_KEY` at runtime. This is injected by Supabase and does not need to be configured in GitHub Secrets.

**Security**: Never commit actual secret values to the repository. Only the `.env.example` file with placeholder values should be committed.

## Verify Setup

After adding secrets, push to main branch and check:
- GitHub Actions tab for workflow runs
- Workflow should complete successfully
- Build artifacts should be generated
