# Wallet Not Showing - Comprehensive Debug Guide

## Issue
Domain is whitelisted in WalletConnect Cloud, environment variable is set, but wallets still don't show in "All Wallets" section.

## Debugging Steps

### Step 1: Check Browser Console
1. Open: https://crypto-raffle-heys.vercel.app
2. Open DevTools (F12) > Console tab
3. Look for these logs:
   - `[Web3Modal] Project ID: f3d84f94db7d9e42a9faeff19847f751`
   - `[Web3Modal] Project ID length: 32` (should be 32, not 88)
   - `[Web3Modal] Explorer API Response: { count: ..., hasWallets: true }`
   - Any error messages

**What to check:**
- If Project ID length is NOT 32, the env var isn't being read correctly
- If Explorer API Error appears, there's a network/CORS issue
- If count is 0, the Project ID might be wrong

### Step 2: Verify Environment Variable in Vercel
1. Go to: https://vercel.com/dashboard
2. Select project: `crypto-raffle-heys`
3. Go to: **Settings** > **Environment Variables**
4. Find: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
5. **IMPORTANT:** The value should be exactly: `f3d84f94db7d9e42a9faeff19847f751`
6. Make sure it's set for: **Production**, **Preview**, **Development**
7. **Redeploy** after any changes

### Step 3: Verify Domain Whitelisting (Double Check)
1. Go to: https://cloud.walletconnect.com
2. Select project: `f3d84f94db7d9e42a9faeff19847f751`
3. Go to: **Settings** > **App Settings**
4. Check **"Allowed Domains"** section
5. Verify these are EXACTLY as shown (no trailing slashes):
   - `https://crypto-raffle-heys.vercel.app`
   - `http://localhost:3000`
6. **Remove any duplicates or incorrect entries**
7. Click **Save**

### Step 4: Check Network Tab
1. Open DevTools (F12) > **Network** tab
2. Click "Connect Wallet" button
3. Click "All Wallets"
4. Look for requests to:
   - `explorer-api.walletconnect.com`
   - `explorer.walletconnect.com`
5. Check if requests are:
   - ✅ **200 OK** - Good, wallets should load
   - ❌ **403 Forbidden** - Domain not whitelisted or Project ID wrong
   - ❌ **CORS Error** - Domain whitelisting issue
   - ❌ **404 Not Found** - Project ID incorrect

### Step 5: Clear Browser Cache
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache completely
3. Try in incognito/private mode
4. Try a different browser

### Step 6: Check Project ID in WalletConnect Cloud
1. Go to: https://cloud.walletconnect.com
2. Select your project
3. Go to: **Settings** > **Project Settings**
4. Verify the **Project ID** matches: `f3d84f94db7d9e42a9faeff19847f751`
5. If different, update the environment variable in Vercel

## Common Issues & Solutions

### Issue 1: Environment Variable Not Available at Runtime
**Symptoms:**
- Console shows: `Project ID length: 88` (encrypted value)
- Or: `Project ID: undefined`

**Solution:**
- Ensure variable name is exactly: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Must have `NEXT_PUBLIC_` prefix for client-side access
- Redeploy after setting/updating the variable

### Issue 2: Domain Whitelisting Not Working
**Symptoms:**
- Network tab shows 403 Forbidden
- Console shows CORS errors

**Solution:**
- Remove domain from whitelist
- Add it again (sometimes helps)
- Ensure no trailing slashes: `https://crypto-raffle-heys.vercel.app` (NOT `https://crypto-raffle-heys.vercel.app/`)
- Wait a few minutes after saving (propagation delay)
- Redeploy your app

### Issue 3: Project ID Mismatch
**Symptoms:**
- Explorer API returns 0 wallets
- Network requests return 404

**Solution:**
- Verify Project ID in WalletConnect Cloud dashboard
- Update environment variable if different
- Redeploy

### Issue 4: Browser/Network Issues
**Symptoms:**
- Network requests fail
- Timeout errors

**Solution:**
- Disable ad blockers
- Check firewall settings
- Try different network
- Try different browser

## Expected Console Output (When Working)

```
[Web3Modal] Project ID: f3d84f94db7d9e42a9faeff19847f751
[Web3Modal] Project ID length: 32
[Web3Modal] Env var available: true
[Web3Modal] Initialized successfully with allWallets: SHOW
[Web3Modal] Current URL: https://crypto-raffle-heys.vercel.app/...
[Web3Modal] Explorer API Response: { count: 150, hasWallets: true, ... }
```

## Still Not Working?

If wallets still don't show after all steps:

1. **Check WalletConnect Status:**
   - https://status.walletconnect.com

2. **Contact Support:**
   - WalletConnect Discord: https://discord.gg/walletconnect
   - Web3Modal GitHub: https://github.com/WalletConnect/web3modal

3. **Try Creating New Project:**
   - Sometimes projects can have issues
   - Create new project in WalletConnect Cloud
   - Update environment variable with new Project ID
   - Redeploy

