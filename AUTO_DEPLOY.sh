#!/bin/bash

# AUTO_DEPLOY.sh - Automatic Commit and PR Creation
# This script automatically commits changes and creates a pull request

set -e

echo "🚀 AUTO DEPLOY - Automatic Commit and PR Creation"
echo "================================================"
echo ""

# Configuration
BRANCH_NAME="copilot/fix-android-build-issues-again"
PR_TITLE="🚀 Production Ready Platform - All Features Complete"
PR_BODY_FILE="PULL_REQUEST_SUMMARY.md"

# Step 1: Check for uncommitted changes
echo "📋 Step 1: Checking for changes..."
if [[ -z $(git status -s) ]]; then
    echo "✅ No uncommitted changes found"
else
    echo "⚠️  Found uncommitted changes:"
    git status -s
    echo ""
    echo "📦 Step 2: Staging all changes..."
    git add .
    
    echo "💾 Step 3: Committing changes..."
    git commit -m "chore: auto-commit all changes before PR creation" || echo "Nothing to commit"
fi

# Step 2: Push to remote
echo ""
echo "📤 Step 4: Pushing to remote branch..."
git push -u origin "$BRANCH_NAME" || {
    echo "❌ Failed to push to remote"
    exit 1
}

echo "✅ Successfully pushed to $BRANCH_NAME"
echo ""

# Step 3: Create Pull Request
echo "🎯 Step 5: Creating Pull Request..."
echo ""

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found, creating PR automatically..."
    
    # Check if PR already exists
    EXISTING_PR=$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number' 2>/dev/null || echo "")
    
    if [[ -n "$EXISTING_PR" ]]; then
        echo "ℹ️  Pull request already exists: #$EXISTING_PR"
        echo "🔗 View at: https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/pull/$EXISTING_PR"
    else
        # Create the PR
        if [[ -f "$PR_BODY_FILE" ]]; then
            gh pr create \
                --title "$PR_TITLE" \
                --body-file "$PR_BODY_FILE" \
                --base main \
                --head "$BRANCH_NAME" && {
                echo "✅ Pull request created successfully!"
                PR_URL=$(gh pr view --json url --jq '.url')
                echo "🔗 View at: $PR_URL"
            }
        else
            # Fallback to simple PR
            gh pr create \
                --title "$PR_TITLE" \
                --body "Automated PR creation. See commits for details." \
                --base main \
                --head "$BRANCH_NAME" && {
                echo "✅ Pull request created successfully!"
                PR_URL=$(gh pr view --json url --jq '.url')
                echo "🔗 View at: $PR_URL"
            }
        fi
    fi
else
    echo "⚠️  GitHub CLI (gh) not found"
    echo ""
    echo "📋 Manual PR Creation Options:"
    echo ""
    echo "Option 1 - Web Browser (Easiest):"
    echo "🔗 https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/compare/main...$BRANCH_NAME"
    echo ""
    echo "Option 2 - Install GitHub CLI:"
    echo "   brew install gh  # macOS"
    echo "   sudo apt install gh  # Ubuntu/Debian"
    echo "   Then run this script again"
    echo ""
fi

echo ""
echo "================================================"
echo "✅ AUTO DEPLOY COMPLETE!"
echo ""
echo "Next Steps:"
echo "1. Review the PR in GitHub"
echo "2. Merge when ready"
echo "3. Follow DEPLOYMENT_READY.md for deployment"
echo ""
echo "🎉 All done!"
