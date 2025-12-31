# Vercel Environment Variables Setup

## ⚠️ IMPORTANT: Required Environment Variables

The profile system requires `SUPABASE_SERVICE_ROLE_KEY` to be set. Without it, profile API routes will fail.

## Complete List of Required Environment Variables

### 1. Go to Vercel Dashboard
- Navigate to your project
- Go to **Settings** → **Environment Variables**

### 2. Add These Variables (for Production, Preview, and Development)

#### Server-Side Variables (Required)
```
SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
WALLETCONNECT_PROJECT_ID=7fafc875947064cbb05b25b9b9407cad
ADMIN_WALLETS=yourwallet1,yourwallet2
```

#### Client-Side Variables (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=7fafc875947064cbb05b25b9b9407cad
```

## How to Get SUPABASE_SERVICE_ROLE_KEY

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, find **service_role** (secret)
5. Click **Copy** or **Reveal** to get the key
6. ⚠️ **Never expose this key** - it bypasses all RLS policies

## Important Notes

- **Set for all environments**: Make sure to select Production, Preview, and Development when adding each variable
- **SUPABASE_SERVICE_ROLE_KEY is REQUIRED**: The profile system, dashboard stats, and admin operations won't work without it
- **After adding variables**: You must redeploy for changes to take effect
- **Case-sensitive**: Variable names are case-sensitive, use exact names shown above

## Verification

After setting all variables and redeploying:

1. Check build logs in Vercel dashboard - should complete successfully
2. Test the profile API: `/api/profile?walletAddress=0x...`
3. Test dashboard: Should load without errors
4. Test settings page: Should be able to save profile

## Troubleshooting

### Build fails with "SUPABASE_SERVICE_ROLE_KEY is required"
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check that it's set for the correct environment (Production/Preview/Development)
- Verify the key is correct (starts with `eyJ...`)

### API routes return 500 errors
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify Supabase project URL is correct
- Check Vercel Function logs for detailed error messages

### Profile upload fails
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify the `profile-pictures` storage bucket exists in Supabase
- Check storage bucket policies are set correctly

