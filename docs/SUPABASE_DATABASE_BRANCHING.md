# Supabase Database Branching for Pull Requests

This repository uses Supabase Database Branching to create isolated preview databases for each pull request, enabling safe testing of schema changes and migrations.

## Overview

**Database Branching** creates a complete copy of your production database for each PR:
- ✅ Isolated testing environment
- ✅ Safe schema changes and migrations
- ✅ No impact on production data
- ✅ Automatic cleanup when PR closes
- ✅ Full Supabase services (Auth, Storage, Edge Functions)

## How It Works

### For Pull Requests

1. **Branch Created**: When you open a PR, GitHub Actions creates a Supabase preview branch
2. **Database Copied**: Your production schema and data are copied to the preview instance
3. **Migrations Applied**: Any new migrations in your PR are automatically applied
4. **Build & Test**: Your app builds against the preview database
5. **PR Comment**: Bot comments with preview database credentials
6. **Cleanup**: Preview branch is deleted when PR is merged/closed

### For Main Branch

1. **Direct Deployment**: Pushes to `main` deploy directly to production
2. **Migrations**: Database migrations are applied to production
3. **Functions**: Edge functions are deployed
4. **No Branching**: No preview branch is created

## Setup

### Prerequisites

Supabase Database Branching is available on:
- **Pro Plan** and above
- Enable in: Supabase Dashboard → Settings → Branching

### Enable Branching

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Settings → Branching

2. **Enable Database Branching**
   - Toggle "Enable database branching"
   - Review and accept the pricing
   - Save changes

3. **Configure GitHub Integration (Optional)**
   - Connect your GitHub repository
   - Configure auto-branch creation

### Required GitHub Secrets

The workflow requires these secrets (most already configured):

| Secret | Description | Status |
|--------|-------------|--------|
| `SUPABASE_ACCESS_TOKEN` | Management API token | Already configured |
| `VITE_SUPABASE_PROJECT_ID` | Project ID | Already configured |
| `VITE_SUPABASE_URL` | Production URL | Already configured |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Production anon key | Already configured |

## Workflow Configuration

The workflow is configured in `.github/workflows/supabase-deploy.yml`:

### Preview Database Job

```yaml
preview-database:
  if: github.event_name == 'pull_request'
  steps:
    - uses: 0xbigboss/supabase-branch-gh-action@v1
      id: supabase-branch
      with:
        supabase-access-token: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        supabase-project-id: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
        wait-for-migrations: true
        timeout: 120
```

**Key Features:**
- Only runs for pull requests
- Waits up to 120 seconds for migrations
- Outputs database credentials for testing

### Build Job

```yaml
build-and-deploy:
  needs: [preview-database]
  steps:
    - name: Build application
      env:
        # Uses preview URL for PRs, production for main
        VITE_SUPABASE_URL: ${{ github.event_name == 'pull_request' && needs.preview-database.outputs.api-url || secrets.VITE_SUPABASE_URL }}
```

## PR Comment Example

When a preview database is created, you'll see a comment like:

```markdown
## 🗄️ Supabase Preview Database

A preview database has been created for this PR!

| Property | Value |
|----------|-------|
| 🔗 API URL | `https://abc123.supabase.co` |
| 📊 GraphQL | `https://abc123.supabase.co/graphql/v1` |
| 🔑 Database | `db.abc123.supabase.co` |

**Note:** Credentials are available as workflow outputs for testing.

This preview database will be automatically cleaned up when the PR is closed.
```

## Testing with Preview Database

### Access Preview Credentials

Preview database credentials are available in:
1. **PR Comment** - API URL and GraphQL endpoint
2. **Workflow Outputs** - All credentials (masked in logs)
3. **Supabase Dashboard** - View all preview branches

### Testing Migrations

**Example PR workflow:**

1. Create a PR with a new migration:
```sql
-- supabase/migrations/20260209_add_embeddings.sql
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1536)
);
```

2. GitHub Actions will:
   - Create preview database
   - Apply the migration
   - Build app with preview database
   - Comment on PR

3. Test your changes:
   - Review migration in preview database
   - Test app functionality
   - Verify no breaking changes

4. Merge PR:
   - Migration applies to production
   - Preview database is deleted

### Manual Testing

You can manually test the preview database:

```bash
# Get preview URL from PR comment
PREVIEW_URL="https://abc123.supabase.co"
PREVIEW_KEY="preview_anon_key_from_workflow"

# Test API connection
curl "$PREVIEW_URL/rest/v1/" \
  -H "apikey: $PREVIEW_KEY" \
  -H "Authorization: Bearer $PREVIEW_KEY"
```

## Cost Considerations

### Preview Branch Pricing

**Supabase Pro Plan:**
- Preview branches: Included
- Compute: Free for first 2 hours
- After 2 hours: ~$0.01344/hour per branch
- Storage: Minimal (only delta from production)

### Optimization Tips

1. **Auto-cleanup**: Preview branches delete automatically when PR closes
2. **Limit active PRs**: Close stale PRs to reduce costs
3. **Fast reviews**: Review PRs quickly to minimize compute time
4. **Use pause**: Preview databases auto-pause after inactivity

### Example Monthly Cost

**Scenario:** 10 PRs/month, avg 4 hours active each

- Free hours: 2 hours × 10 PRs = 20 hours (free)
- Paid hours: 2 hours × 10 PRs = 20 hours paid
- Cost: 20 hours × $0.01344 = **$0.27/month**

Very affordable for the value! 💰

## Advanced Usage

### Testing Edge Functions

Preview branches include all edge functions:

```yaml
- name: Test edge function on preview
  run: |
    curl "${{ steps.supabase-branch.outputs.api_url }}/functions/v1/legal-chat" \
      -H "Authorization: Bearer ${{ steps.supabase-branch.outputs.anon_key }}" \
      -d '{"messages": [{"role": "user", "content": "test"}]}'
```

### Run Integration Tests

```yaml
- name: Run integration tests
  env:
    SUPABASE_URL: ${{ steps.supabase-branch.outputs.api_url }}
    SUPABASE_KEY: ${{ steps.supabase-branch.outputs.anon_key }}
  run: npm run test:integration
```

### Schema Validation

```yaml
- name: Validate schema changes
  run: |
    supabase db diff --linked --schema public
    supabase gen types typescript --linked > schema.new.ts
    diff schema.gen.ts schema.new.ts || echo "Schema changed"
```

## Troubleshooting

### Preview Branch Not Created

**Check:**
1. Supabase Plan is Pro or higher
2. Branching is enabled in project settings
3. `SUPABASE_ACCESS_TOKEN` is valid
4. Project ID is correct

**Solution:**
- Verify secrets in GitHub Settings → Secrets
- Check workflow logs for specific errors
- Ensure billing is active on Supabase

### Migration Timeout

If migrations take too long (>120s):

```yaml
with:
  timeout: 300  # Increase to 5 minutes
```

### Preview Branch Not Deleted

Preview branches should auto-delete when PR closes. If stuck:

1. **Via Supabase Dashboard:**
   - Go to Settings → Branching
   - Manually delete the branch

2. **Via API:**
```bash
curl -X DELETE \
  "https://api.supabase.com/v1/projects/$PROJECT_ID/branches/$BRANCH_ID" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

### Build Fails with Preview Database

**Common issues:**
- Migration syntax errors
- Missing dependencies in schema
- RLS policies not updated

**Debug:**
1. Check migration files for errors
2. Review workflow logs
3. Connect to preview database directly
4. Test queries in Supabase SQL Editor

## Best Practices

### Migrations

1. **Test Locally First**
   ```bash
   supabase db reset  # Reset local database
   supabase db diff   # Check what changed
   ```

2. **Small, Incremental Changes**
   - One feature per migration
   - Clear migration names
   - Add comments explaining changes

3. **Reversible Migrations**
   - Include rollback steps
   - Test both up and down migrations

### PR Workflow

1. **Draft PRs**: Use draft status for WIP to avoid creating branches
2. **Close Stale PRs**: Clean up old PRs to save costs
3. **Quick Reviews**: Review database changes promptly
4. **Test Thoroughly**: Verify all features work with new schema

### Security

1. **Don't Expose Credentials**: Preview keys are masked in logs
2. **Limit Access**: Only team members should access preview databases
3. **No Production Data**: Preview copies production schema, not sensitive data
4. **Clean Up**: Always close PRs when done

## Monitoring

### View All Preview Branches

**Supabase Dashboard:**
1. Go to Settings → Branching
2. View list of all active branches
3. See creation time and status
4. Manually delete if needed

### GitHub Actions

1. Go to Actions tab
2. Click on workflow run
3. Expand "Create Supabase preview branch" step
4. View branch creation logs

### Check Costs

**Supabase Dashboard:**
1. Go to Settings → Billing
2. View usage by preview branches
3. Monitor compute hours
4. Set up billing alerts

## Related Documentation

- [Official Supabase Branching Docs](https://supabase.com/docs/guides/platform/branching)
- [Supabase Management API](https://supabase.com/docs/reference/api/introduction)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated:** 2026-02-09  
**Workflow:** `.github/workflows/supabase-deploy.yml`  
**Action:** `0xbigboss/supabase-branch-gh-action@v1`
