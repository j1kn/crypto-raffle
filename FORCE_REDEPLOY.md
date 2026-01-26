# Force Vercel Redeploy - Fix Quiz Validation

## Problem Confirmed
Your quiz attempts ARE in the database with correct data:
- Wallet: `0x8759dcf37b7c85cc202236e918f0539bc072c6eb`
- User ID: `6d63be47-dae9-4cd3-a8f0-ac569bdc5bbd`
- Raffle: Genesis Pick
- Multiple passing attempts (score 2/3 and 3/3)
- All marked as `passed: true`

**The issue:** Vercel is serving cached/old API code that still has the broken validation logic.

## Solution: Force Fresh Deployment

### Option 1: Redeploy via Vercel Dashboard (RECOMMENDED)
1. Go to https://vercel.com/dashboard
2. Select your project (Prime Pick)
3. Go to "Deployments" tab
4. Find the LATEST deployment (should be from today)
5. Click the three dots (•••) menu
6. Click "Redeploy"
7. Select "Use existing Build Cache" = **OFF** (important!)
8. Click "Redeploy"
9. Wait 2-3 minutes for deployment
10. Try entering raffle again

### Option 2: Trigger New Deployment via Git
```bash
# Make a small change to force new deployment
echo "\n# Force redeploy $(date)" >> README.md
git add README.md
git commit -m "Force redeploy to update API routes"
git push origin main
```

Then wait 2-3 minutes for Vercel to auto-deploy.

### Option 3: Clear Vercel Function Cache
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Functions
4. Scroll to "Function Cache"
5. Click "Clear Cache"
6. Then redeploy (Option 1)

### Option 4: Add Cache-Busting Header
Add this to `vercel.json`:
```json
{
  "crons": [],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

Then commit and push.

## Verify Deployment Worked

### Step 1: Check Deployment Logs
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Go to "Functions" tab
4. Look for `/api/raffles/[id]/enter`
5. Should show "Ready" status

### Step 2: Test the API Directly
Open browser console and run:
```javascript
fetch('https://your-domain.vercel.app/api/raffles/b201dd3b-71db-41d1-a21b-d4a1027c3938/enter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: '0x8759dcf37b7c85cc202236e918f0539bc072c6eb',
    txHash: null,
    quantity: 1
  })
}).then(r => r.json()).then(console.log);
```

Should return success (free entry) or show detailed error with debug info.

### Step 3: Check for New Logs
After redeployment, try to enter raffle and check Vercel logs:
1. Vercel Dashboard → Your Project
2. Click "Logs" or "Runtime Logs"
3. Filter by `/api/raffles`
4. Should see new logs with:
   - `[Quiz Validation] Starting validation for:`
   - `[Quiz Validation] Query result:`
   - `[Quiz Validation] ✅ User passed quiz:`

## Why This Happened

Vercel caches serverless functions aggressively. When you deployed the fix:
1. Code was pushed to GitHub ✅
2. Vercel detected the push ✅
3. Vercel built the new code ✅
4. BUT: Old function might still be cached in edge locations ❌

The redeploy with cache disabled will force all edge locations to use the new code.

## Expected Result After Redeploy

When you try to enter Genesis Pick raffle:
1. Quiz validation will find your passing attempts
2. Free entry check will see you qualify (first 10%)
3. Entry will be created immediately with `is_free_entry: true`
4. You'll see: "🎉 Congratulations! You've entered the raffle for FREE!"

## If Still Not Working After Redeploy

Then we know it's not a caching issue. Possible causes:
1. Environment variables not set correctly
2. Different Supabase project in production
3. API route not being hit at all

Let me know and I'll investigate further.
