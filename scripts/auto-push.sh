#!/bin/bash
# Auto-commit and push script

echo "📦 Staging all changes..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

echo "💾 Committing changes..."
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -ne 0 ]; then
    echo "❌ Failed to commit"
    exit 1
fi

echo "🚀 Pushing to GitHub..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin $BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ Failed to push. You may need to authenticate."
    echo "   Run: git push origin $BRANCH manually"
    exit 1
fi

