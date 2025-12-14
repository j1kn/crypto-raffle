# 🎯 Complete Admin Panel Setup Guide

## ✅ How to Access Admin Panel & Create Raffles

### Step 1: Get Your Wallet Address

1. Visit your website: `https://crypto-raffle-heys.vercel.app` (or localhost if testing)
2. Click **"CONNECT WALLET"** button in the header
3. Connect your wallet (MetaMask, Coinbase, etc.)
4. Your wallet address will appear in the header (e.g., `0x1234...5678`)
5. **Copy your full wallet address** - you'll need it in the next step

### Step 2: Add Your Wallet to Admin List

**Option A: Vercel (Production) - Recommended**

1. Go to: https://vercel.com/dashboard
2. Select your project: `crypto-raffle` (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Find or create: `ADMIN_WALLETS`
6. Set the value to your wallet address:
   - Single admin: `0xYourWalletAddressHere`
   - Multiple admins: `0xWallet1,0xWallet2,0xWallet3` (comma-separated)
7. Select all environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
8. Click **Save**
9. **IMPORTANT:** Go to **Deployments** tab and **Redeploy** your latest deployment
   - Or push a new commit to trigger redeploy

**Option B: Local Development**

1. Create or edit `.env.local` file in your project root:
   ```bash
   ADMIN_WALLETS=0xYourWalletAddressHere
   ```
2. For multiple admins:
   ```bash
   ADMIN_WALLETS=0xWallet1,0xWallet2
   ```
3. Restart your dev server:
   ```bash
   npm run dev
   ```

### Step 3: Access Admin Panel

1. **Make sure your wallet is connected** to the website
2. Your wallet address **must match** the one in `ADMIN_WALLETS`
3. You'll see an **"ADMIN"** link appear in the header (only visible to admins)
4. Click **"ADMIN"** or go directly to: `https://crypto-raffle-heys.vercel.app/admin`
5. You should see the admin dashboard!

---

## 📝 Creating Raffles (Admin Panel)

### Step-by-Step Raffle Creation

1. **Access Admin Panel** (see Step 3 above)
2. Click the **"CREATE RAFFLE"** button (top right)
3. Fill out the raffle form:

   **Required Fields:**
   - **Image**: Upload raffle banner image (will be stored in Supabase Storage)
   - **Title**: Name of the raffle (e.g., "Bitcoin Giveaway")
   - **Description**: Full description of the raffle
   - **Prize Pool Amount**: Prize amount (e.g., `1000`)
   - **Prize Pool Symbol**: Currency symbol (e.g., `ETH`, `BTC`, `USDT`)
   - **Ticket Price**: Entry fee per ticket (e.g., `10`)
   - **Max Tickets**: Maximum number of entries allowed
   - **Chain**: Select blockchain (Ethereum, Polygon, Base, etc.)
   - **Receiving Address**: Your wallet address to receive funds (NOT visible to public)
   - **Starts At**: When raffle starts (optional)
   - **Ends At**: When raffle ends (required)
   - **Status**: 
     - `draft` - Hidden from public (only admins can see)
     - `live` - **Visible to everyone** ✅ (use this to show raffle)
     - `closed` - Ended but not completed
     - `completed` - Winner drawn

4. Click **"CREATE RAFFLE"** button
5. Raffle is saved to **Supabase** automatically
6. If status is `live`, the raffle will appear on:
   - Home page (`/`)
   - Raffles list page (`/raffles`)
   - Visible to all users!

---

## 🔗 How Raffles Connect to Supabase

### Database Storage

- **Table**: `raffles` in Supabase
- **Connection**: All admin operations use Supabase JS SDK
- **Public View**: Live raffles are accessible via `public_raffles` view
- **Storage**: Images uploaded to Supabase Storage

### What Happens When You Create a Raffle

1. ✅ Image uploaded to Supabase Storage
2. ✅ Raffle data saved to `raffles` table
3. ✅ Linked to your user account (via wallet address)
4. ✅ If status = `live`, it appears in `public_raffles` view
5. ✅ All users can see it on `/raffles` page
6. ✅ Users can enter the raffle and purchase tickets

### Security

- ✅ `receiving_address` field is **NEVER** shown to public users
- ✅ Only visible in admin panel
- ✅ Protected by Row Level Security (RLS) in Supabase
- ✅ Admin access verified via `ADMIN_WALLETS` environment variable

---

## 🎨 Admin Panel Features

### Dashboard (`/admin`)

- View all raffles (draft, live, closed, completed)
- See prize pool, status, end date
- Quick actions: View, Edit, Delete

### Create Raffle (`/admin/raffles/new`)

- Full form with all raffle details
- Image upload
- Chain selection
- Status management

### Edit Raffle (`/admin/raffles/[id]/edit`)

- Modify existing raffles
- Update status (change draft to live, etc.)
- Update all fields

---

## ✅ Verification Checklist

Before creating raffles, verify:

- [ ] Wallet connected to website
- [ ] Wallet address matches `ADMIN_WALLETS` environment variable
- [ ] "ADMIN" link appears in header
- [ ] Can access `/admin` page
- [ ] Supabase credentials are set in environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Database migrations have been run (tables exist)

---

## 🚨 Troubleshooting

### "Access Denied" Error

**Problem**: Can't access admin panel even with wallet connected

**Solutions**:
1. Verify wallet address matches exactly (case-insensitive but must match)
2. Check `ADMIN_WALLETS` in Vercel environment variables
3. Redeploy after adding `ADMIN_WALLETS`
4. Clear browser cache and reconnect wallet

### Raffles Not Showing to Public

**Problem**: Created raffle but users can't see it

**Solutions**:
1. Check raffle status = `live` (not `draft`)
2. Verify raffle end date is in the future
3. Check Supabase `public_raffles` view includes your raffle
4. Clear browser cache

### Image Upload Fails

**Problem**: Can't upload raffle image

**Solutions**:
1. Check Supabase Storage bucket exists
2. Verify Supabase Storage permissions
3. Check image file size (should be reasonable)
4. Check browser console for errors

---

## 📊 Supabase Connection Status

Your admin panel is **fully connected to Supabase**:

✅ **Database Tables**:
- `raffles` - Stores all raffle data
- `raffle_entries` - Stores user entries
- `users` - Stores wallet addresses
- `chains` - Stores blockchain networks

✅ **Storage**:
- Images uploaded to Supabase Storage
- Public URLs generated automatically

✅ **Security**:
- Row Level Security (RLS) enabled
- Admin-only fields protected
- Public can only see live raffles

---

## 🎯 Quick Start Summary

1. Connect wallet → Copy address
2. Add address to `ADMIN_WALLETS` in Vercel
3. Redeploy
4. Visit `/admin`
5. Click "CREATE RAFFLE"
6. Set status to `live`
7. Raffle is now visible to everyone!

---

**Need Help?** Check the browser console for errors or review the Supabase dashboard to verify data is being saved correctly.

