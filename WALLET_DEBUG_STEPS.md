# 🔍 CRITICAL: Wallet Not Showing - Debugging Steps

## ⚠️ MOST COMMON ISSUE: Domain Not Whitelisted

**If NO wallets are showing in "All Wallets" section, the #1 cause is domain not whitelisted in WalletConnect Cloud.**

## ✅ STEP 1: Whitelist Your Domain (CRITICAL!)

1. Go to: https://cloud.walletconnect.com
2. Sign in with your WalletConnect account
3. Select your project (Project ID: `7fafc875947064cbb05b25b9b9407cad`)
4. Go to **Settings** → **App Settings**
5. Scroll to **"Allowed Domains"** section
6. Add these domains:
   - `http://localhost:3000` (for local development)
   - `https://crypto-raffle-heys.vercel.app` (for production)
   - Add ANY other domains you're using
7. Click **Save**
8. **Wait 2-3 minutes** for changes to propagate
9. **Refresh your website** and try again

**⚠️ WITHOUT WHITELISTING, WALLETS WILL NOT APPEAR!**

## ✅ STEP 2: Verify Environment Variable

**Check Project ID is set:**

### Local Development:
- Open `.env.local` file
- Should contain: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=7fafc875947064cbb05b25b9b9407cad`

### Production (Vercel):
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
5. Verify value is: `7fafc875947064cbb05b25b9b9407cad`
6. Ensure it's set for **Production**, **Preview**, AND **Development**
7. **Redeploy** after checking

## ✅ STEP 3: Test in Browser Console

1. Open your website
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Type this and press Enter:
   ```javascript
   console.log('Project ID:', process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
   ```
5. Should output: `7fafc875947064cbb05b25b9b9407cad`
6. If it shows `undefined`, the environment variable is not set!

## ✅ STEP 4: Check Browser Console for Errors

1. Open DevTools (F12)
2. Go to **Console** tab
3. Click **"Connect Wallet"** button
4. Look for errors like:
   - ❌ `Domain not whitelisted`
   - ❌ `Project ID not found`
   - ❌ `Network error`
   - ❌ `CORS error`
   - ❌ `Failed to fetch`

**Note down any errors you see!**

## ✅ STEP 5: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **"Connect Wallet"** button
4. Look for failed requests (red):
   - Requests to `walletconnect.com`
   - Requests to `explorer.walletconnect.com`
   - Any 403 (Forbidden) or 401 (Unauthorized) errors

**If you see 403 errors → Domain is NOT whitelisted!**

## ✅ STEP 6: Clear Cache

1. **Hard Refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Browser Cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files

3. **Try Incognito/Private Mode:**
   - This bypasses all cache and extensions

## ✅ STEP 7: Disable Ad Blockers

Ad blockers can block WalletConnect domains:
1. Disable ad blocker temporarily
2. Try connecting wallet again
3. If it works, add exceptions for:
   - `*.walletconnect.com`
   - `*.walletconnect.org`

## ✅ STEP 8: Verify Project ID is Active

1. Go to: https://cloud.walletconnect.com
2. Check if your project (ID: `7fafc875947064cbb05b25b9b9407cad`) is:
   - ✅ Active
   - ✅ Has correct name
   - ✅ Not deleted or suspended

## 🔧 Current Configuration

Your app is configured with:
- ✅ `defaultWagmiConfig` - Includes all wallets automatically
- ✅ `enableEIP6963: true` - Detects browser extensions
- ✅ `enableInjected: true` - Shows injected wallets (MetaMask)
- ✅ `enableCoinbase: true` - Shows Coinbase Wallet
- ✅ Project ID: `7fafc875947064cbb05b25b9b9407cad`
- ✅ No wallet filtering - Should show ALL wallets

**Configuration looks correct!** If wallets aren't showing, it's almost certainly a **domain whitelisting** issue.

## 🐛 Quick Debugging Checklist

Run through this checklist:

- [ ] **Domain whitelisted in WalletConnect Cloud** ← MOST IMPORTANT!
- [ ] Environment variable `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- [ ] Project ID value is correct: `7fafc875947064cbb05b25b9b9407cad`
- [ ] No errors in browser console
- [ ] No 403/401 errors in Network tab
- [ ] Browser cache cleared
- [ ] Ad blockers disabled
- [ ] Tried in incognito mode
- [ ] Redeployed after setting environment variables

## 📞 Still Not Working?

If wallets STILL don't show after:
1. ✅ Whitelisting domain
2. ✅ Verifying environment variable
3. ✅ Clearing cache
4. ✅ Checking console for errors

**Then share:**
1. Browser console errors (screenshot or copy text)
2. Network tab errors (screenshot or copy text)
3. What you see when clicking "Connect Wallet" (screenshot)
4. Whether domain is whitelisted in WalletConnect Cloud

---

## 💡 Most Likely Solution

**95% of the time, the issue is domain not whitelisted.**

1. Go to https://cloud.walletconnect.com
2. Whitelist your domain
3. Wait 2-3 minutes
4. Refresh and try again

This will fix it! 🎯

