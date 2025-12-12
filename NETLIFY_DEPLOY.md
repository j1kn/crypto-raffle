# Netlify Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next` (Netlify will auto-detect with the plugin)
   - Node version: `18` (set in Netlify dashboard or use `.nvmrc`)

4. **Set Environment Variables:**
   Go to Site settings > Environment variables and add:
   
   ```
   SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
   WALLETCONNECT_PROJECT_ID=14470476d6df65c41949146d2a788698
   ADMIN_WALLETS=yourwallet1,yourwallet2
   ```
   
   **IMPORTANT:** Also add the `NEXT_PUBLIC_` versions for client-side access:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=14470476d6df65c41949146d2a788698
   ```

5. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live!

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Set environment variables via CLI:**
   ```bash
   netlify env:set SUPABASE_URL "https://puofbkubhtkynvdlwquu.supabase.co"
   netlify env:set SUPABASE_ANON_KEY "your-key-here"
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://puofbkubhtkynvdlwquu.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key-here"
   netlify env:set WALLETCONNECT_PROJECT_ID "14470476d6df65c41949146d2a788698"
   netlify env:set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID "14470476d6df65c41949146d2a788698"
   netlify env:set ADMIN_WALLETS "wallet1,wallet2"
   ```

## 📋 Required Environment Variables

### Server-Side Only (API Routes)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `ADMIN_WALLETS` - Comma-separated admin wallet addresses

### Client-Side (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL` - Same as SUPABASE_URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Same as WALLETCONNECT_PROJECT_ID

### Optional (For Full Admin Access)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for bypassing RLS (server-side only)

## ⚙️ Build Configuration

The project includes:
- `netlify.toml` - Netlify configuration
- `.nvmrc` - Node version specification
- `@netlify/plugin-nextjs` - Next.js plugin for Netlify

## 🔧 Troubleshooting

### Build Fails
- Check Node version is 18+
- Ensure all environment variables are set
- Check build logs in Netlify dashboard

### Environment Variables Not Working
- Make sure `NEXT_PUBLIC_*` variables are set for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### API Routes Not Working
- Ensure server-side env vars are set (without `NEXT_PUBLIC_` prefix)
- Check Netlify Functions logs
- Verify Supabase connection

### Images Not Loading
- Check Supabase Storage bucket is public
- Verify image URLs in Supabase
- Check `next.config.js` remote patterns

## 📝 Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Supabase migration run
- [ ] Storage bucket `raffle-images` created and public
- [ ] Admin wallets added to `ADMIN_WALLETS`
- [ ] Test wallet connection
- [ ] Test raffle creation (admin)
- [ ] Test raffle entry (public)
- [ ] Verify images upload correctly

## 🔗 Useful Links

- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/overview/)

