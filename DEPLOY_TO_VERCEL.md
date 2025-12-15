# Deploy to Vercel - Complete Guide

## 🚀 Quick Deploy Steps

### Step 1: Check Vercel Connection
1. Go to: https://vercel.com/dashboard
2. Check if project `crypto-raffle` exists
3. If not, create new project and connect GitHub repo: `j1kn/crypto-raffle`

### Step 2: Verify GitHub Connection
1. In Vercel Dashboard → Project Settings → Git
2. Ensure GitHub repo is connected: `j1kn/crypto-raffle`
3. Check if auto-deploy is enabled

### Step 3: Add Environment Variables
Go to **Project Settings → Environment Variables** and add:

#### Server-Side Variables:
```
SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
WALLETCONNECT_PROJECT_ID=f3d84f94db7d9e42a9faeff19847f751
ADMIN_PIN=London@123!!
```

#### Client-Side Variables (NEXT_PUBLIC_*):
```
NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=f3d84f94db7d9e42a9faeff19847f751
```

#### Optional (For Admin Panel):
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:**
- Set for **Production**, **Preview**, and **Development**
- Click **"Save"** after each variable

### Step 4: Trigger Deployment
1. Go to **Deployments** tab
2. Click **"Redeploy"** button (or wait for auto-deploy from GitHub push)
3. Or manually trigger: Click **"..."** → **"Redeploy"**

### Step 5: Check Build Logs
1. Click on the deployment
2. Check **Build Logs** for any errors
3. Common issues:
   - Missing environment variables
   - Build errors (should be fixed now)
   - TypeScript errors

## 🔧 Troubleshooting

### If Deployment Fails:

1. **Check Build Logs:**
   - Go to Deployments → Click failed deployment → View logs
   - Look for error messages

2. **Common Issues:**
   - **Missing env vars:** Add all required environment variables
   - **Build errors:** Check TypeScript/ESLint errors
   - **Node version:** Should be 18+ (Vercel auto-detects)

3. **Force Redeploy:**
   - Go to Deployments
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

### If Project Not Connected:

1. **Create New Project:**
   - Go to Vercel Dashboard
   - Click **"Add New Project"**
   - Import: `j1kn/crypto-raffle`
   - Click **"Deploy"**

2. **Check GitHub Permissions:**
   - Vercel needs access to your GitHub repo
   - Go to Vercel Settings → Git → Check permissions

## ✅ Verification

After deployment:
1. Visit your Vercel URL (shown in dashboard)
2. Test wallet connection
3. Check if pages load correctly
4. Verify Supabase connection works

## 📝 Current Status

- ✅ Build fixed (removed invalid Web3Modal properties)
- ✅ Code pushed to GitHub
- ✅ vercel.json configured (cron job setup)
- ⏳ Waiting for Vercel deployment

## 🎯 Next Steps

1. Check Vercel Dashboard for project status
2. Add environment variables if missing
3. Trigger deployment manually if needed
4. Monitor build logs for any issues

