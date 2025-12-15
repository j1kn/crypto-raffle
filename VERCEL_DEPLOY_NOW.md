# Deploy to Vercel Now - Step by Step

## 🚀 Quick Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com
2. Sign in with your GitHub account
3. Click **"Add New Project"**

### Step 2: Import Your Repository
1. Find and select: **`j1kn/crypto-raffle`**
2. Click **"Import"**

### Step 3: Configure Project (Auto-detected)
- **Framework Preset:** Next.js ✅ (auto-detected)
- **Root Directory:** `./` ✅ (default)
- **Build Command:** `npm run build` ✅ (default)
- **Output Directory:** `.next` ✅ (default)
- **Install Command:** `npm install` ✅ (default)

**Click "Deploy"** (we'll add environment variables after)

### Step 4: Add Environment Variables
After deployment starts, go to **Project Settings > Environment Variables**

Add these **REQUIRED** variables:

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
- Set for **Production**, **Preview**, and **Development** environments
- Click **"Save"** after adding each variable

### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

### Step 6: Verify Deployment
1. Visit your deployment URL (shown in Vercel dashboard)
2. Test wallet connection
3. Check if raffles load

## ✅ Build Fixed
- Removed invalid Web3Modal properties (`enableAccountView`, `enableNetworkView`)
- Build should now succeed

## 🔧 If Build Still Fails
1. Check **Deployments** tab for error logs
2. Common issues:
   - Missing environment variables
   - Node version mismatch (should be 18+)
   - TypeScript errors

## 📝 Post-Deployment Checklist
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Site loads correctly
- [ ] Wallet connection works
- [ ] Supabase connection works

