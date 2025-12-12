# Admin Panel Setup Guide

## 🔐 Setting Up Admin Access

To access the admin panel and create raffles, you need to add your wallet address to the `ADMIN_WALLETS` environment variable.

### Steps:

1. **Get Your Wallet Address:**
   - Connect your wallet using the "CONNECT WALLET" button
   - Copy your wallet address (it will be shown in the header)

2. **Add to Environment Variables:**
   
   **For Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add or update `ADMIN_WALLETS`
   - Value format: `yourwalletaddress1,yourwalletaddress2` (comma-separated, no spaces)
   - Example: `0x1234567890abcdef1234567890abcdef12345678,0xabcdefabcdefabcdefabcdefabcdefabcdefabcd`
   - Make sure to set it for **Production**, **Preview**, and **Development** environments
   - Click "Save"
   - **Redeploy** your application

   **For Local Development:**
   - Open `.env.local` file
   - Add or update: `ADMIN_WALLETS=yourwalletaddress1,yourwalletaddress2`
   - Restart your development server

3. **Verify Admin Access:**
   - Connect your wallet
   - You should see an "ADMIN" link in the header (with a shield icon)
   - Click it to access the admin panel
   - If you don't see it, make sure:
     - Your wallet is connected
     - Your wallet address is in `ADMIN_WALLETS`
     - You've redeployed after adding the environment variable

## 🎯 Admin Panel Features

Once you have admin access, you can:

1. **View All Raffles:**
   - See all raffles (draft, live, closed, completed)
   - View raffle details including receiving addresses

2. **Create New Raffles:**
   - Click "CREATE RAFFLE" button
   - Fill in raffle details:
     - Title and description
     - Upload image
     - Prize pool amount and symbol
     - Ticket price
     - Max tickets
     - Select chain
     - Set start and end dates
     - **Important:** Enter receiving address (where payments will go)
     - Set status (draft or live)

3. **Edit Raffles:**
   - Click the edit icon on any raffle
   - Update any raffle details
   - Change status (e.g., from draft to live)

4. **Delete Raffles:**
   - Click the delete icon
   - Confirm deletion

## 🔒 Security Notes

- **Receiving Address:** This is never shown to public users, only admins can see it
- **Admin Access:** Only wallet addresses in `ADMIN_WALLETS` can access the admin panel
- **Environment Variables:** Never commit `ADMIN_WALLETS` to public repositories
- **Multiple Admins:** You can add multiple wallet addresses separated by commas

## 🚨 Troubleshooting

**Can't see ADMIN link:**
- Make sure your wallet is connected
- Verify your wallet address is in `ADMIN_WALLETS` (case-insensitive)
- Check that you've redeployed after adding the environment variable
- Try disconnecting and reconnecting your wallet

**Admin panel shows "Access denied":**
- Double-check your wallet address matches exactly (including 0x prefix)
- Ensure `ADMIN_WALLETS` is set correctly in environment variables
- Make sure there are no extra spaces in the wallet addresses

**Can't create raffles:**
- Ensure you're connected with an admin wallet
- Check that Supabase is properly configured
- Verify storage bucket `raffle-images` exists and is public

## 📝 Quick Start

1. Connect your wallet
2. Copy your wallet address
3. Add it to `ADMIN_WALLETS` in Vercel environment variables
4. Redeploy
5. Connect wallet again
6. Click "ADMIN" in header
7. Start creating raffles!

