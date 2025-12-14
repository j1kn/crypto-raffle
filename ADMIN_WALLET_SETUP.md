# 🔐 Admin Wallet Setup

## Your Admin Wallet Address

**Admin Wallet:** `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`

---

## How to Add Admin Wallet to Vercel (Production)

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: `crypto-raffle` (or your project name)

### Step 2: Navigate to Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in the left sidebar

### Step 3: Add/Update ADMIN_WALLETS
1. Find the variable: `ADMIN_WALLETS`
2. **If it exists:** Click on it and edit the value
3. **If it doesn't exist:** Click **Add New** and set:
   - **Key:** `ADMIN_WALLETS`
   - **Value:** `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`
4. Select all environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Click **Save**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. ✅ Your admin wallet is now active!

---

## For Local Development

Create or edit `.env.local` file in project root:

```bash
ADMIN_WALLETS=0x842bab27dE95e329eb17733c1f29c082e5dd94c3
```

Then restart your dev server:
```bash
npm run dev
```

---

## Adding Multiple Admin Wallets

If you need to add multiple admins, separate them with commas (no spaces around commas):

```bash
ADMIN_WALLETS=0x842bab27dE95e329eb17733c1f29c082e5dd94c3,0xAnotherWalletAddress,0xThirdWalletAddress
```

---

## Verify Admin Access

1. Connect your wallet (`0x842bab27dE95e329eb17733c1f29c082e5dd94c3`) to the website
2. The **"ADMIN"** link should appear in the header
3. Click **"ADMIN"** or go to: `https://crypto-raffle-heys.vercel.app/admin`
4. You should see the admin dashboard!

---

## Troubleshooting

**Can't access admin panel even after adding wallet?**

1. ✅ Verify wallet address matches exactly (case-insensitive but copy exactly)
2. ✅ Check `ADMIN_WALLETS` in Vercel is saved correctly
3. ✅ **Redeploy** after adding/updating environment variable
4. ✅ Clear browser cache and reconnect wallet
5. ✅ Make sure you're connected with the correct wallet address

---

**Your admin wallet address is:** `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`

