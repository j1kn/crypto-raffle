# WalletConnect Troubleshooting Guide

## 🔧 Common Issues and Fixes

### Issue: "Connect Wallet" button not working / No modal appearing

**Possible Causes:**

1. **Missing Environment Variable on Vercel**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set to: `7fafc875947064cbb05b25b9b9407cad`
   - Make sure it's set for **Production**, **Preview**, and **Development**
   - **Redeploy** after adding/updating the variable

2. **Browser Console Errors**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Look for WalletConnect-related errors
   - Share error messages for debugging

3. **Network/Ad Blocker Issues**
   - Disable ad blockers temporarily
   - Check if WalletConnect domains are blocked
   - Try in incognito/private mode

4. **WalletConnect Service Issues**
   - Check WalletConnect status
   - Try again after a few minutes

### Quick Fixes:

**1. Verify Environment Variable:**
```bash
# Check if variable is set (in browser console)
console.log(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID)
# Should output: 7fafc875947064cbb05b25b9b9407cad
```

**2. Clear Browser Cache:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies
- Try again

**3. Check Browser Console:**
- Open DevTools (F12)
- Go to Console tab
- Click "CONNECT WALLET"
- Look for any error messages
- Common errors:
  - "Project ID not found" → Environment variable not set
  - "User rejected" → User cancelled the connection
  - "Network error" → Internet/WalletConnect service issue

## ✅ Verification Steps

1. **Check Environment Variable:**
   - Vercel Dashboard > Settings > Environment Variables
   - Variable: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - Value: `7fafc875947064cbb05b25b9b9407cad`
   - Scope: Production, Preview, Development

2. **Redeploy:**
   - After setting environment variables, redeploy
   - Wait for deployment to complete
   - Test again

3. **Test Connection:**
   - Click "CONNECT WALLET" button
   - WalletConnect modal should appear
   - Select your wallet
   - Approve connection
   - Wallet address should appear in header

## 🐛 Debug Mode

To enable detailed logging, check browser console for:
- "Initializing WalletConnect..." 
- "Requesting wallet connection..."
- "Wallet connected: [address]"

If you see errors, note the exact error message.

## 📞 Still Not Working?

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Check browser console for specific error messages
4. Try different browsers (Chrome, Firefox, Brave)
5. Ensure you're using a supported wallet (MetaMask, WalletConnect, etc.)

