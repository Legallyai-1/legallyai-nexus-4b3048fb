# Automatic Secret Synchronization to Vercel

This repository automatically syncs GitHub Secrets to Vercel environment variables, eliminating manual configuration and keeping deployments in sync.

## How It Works

The workflow automatically syncs secrets prefixed with `VITE_` to your Vercel project whenever you push to the main branch.

**Workflow:** `.github/workflows/vercel-deploy.yml`

```yaml
sync-secrets:
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  
  steps:
    - uses: itstor/sync-secrets-to-vercel@v1
      with:
        prefix: 'VITE_'
        environments: 'production,preview'
        project: ${{ secrets.VERCEL_PROJECT_ID }}
        team_id: ${{ secrets.VERCEL_ORG_ID }}
        token: ${{ secrets.VERCEL_TOKEN }}
        secrets: '${{ toJSON(secrets) }}'
        cancel_on_fail: false
```

## What Gets Synced

### Automatic Sync (VITE_ prefix)

All secrets starting with `VITE_` are automatically synced to Vercel:

| GitHub Secret | → | Vercel Environment Variable |
|---------------|---|----------------------------|
| `VITE_SUPABASE_URL` | → | `VITE_SUPABASE_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | → | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `VITE_SUPABASE_PROJECT_ID` | → | `VITE_SUPABASE_PROJECT_ID` |
| `VITE_*` (any) | → | `VITE_*` (same name) |

### NOT Synced (Different prefixes)

These secrets are NOT synced to Vercel (they're for GitHub Actions only):

- `VERCEL_*` - Vercel API credentials
- `SUPABASE_ACCESS_TOKEN` - Supabase Management API
- `OPENAI_API_KEY` - OpenAI for embeddings
- `GITHUB_TOKEN` - GitHub Actions token

## Target Environments

Secrets are synced to both Vercel environments:
- ✅ **Production** - Used for main branch deployments
- ✅ **Preview** - Used for PR preview deployments

This ensures consistency across all deployments.

## When Sync Happens

**Automatic Triggers:**
- ✅ Push to `main` branch
- ✅ Manual workflow dispatch

**Does NOT trigger on:**
- ❌ Pull requests (to avoid unnecessary syncs)
- ❌ Other branches

## Adding New Secrets

### 1. Add to GitHub

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

**Name:** `VITE_YOUR_NEW_SECRET`  
**Value:** Your secret value

### 2. Trigger Sync

**Option A - Automatic (Recommended):**
```bash
git commit --allow-empty -m "Trigger secret sync"
git push origin main
```

**Option B - Manual:**
1. Go to Actions tab
2. Select "Deploy to Vercel"
3. Click "Run workflow"
4. Select main branch
5. Run

### 3. Verify in Vercel

1. Go to Vercel project dashboard
2. Settings → Environment Variables
3. Check `VITE_YOUR_NEW_SECRET` appears in:
   - Production
   - Preview

## Removing Secrets

### 1. Delete from GitHub

```
Repository → Settings → Secrets → Select secret → Delete
```

### 2. Delete from Vercel

**Option A - Manual:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Find the variable
3. Click Delete (for both Production and Preview)

**Option B - Automatic (on next deploy):**
- Secret will be removed on next sync if deleted from GitHub

## Configuration Options

### Change Prefix

To sync different secrets, modify the workflow:

```yaml
# Sync PROD_ secrets
with:
  prefix: 'PROD_'  # PROD_API_KEY → API_KEY
```

### Different Environments

```yaml
# Sync only to production
with:
  environments: 'production'

# Sync to all environments
with:
  environments: 'production,preview,development'
```

### Strict Mode

```yaml
# Fail workflow if any secret fails to sync
with:
  cancel_on_fail: true  # Default: false
```

## Current Configuration

**Prefix:** `VITE_`  
**Target Environments:** `production,preview`  
**Fail on Error:** `false` (continues even if one secret fails)  
**Trigger:** Push to main branch only

## Security Considerations

### ✅ Safe Practices

1. **Secrets never exposed in logs** - GitHub Actions masks secret values
2. **Only VITE_* synced** - Backend secrets stay in GitHub
3. **Vercel-only deployment** - Secrets only go to Vercel
4. **Access controlled** - Requires valid VERCEL_TOKEN

### ⚠️ Important Notes

1. **VITE_ prefix = Public:** Vite exposes `VITE_*` variables to the browser
   - Only put non-sensitive data in `VITE_*` secrets
   - Never put API keys, passwords, or tokens in `VITE_*`

2. **Service role keys = Private:** Keep these in GitHub ONLY
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `VERCEL_TOKEN`

3. **Backend secrets:** Use Supabase Edge Functions for server-side secrets
   - Set via Supabase CLI: `supabase secrets set KEY=value`
   - NOT in Vercel environment variables

## Troubleshooting

### Secrets Not Syncing

**Check:**
1. Secret name starts with `VITE_`
2. Workflow ran successfully (Actions tab)
3. No errors in sync-secrets job
4. Vercel token is valid

**Fix:**
```bash
# Manually trigger sync
gh workflow run vercel-deploy.yml
```

### Sync Failed for One Secret

**Check workflow logs:**
```
Actions → Deploy to Vercel → sync-secrets → Sync production secrets
```

**Common issues:**
- Secret name has invalid characters
- Value too large (Vercel limit: 256KB)
- Rate limit hit (wait and retry)

**Fix:**
- Workflow continues (`cancel_on_fail: false`)
- Failed secret must be set manually in Vercel
- Or fix issue and re-run workflow

### Wrong Environment

**Verify in Vercel:**
1. Project Settings → Environment Variables
2. Check which environments have the variable
3. Edit if needed

**Note:** Workflow syncs to both production and preview by default

## Manual Sync

If you need to sync secrets without a deployment:

**Via GitHub Actions:**
```
Actions → Deploy to Vercel → Run workflow
```

**Via CLI (if configured):**
```bash
gh workflow run vercel-deploy.yml --ref main
```

## Monitoring

### View Sync Status

**GitHub Actions:**
```
Repository → Actions → Deploy to Vercel → Latest run → sync-secrets
```

**Check for:**
- ✅ Green checkmark = All secrets synced
- ⚠️ Yellow = Some secrets failed (check logs)
- ❌ Red = Sync job failed (check logs)

### Verify in Vercel

**Dashboard:**
```
Project → Settings → Environment Variables
```

**Expected:**
- All `VITE_*` secrets present
- Same values in Production & Preview
- Updated timestamp matches last sync

## Best Practices

### 1. Naming Convention

```
✅ VITE_SUPABASE_URL           # Clear, prefixed
✅ VITE_APP_NAME               # Clear purpose
❌ MY_SECRET                   # Won't sync (no VITE_)
❌ VITE_SERVICE_ROLE_KEY       # Don't expose sensitive keys!
```

### 2. Secret Organization

**Frontend (VITE_):**
- API URLs
- Public keys
- App configuration
- Feature flags

**Backend (No VITE_):**
- Service role keys
- API secrets
- Admin tokens
- Database passwords

### 3. Update Process

1. Add secret to GitHub
2. Push to main (triggers sync)
3. Verify in Vercel dashboard
4. Deploy uses new secret automatically

### 4. Environment Parity

- Keep secrets consistent across environments
- Test with preview environment first
- Promote to production when ready

## FAQ

**Q: Do I need to restart Vercel deployments after sync?**  
A: No, next deployment automatically uses new values.

**Q: Can I sync to multiple Vercel projects?**  
A: Not with one workflow. Create separate workflows for each project.

**Q: What if sync fails?**  
A: Workflow continues (`cancel_on_fail: false`). Set failed secrets manually.

**Q: How do I know what synced?**  
A: Check workflow logs or Vercel environment variables page.

**Q: Can I sync all secrets without prefix?**  
A: Yes, set `prefix: ''` but not recommended for security.

## Related Documentation

- [GitHub Actions Vercel Deployment](./GITHUB_ACTIONS_VERCEL.md)
- [API Keys Inventory](./API_KEYS_INVENTORY.md)
- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)

---

**Last Updated:** 2026-02-09  
**Workflow:** `.github/workflows/vercel-deploy.yml`  
**Action:** `itstor/sync-secrets-to-vercel@v1`
