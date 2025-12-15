#!/bin/bash

# Deploy to Vercel Script
# This script will help deploy your project to Vercel

echo "🚀 Deploying to Vercel..."
echo ""

# Check if vercel is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Push to GitHub first
echo "📤 Pushing to GitHub..."
git add -A
git commit -m "Deploy to Vercel - $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

echo ""
echo "✅ Code pushed to GitHub"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Note: If this is your first time, you'll need to login"
echo ""

# Use npx to run vercel (works without global install)
npx vercel --prod --yes || {
    echo ""
    echo "⚠️  Vercel deployment requires login"
    echo "Run: npx vercel login"
    echo "Then run: npx vercel --prod"
    echo ""
    echo "Or deploy via Vercel Dashboard:"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Find your project or create new one"
    echo "3. Connect GitHub repo: j1kn/crypto-raffle"
    echo "4. Add environment variables"
    echo "5. Click Deploy"
}

echo ""
echo "✅ Deployment process initiated!"
echo ""
echo "📝 Next steps:"
echo "1. Check Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Add environment variables if not already set"
echo "3. Monitor deployment status"

