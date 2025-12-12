# Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (already done ✅)

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository: `j1kn/crypto-raffle`

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Set Environment Variables:**
   Go to Project Settings > Environment Variables and add:

   **Required Variables:**
   ```
   SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
   WALLETCONNECT_PROJECT_ID=14470476d6df65c41949146d2a788698
   ADMIN_WALLETS=yourwallet1,yourwallet2
   ```

   **Client-Side Variables (NEXT_PUBLIC_*):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=14470476d6df65c41949146d2a788698
   ```

   **Optional (For Full Admin Access):**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Important:** 
   - Set these for **Production**, **Preview**, and **Development** environments
   - `NEXT_PUBLIC_*` variables are exposed to the browser
   - Non-prefixed variables are server-side only

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set Environment Variables:**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add WALLETCONNECT_PROJECT_ID
   vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   vercel env add ADMIN_WALLETS
   ```

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

## 📋 Required Environment Variables

### Server-Side Only (API Routes)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `WALLETCONNECT_PROJECT_ID`
- `ADMIN_WALLETS`

### Client-Side (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Optional
- `SUPABASE_SERVICE_ROLE_KEY` - For full admin access (bypasses RLS)

## ⚙️ Vercel Configuration

The project includes:
- `vercel.json` - Vercel configuration
- `next.config.js` - Next.js configuration (Vercel-compatible)

## 🔧 Troubleshooting

### Build Fails
- Check Node version (Vercel uses Node 18+ by default)
- Ensure all environment variables are set
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure `NEXT_PUBLIC_*` variables are set for client-side access
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### API Routes Not Working
- Ensure server-side env vars are set (without `NEXT_PUBLIC_` prefix)
- Check Vercel Functions logs
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

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)

## 🎯 Advantages of Vercel

- **Zero Configuration**: Next.js works out of the box
- **Automatic Deployments**: Deploys on every push to main
- **Preview Deployments**: Creates preview URLs for PRs
- **Edge Network**: Fast global CDN
- **Serverless Functions**: API routes work automatically
- **Analytics**: Built-in performance monitoring

