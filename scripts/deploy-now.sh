#!/bin/bash

# Quick deployment script using API tokens
# This script deploys to Vercel and can manage Supabase

VERCEL_TOKEN="gtiNGmtay57SEJHF77UwvE66"
SUPABASE_URL="https://puofbkubhtkynvdlwquu.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUyMjI5OCwiZXhwIjoyMDgxMDk4Mjk4fQ.n4v52beF3ta0feTVsZoSnJpbsenoYWEgh2c_poF1I48"

echo "🚀 Deploying to Vercel..."

# Push to GitHub first
echo "📤 Pushing to GitHub..."
git add -A
git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes"
git push origin main || echo "Push failed or already up to date"

echo ""
echo "🚀 Triggering Vercel deployment..."

# Get or create project
PROJECT_RESPONSE=$(curl -s -X GET "https://api.vercel.com/v9/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN")

PROJECT_NAME=$(echo $PROJECT_RESPONSE | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_NAME" ] || [ "$PROJECT_NAME" != "crypto-raffle" ]; then
  echo "📦 Creating Vercel project..."
  CREATE_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v9/projects" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "crypto-raffle",
      "gitRepository": {
        "type": "github",
        "repo": "j1kn/crypto-raffle"
      }
    }')
  echo "✅ Project created"
else
  echo "✅ Found project: $PROJECT_NAME"
fi

# Trigger deployment
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"crypto-raffle\",
    \"target\": \"production\"
  }")

echo ""
echo "✅ Deployment triggered!"
echo "📊 Response: $DEPLOY_RESPONSE" | head -200
echo ""
echo "🔗 Check Vercel Dashboard: https://vercel.com/dashboard"

