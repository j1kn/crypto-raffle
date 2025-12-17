# Wallet Display Issue - Debugging Guide

## Issue
Wallets are not showing in "All Wallets" section even though environment variable is set in Vercel.

## Possible Causes

### 1. Domain Not Whitelisted in WalletConnect Cloud ⚠️ MOST LIKELY
**This is the #1 reason wallets don't show!**

**Steps to Fix:**
1. Go to: https://cloud.walletconnect.com
2. Sign in and select your project (ID: `f3d84f94db7d9e42a9faeff19847f751`)
3. Navigate to: **Settings** > **App Settings**
4. Find **"Allowed Domains"** section
5. Add these domains:
   - `https://crypto-raffle-heys.vercel.app`
   - `http://localhost:3000` (for local development)
6. Click **Save**
7. **Redeploy** your Vercel app

**Why this matters:**
- WalletConnect Cloud blocks requests from non-whitelisted domains
- Even if the Project ID is correct, wallets won't load if domain isn't whitelisted
- This is a security feature to prevent unauthorized use

### 2. Environment Variable Not Available at Runtime
**Check in Browser Console:**
1. Open your deployed site: https://crypto-raffle-heys.vercel.app
2. Open DevTools (F12)
3. Go to Console tab
4. Look for: `[Web3Modal] Project ID: ...`
5. If it shows the fallback value or undefined, the env var isn't available

**Fix:**
- Ensure variable is set for **Production** environment in Vercel
- Redeploy after adding/updating the variable
- Variable name must be exactly: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 3. Browser Cache
**Clear cache and hard refresh:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or clear browser cache completely

### 4. Network/Ad Blocker
- Disable ad blockers temporarily
- Check if WalletConnect domains are blocked
- Try in incognito/private mode

## Verification Steps

### Step 1: Check Environment Variable in Vercel
1. Go to: https://vercel.com/dashboard
2. Select project: `crypto-raffle-heys`
3. Go to: **Settings** > **Environment Variables**
4. Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` exists
5. Value should be: `f3d84f94db7d9e42a9faeff19847f751`
6. Must be set for: **Production**, **Preview**, **Development**

### Step 2: Check Domain Whitelisting
1. Go to: https://cloud.walletconnect.com
2. Select project: `f3d84f94db7d9e42a9faeff19847f751`
3. Go to: **Settings** > **App Settings**
4. Verify domain is whitelisted: `https://crypto-raffle-heys.vercel.app`

### Step 3: Check Browser Console
1. Open: https://crypto-raffle-heys.vercel.app
2. Open DevTools (F12)
3. Check Console for:
   - `[Web3Modal] Project ID: f3d84f94db7d9e42a9faeff19847f751`
   - `[Web3Modal] Initialized successfully with allWallets: SHOW`
   - Any error messages

### Step 4: Test Wallet Connection
1. Click "Connect Wallet" button
2. Click "All Wallets" or "View All"
3. Should see 100+ wallets from WalletConnect Explorer
4. If empty, check console for errors

## Expected Behavior

When working correctly:
- "All Wallets" section shows 100+ wallets
- Wallets include: MetaMask, Coinbase, Trust Wallet, Rainbow, etc.
- QR code is available for mobile wallets
- Desktop wallets show as clickable buttons

## Still Not Working?

If wallets still don't show after:
1. ✅ Verifying domain is whitelisted
2. ✅ Verifying environment variable is set
3. ✅ Clearing browser cache
4. ✅ Checking console for errors

**Contact WalletConnect Support:**
- Check WalletConnect status: https://status.walletconnect.com
- WalletConnect Discord: https://discord.gg/walletconnect
- Or check if there's a service outage

