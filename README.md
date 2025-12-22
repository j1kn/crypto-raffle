# PrimePick Tournament

A production-grade, mobile-first crypto raffle platform with admin panel, Supabase integration, WalletConnect v2, and dark neon gaming UI.

## 🚀 Features

- **Crypto Raffle Platform**: Create and participate in crypto raffles
- **WalletConnect v2 Integration**: Connect wallets seamlessly
- **Admin Panel**: Full CRUD operations for raffles
- **Supabase Backend**: Secure database with RLS policies
- **Dark Gaming UI**: Modern dark theme with neon green and orange accents
- **Mobile-First Design**: Responsive across all devices

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database + Storage)
- **WalletConnect v2**

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- WalletConnect Project ID

## 🔧 Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local` and fill in your credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ADMIN_WALLETS=wallet1,wallet2
   ```

   For client-side access, also add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

3. **Set up Supabase:**
   - Run the migration in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
   - Create a storage bucket named `raffle-images` with public access:
     - Go to Storage in Supabase dashboard
     - Create new bucket: `raffle-images`
     - Set it to public
     - Add policy: `SELECT` for `anon` and `authenticated` roles
   - **Important**: For full admin functionality, add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` and update API routes to use it (currently uses anon key which is subject to RLS)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🗄 Database Schema

The platform uses the following tables:

- **users**: Wallet addresses and user data
- **chains**: Supported blockchain networks
- **raffles**: Raffle information (receiving_address is private)
- **raffle_entries**: User entries in raffles

## 🔐 Security

- Row Level Security (RLS) policies protect sensitive data
- `receiving_address` is never exposed to public queries
- Admin access is controlled via `ADMIN_WALLETS` environment variable
- Public can only view live raffles

## 📱 Pages

- `/` - Landing page
- `/raffles` - Browse active raffles
- `/raffles/[id]` - Raffle detail page
- `/dashboard` - User dashboard (requires wallet connection)
- `/admin` - Admin panel (requires admin wallet)

## 🎨 Design

The UI follows a dark gaming theme with:
- Primary green: `#00ff88`
- Primary orange: `#ff6b35`
- Dark backgrounds with neon accents
- Modern typography (Inter font)

## 📝 Notes

- Admin panel requires wallet connection with address in `ADMIN_WALLETS`
- Image uploads go to Supabase Storage bucket `raffle-images`
- WalletConnect supports Ethereum, Polygon, BSC, Avalanche, and more

## 🚢 Deployment

### Netlify Deployment

See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for detailed Netlify deployment instructions.

**Quick Steps:**
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard (see NETLIFY_DEPLOY.md)
4. Deploy!

**Required Environment Variables for Netlify:**
- `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `WALLETCONNECT_PROJECT_ID` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `ADMIN_WALLETS`

### Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred platform

3. Ensure environment variables are set in your deployment platform

## 📄 License

All rights reserved.

// Force deployment trigger - 1766417669
// Mobile wallet fix deployment - 1766418217
