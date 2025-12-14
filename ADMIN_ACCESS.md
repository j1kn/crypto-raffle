# 🔐 Quick Admin Panel Access Guide

## How to Access Admin Panel

### Step 1: Get Your Wallet Address
1. Visit your website
2. Click **"Connect Wallet"** button
3. Connect your wallet (MetaMask, etc.)
4. Copy your wallet address from the header (e.g., `0x1234...5678`)

### Step 2: Set Admin Access

**For Vercel (Production):**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit: `ADMIN_WALLETS`
5. Value: Your wallet address (e.g., `0x1234567890abcdef1234567890abcdef12345678`)
6. Select: **Production**, **Preview**, **Development**
7. Click **Save**
8. **Redeploy** your project

**For Local Development:**
1. Create/edit `.env.local` file in project root
2. Add: `ADMIN_WALLETS=your_wallet_address_here`
3. Restart dev server: `npm run dev`

### Step 3: Access Admin Panel
1. **Connect your wallet** (must match address in `ADMIN_WALLETS`)
2. Go to: `https://your-domain.com/admin`
   - Or click **"ADMIN"** link in header (only visible when you're admin)
3. You'll see the admin dashboard!

## Creating Raffles

1. Click **"CREATE RAFFLE"** button
2. Fill out the form:
   - Upload image
   - Enter title, description
   - Set prize pool amount and symbol
   - Set entry fees (ticket price)
   - Set max tickets
   - Select blockchain network
   - Set receiving wallet address
   - Set end date/time
   - Set status to **"live"** to show to everyone
3. Click **"CREATE RAFFLE"**
4. Raffle is saved to Supabase and visible to all users!

---

**That's it!** Your wallet address in `ADMIN_WALLETS` = Admin access.

