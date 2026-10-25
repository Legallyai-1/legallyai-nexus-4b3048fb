#!/bin/bash

echo "🚀 Creating Pull Request for LegallyAI Nexus Platform"
echo "======================================================"
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found. Creating PR automatically..."
    echo ""
    
    gh pr create \
        --title "🚀 Production Ready: Complete Platform Implementation" \
        --body-file PULL_REQUEST_SUMMARY.md \
        --base main \
        --head copilot/fix-android-build-issues-again
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Pull Request created successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Review the PR on GitHub"
        echo "2. Merge when ready"
        echo "3. Follow post-merge steps in DEPLOYMENT_READY.md"
    else
        echo ""
        echo "⚠️  Failed to create PR automatically."
        echo "Please use the web method below."
    fi
else
    echo "⚠️  GitHub CLI not installed."
    echo ""
    echo "📋 EASY METHOD - Use this link:"
    echo ""
    echo "https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/compare/main...copilot/fix-android-build-issues-again"
    echo ""
    echo "Then:"
    echo "1. Click 'Create pull request'"
    echo "2. Copy content from PULL_REQUEST_SUMMARY.md"
    echo "3. Paste as PR description"
    echo "4. Click 'Create pull request' again"
    echo ""
fi

echo ""
echo "📚 Documentation:"
echo "- PULL_REQUEST_SUMMARY.md - PR description"
echo "- READY_TO_MERGE.md - Complete guide"
echo "- DEPLOYMENT_READY.md - Post-merge steps"
echo ""
