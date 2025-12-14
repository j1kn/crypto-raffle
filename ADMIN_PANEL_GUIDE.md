# 🔐 Admin Panel Access Guide

## Overview

The admin panel allows you to create, edit, and manage raffles that will be displayed to all users worldwide with live countdown timers. Only your wallet address can access this panel.

## 🚀 How to Access the Admin Panel

### Step 1: Get Your Wallet Address

1. Connect your wallet to the website using the "Connect Wallet" button
2. Your wallet address will be displayed in the header (e.g., `0x1234...5678`)
3. Copy your full wallet address

### Step 2: Set Up Admin Access

#### For Local Development:

1. Create or edit `.env.local` in the project root:
```bash
ADMIN_WALLETS=your_wallet_address_here
```

**Example:**
```bash
ADMIN_WALLETS=0x1234567890abcdef1234567890abcdef12345678
```

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Set:
   - **Key:** `ADMIN_WALLETS`
   - **Value:** Your wallet address (e.g., `0x1234567890abcdef1234567890abcdef12345678`)
5. Select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your application for changes to take effect

#### For Netlify Deployment:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add variable**
4. Set:
   - **Key:** `ADMIN_WALLETS`
   - **Value:** Your wallet address
5. Click **Save**
6. **Trigger a new deployment** for changes to take effect

### Step 3: Access the Admin Panel

1. **Connect your wallet** to the website (the wallet address must match the one in `ADMIN_WALLETS`)
2. Navigate to: `https://your-domain.com/admin`
   - Or click the **"ADMIN"** link in the header (only visible when your wallet is connected and is an admin)
3. You should see the admin panel dashboard

## 📝 Creating a New Raffle

### Step-by-Step Process:

1. **Go to Admin Panel** (`/admin`)
2. Click **"CREATE RAFFLE"** button (top right)
3. Fill out the raffle form:

   **Required Fields:**
   - **Raffle Image:** Upload an image (PNG, JPG, GIF, max 10MB)
   - **Title:** Name of your raffle (e.g., "Mega Crypto Tournament")
   - **Prize Pool Amount:** The prize amount (e.g., `10000`)
   - **Prize Pool Symbol:** Currency symbol (e.g., `ETH`, `USDT`, `BNB`)
   - **Entry Fees:** Cost per ticket (e.g., `0.1`)
   - **Max Tickets:** Maximum number of entries allowed
   - **Status:** Choose `draft` (hidden) or `live` (visible to everyone)
   - **Blockchain Network:** Select the chain (Ethereum, Polygon, Base, etc.)
   - **Receive Funds Wallet Address:** Your wallet address that will receive payments
   - **Ends At:** When the raffle ends (date and time)

   **Optional Fields:**
   - **Description:** Detailed description of the raffle
   - **Starts At:** When the raffle starts (leave empty to start immediately)

4. Click **"CREATE RAFFLE"**
5. The raffle will be saved to Supabase and immediately visible to all users if status is `live`

## 🌍 How Raffles Appear to Users

Once you create a raffle with status `live`:

1. **Raffle List Page** (`/raffles`):
   - All live raffles appear in a grid
   - Each raffle card shows:
     - Prize pool amount
     - Entry fee
     - **Live countdown timer** (updates in real-time)
     - Image and title

2. **Raffle Detail Page** (`/raffles/[id]`):
   - Full raffle details
   - Large countdown timer
   - Entry button
   - Prize information

3. **Global Visibility:**
   - Raffles are stored in Supabase database
   - Accessible to anyone visiting your website
   - Countdown timers update in real-time
   - No authentication required to view raffles

## 🛠️ Admin Panel Features

### Dashboard (`/admin`)

- **View All Raffles:** See all raffles you've created
- **Status Indicators:** 
  - 🟢 **LIVE** - Visible to everyone
  - ⚪ **DRAFT** - Hidden from public
  - 🟠 **CLOSED** - Ended but visible
  - ⚫ **COMPLETED** - Finished

### Create Raffle (`/admin/raffles/new`)

- Full form to create new raffles
- Image upload to Supabase storage
- All raffle details configuration

### Edit Raffle (`/admin/raffles/[id]/edit`)

- Edit existing raffles
- Update all fields
- Change status (draft ↔ live)

### Actions Available:

- **👁️ View:** See how the raffle appears to users
- **✏️ Edit:** Modify raffle details
- **🗑️ Delete:** Remove raffle permanently

## 🔒 Security

- **Only your wallet address** (in `ADMIN_WALLETS`) can access the admin panel
- Wallet connection is verified on every admin page load
- Non-admin users are automatically redirected
- Admin wallet addresses are case-insensitive

## 📊 Database Storage

All raffles are stored in Supabase:

- **Table:** `raffles`
- **Public View:** `public_raffles` (only shows `live` raffles, hides sensitive data)
- **Storage:** Images stored in `raffle-images` bucket

## ⚠️ Important Notes

1. **Environment Variable:**
   - Must be set in both local (`.env.local`) and production (Vercel/Netlify)
   - Format: `ADMIN_WALLETS=wallet1,wallet2` (comma-separated for multiple admins)
   - Changes require redeployment

2. **Raffle Status:**
   - `draft` - Only visible to you in admin panel
   - `live` - Visible to everyone on the website
   - `closed` - Ended but still visible
   - `completed` - Finished

3. **Countdown Timers:**
   - Automatically update every second
   - Show time remaining until raffle ends
   - Visible on raffle cards and detail pages

4. **Image Upload:**
   - Images are uploaded to Supabase Storage
   - Maximum file size: 10MB
   - Supported formats: PNG, JPG, GIF

## 🆘 Troubleshooting

### Can't Access Admin Panel?

1. **Check wallet connection:**
   - Make sure your wallet is connected
   - Verify the address matches `ADMIN_WALLETS`

2. **Verify environment variable:**
   - Check `.env.local` (local) or Vercel/Netlify settings (production)
   - Ensure `ADMIN_WALLETS` is set correctly
   - Redeploy if you just added it

3. **Check wallet address format:**
   - Must be a valid Ethereum address (starts with `0x`)
   - Case doesn't matter
   - No extra spaces

### Raffle Not Showing?

1. **Check status:** Must be `live` to appear publicly
2. **Check database:** Verify raffle exists in Supabase
3. **Check RLS policies:** Ensure `public_raffles` view is accessible

### Countdown Timer Not Working?

- Timers update automatically via JavaScript
- Check browser console for errors
- Ensure `ends_at` date is in the future

## 📞 Quick Reference

- **Admin Panel URL:** `/admin`
- **Create Raffle:** `/admin/raffles/new`
- **Public Raffles:** `/raffles`
- **Environment Variable:** `ADMIN_WALLETS`
- **Database:** Supabase `raffles` table

---

**Remember:** Only wallet addresses in `ADMIN_WALLETS` can access the admin panel. Keep this secure and never commit it to public repositories!

