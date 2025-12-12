#!/bin/bash
# Auto-commit and push script

echo "📦 Staging all changes..."
git add -A

echo "💾 Committing changes..."
git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')" || {
    echo "No changes to commit"
    exit 0
}

echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "❌ Failed to push. Check your authentication."
    exit 1
fi

