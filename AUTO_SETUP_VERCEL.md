# Automatic Vercel Environment Variables Setup

## Quick Setup

I've created a script to automatically set up all required environment variables in Vercel.

### Option 1: Run the Script (Recommended)

```bash
# Make sure you have your SUPABASE_SERVICE_ROLE_KEY ready
# Get it from: Supabase Dashboard → Settings → API → service_role key

./scripts/setup-vercel-env.sh YOUR_SERVICE_ROLE_KEY "wallet1,wallet2"
```

Or run interactively:
```bash
./scripts/setup-vercel-env.sh
```

### Option 2: Manual Setup via Vercel Dashboard

Since I cannot directly set environment variables via MCP (Vercel MCP doesn't support this), you'll need to add them manually:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `d-c-raffels`
3. **Go to**: Settings → Environment Variables
4. **Add these variables** (for Production, Preview, and Development):

#### Server-Side Variables
```
SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here ⚠️ REQUIRED
WALLETCONNECT_PROJECT_ID=7fafc875947064cbb05b25b9b9407cad
ADMIN_WALLETS=yourwallet1,yourwallet2
```

#### Client-Side Variables (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=7fafc875947064cbb05b25b9b9407cad
```

### How to Get SUPABASE_SERVICE_ROLE_KEY

1. Go to: https://supabase.com/dashboard/project/puofbkubhtkynvdlwquu/settings/api
2. Under "Project API keys"
3. Find "service_role" (secret) key
4. Click "Reveal" or "Copy"
5. The key should start with `eyJ...`

### After Setting Variables

1. **Redeploy** your project:
   - Go to Deployments tab
   - Click the three dots (⋯) on latest deployment
   - Select "Redeploy"
   - OR push a new commit to trigger automatic deployment

2. **Verify deployment**:
   - Check build logs for any errors
   - Ensure build completes successfully
   - Test the application

## Why Manual Setup?

Unfortunately, the Vercel MCP (Model Context Protocol) doesn't currently support setting environment variables programmatically. The available MCP tools are limited to:
- Reading project information
- Viewing deployments
- Getting build logs
- Deploying (which triggers a build but doesn't configure env vars)

So we have two options:
1. Use the provided script with Vercel CLI (requires CLI to be installed/available)
2. Manual setup via Vercel Dashboard (recommended if script doesn't work)

## Troubleshooting

### Script Fails
- Make sure you're logged in to Vercel: `npx vercel login`
- Or use manual setup via dashboard

### Build Still Fails
- Double-check all environment variables are set
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check that variables are set for the correct environment (Production/Preview/Development)
- Review build logs in Vercel dashboard

