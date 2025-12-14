# 🔍 Wallet Connection Debugging Guide

## Issue: Wallets Not Showing in "All Wallets" Section

If wallets are not appearing in the Web3Modal "All Wallets" section, follow these debugging steps:

## ✅ Step 1: Verify Environment Variable

**Check if Project ID is set correctly:**

1. **Local Development:**
   - Check `.env.local` file
   - Should contain: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=f3d84f94db7d9e42a9faeff19847f751`

2. **Production (Vercel):**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set to: `f3d84f94db7d9e42a9faeff19847f751`
   - Make sure it's set for **Production**, **Preview**, and **Development**
   - **Redeploy** after checking

3. **Test in Browser Console:**
   ```javascript
   console.log('Project ID:', process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);
   // Should output: f3d84f94db7d9e42a9faeff19847f751
   ```

## ✅ Step 2: Verify WalletConnect Cloud Configuration

**Critical:** Your domain must be whitelisted in WalletConnect Cloud!

1. Go to https://cloud.walletconnect.com
2. Sign in and select your project (ID: `f3d84f94db7d9e42a9faeff19847f751`)
3. Navigate to **Settings** → **App Settings**
4. Under **Allowed Domains**, ensure these are added:
   - `http://localhost:3000` (for local development)
   - `https://crypto-raffle-heys.vercel.app` (for production)
   - Any other domains you're using
5. **Save** the changes

**⚠️ If domains are not whitelisted, wallets will NOT appear!**

## ✅ Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Click "Connect Wallet" button
4. Look for errors:
   - `Project ID not found` → Environment variable issue
   - `Domain not whitelisted` → WalletConnect Cloud configuration issue
   - `Network error` → Connection issue
   - Any other errors → Note them down

## ✅ Step 4: Verify Web3Modal Configuration

**Current Configuration:**
- Using `defaultWagmiConfig` from `@web3modal/wagmi/react/config`
- Explorer is enabled by default
- No `featuredWalletIds` or `excludeWalletIds` set (shows ALL wallets)
- Project ID: `f3d84f94db7d9e42a9faeff19847f751`

**Check if configuration is correct:**
- File: `/app/providers.tsx`
- File: `/lib/wallet.ts`

## ✅ Step 5: Test Network Connection

1. Check if you can access WalletConnect services:
   - Try: https://explorer.walletconnect.com
   - Should load without errors

2. Check for ad blockers:
   - Disable ad blockers temporarily
   - Some ad blockers block WalletConnect domains

3. Try different browsers:
   - Chrome
   - Firefox
   - Brave
   - Edge

## ✅ Step 6: Clear Cache and Hard Refresh

1. **Hard Refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Browser Cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear data

3. **Try Incognito/Private Mode:**
   - This bypasses cache and extensions

## ✅ Step 7: Verify Package Versions

**Current versions:**
- `@web3modal/wagmi`: `^5.1.11`
- `wagmi`: `^3.1.0`
- `viem`: `^2.42.0`

**Check if packages are up to date:**
```bash
npm list @web3modal/wagmi wagmi viem
```

## ✅ Step 8: Check WalletConnect Explorer

1. Visit: https://explorer.walletconnect.com
2. Verify wallets are listed there
3. If wallets appear in Explorer but not in your app, it's a configuration issue

## 🐛 Common Issues and Solutions

### Issue 1: Only QR Code Shows, No Wallet List

**Cause:** Domain not whitelisted in WalletConnect Cloud

**Solution:**
1. Go to WalletConnect Cloud
2. Add your domain to "Allowed Domains"
3. Save and wait a few minutes
4. Try again

### Issue 2: Modal Opens But Shows "No Wallets"

**Cause:** Project ID incorrect or network issue

**Solution:**
1. Verify Project ID in environment variables
2. Check browser console for errors
3. Verify network connection
4. Check WalletConnect service status

### Issue 3: Only MetaMask Shows

**Cause:** Explorer not enabled or configuration issue

**Solution:**
1. Verify `defaultWagmiConfig` is used (not manual config)
2. Check that no `featuredWalletIds` are limiting display
3. Ensure `enableEIP6963`, `enableInjected`, `enableCoinbase` are true

### Issue 4: Works Locally But Not in Production

**Cause:** Environment variable not set in production

**Solution:**
1. Check Vercel/Netlify environment variables
2. Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
3. Redeploy after setting variables
4. Verify domain is whitelisted in WalletConnect Cloud

## 📋 Debug Checklist

- [ ] Environment variable `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- [ ] Project ID value is: `f3d84f94db7d9e42a9faeff19847f751`
- [ ] Domain is whitelisted in WalletConnect Cloud
- [ ] No errors in browser console
- [ ] Network connection is working
- [ ] Ad blockers are disabled
- [ ] Browser cache is cleared
- [ ] Packages are up to date
- [ ] Redeployed after environment variable changes

## 🔧 Quick Fix Commands

```bash
# Check environment variable (in browser console)
console.log(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);

# Clear Next.js cache
rm -rf .next
npm run build

# Check package versions
npm list @web3modal/wagmi wagmi viem
```

## 📞 Still Not Working?

If wallets still don't appear after following all steps:

1. **Check WalletConnect Cloud Dashboard:**
   - Verify project is active
   - Check domain whitelist
   - Verify project ID matches

2. **Check Browser Console:**
   - Look for specific error messages
   - Check network tab for failed requests
   - Note any CORS errors

3. **Test with Different Project ID:**
   - Create a new project in WalletConnect Cloud
   - Get new Project ID
   - Update environment variable
   - Test again

4. **Contact Support:**
   - WalletConnect Discord
   - Web3Modal GitHub Issues
   - Include error messages and configuration details

---

**Most Common Issue:** Domain not whitelisted in WalletConnect Cloud. Always check this first!

