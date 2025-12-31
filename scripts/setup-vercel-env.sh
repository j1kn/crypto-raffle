#!/bin/bash

# Script to set up Vercel environment variables
# Run this after getting your SUPABASE_SERVICE_ROLE_KEY from Supabase dashboard

set -e

echo "🚀 Setting up Vercel Environment Variables..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel is available
if ! command -v vercel &> /dev/null && ! npx vercel --version &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel || {
        echo -e "${YELLOW}Using npx instead...${NC}"
        USE_NPX=true
    }
fi

VERCEL_CMD=${USE_NPX:-"vercel"}
if [ "$USE_NPX" = "true" ]; then
    VERCEL_CMD="npx --yes vercel"
fi

# Environment variables to set
SUPABASE_URL="https://puofbkubhtkynvdlwquu.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4"
WALLETCONNECT_PROJECT_ID="7fafc875947064cbb05b25b9b9407cad"

# Check if SERVICE_ROLE_KEY is provided as argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not provided${NC}"
    echo -e "${YELLOW}Get it from: Supabase Dashboard → Settings → API → service_role key${NC}"
    echo ""
    read -p "Enter SUPABASE_SERVICE_ROLE_KEY (or press Enter to skip): " SERVICE_ROLE_KEY
    if [ -z "$SERVICE_ROLE_KEY" ]; then
        echo -e "${RED}❌ SERVICE_ROLE_KEY is required for profile system${NC}"
        echo "Run this script again with: ./scripts/setup-vercel-env.sh YOUR_SERVICE_ROLE_KEY"
        exit 1
    fi
else
    SERVICE_ROLE_KEY="$1"
fi

# Check if ADMIN_WALLETS is provided
if [ -z "$2" ]; then
    echo -e "${YELLOW}⚠️  ADMIN_WALLETS not provided${NC}"
    read -p "Enter ADMIN_WALLETS (comma-separated wallet addresses, or press Enter to skip): " ADMIN_WALLETS
    if [ -z "$ADMIN_WALLETS" ]; then
        ADMIN_WALLETS=""
    fi
else
    ADMIN_WALLETS="$2"
fi

echo ""
echo -e "${GREEN}Setting environment variables for Production, Preview, and Development...${NC}"
echo ""

# Environments to set
ENVIRONMENTS=("production" "preview" "development")

for env in "${ENVIRONMENTS[@]}"; do
    echo -e "${GREEN}Setting variables for $env...${NC}"
    
    # Server-side variables
    echo "SUPABASE_URL=$SUPABASE_URL" | $VERCEL_CMD env add SUPABASE_URL $env
    echo "$SUPABASE_ANON_KEY" | $VERCEL_CMD env add SUPABASE_ANON_KEY $env
    echo "$SERVICE_ROLE_KEY" | $VERCEL_CMD env add SUPABASE_SERVICE_ROLE_KEY $env
    echo "$WALLETCONNECT_PROJECT_ID" | $VERCEL_CMD env add WALLETCONNECT_PROJECT_ID $env
    if [ -n "$ADMIN_WALLETS" ]; then
        echo "$ADMIN_WALLETS" | $VERCEL_CMD env add ADMIN_WALLETS $env
    fi
    
    # Client-side variables
    echo "$SUPABASE_URL" | $VERCEL_CMD env add NEXT_PUBLIC_SUPABASE_URL $env
    echo "$SUPABASE_ANON_KEY" | $VERCEL_CMD env add NEXT_PUBLIC_SUPABASE_ANON_KEY $env
    echo "$WALLETCONNECT_PROJECT_ID" | $VERCEL_CMD env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID $env
    
    echo -e "${GREEN}✅ Variables set for $env${NC}"
    echo ""
done

echo -e "${GREEN}✅ All environment variables set!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to Vercel dashboard and verify all variables are set"
echo "2. Redeploy your project (or push a new commit)"
echo "3. Check deployment logs to ensure build succeeds"

