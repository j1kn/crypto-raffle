# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy the provided credentials to `.env.local`
   - Add your admin wallet addresses to `ADMIN_WALLETS` (comma-separated)

3. **Set up Supabase:**
   
   a. **Run the migration:**
      - Go to your Supabase project dashboard
      - Navigate to SQL Editor
      - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
      - Run the migration
   
   b. **Create storage bucket:**
      - Go to Storage in Supabase dashboard
      - Click "New bucket"
      - Name: `raffle-images`
      - Set to **Public**
      - Create bucket
      - Go to Policies tab
      - Add policy:
        - Policy name: "Public read access"
        - Allowed operation: SELECT
        - Target roles: `anon`, `authenticated`
        - Policy definition: `true`
      - Add policy for uploads (if needed):
        - Policy name: "Authenticated upload"
        - Allowed operation: INSERT
        - Target roles: `authenticated`
        - Policy definition: `true`

4. **Add some chains (optional):**
   ```sql
   INSERT INTO chains (name, slug, chain_id, native_symbol) VALUES
   ('Ethereum', 'ethereum', 1, 'ETH'),
   ('Polygon', 'polygon', 137, 'MATIC'),
   ('Binance Smart Chain', 'bsc', 56, 'BNB'),
   ('Avalanche', 'avalanche', 43114, 'AVAX');
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Important Notes

### Admin Access
- Admin functionality requires wallet addresses in `ADMIN_WALLETS` env variable
- For full admin access (bypassing RLS), add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Update API routes in `app/api/admin/` to use service role key for production

### RLS Policies
- Public users can only see live raffles
- `receiving_address` is never exposed in public queries
- Users can only see their own raffle entries
- Admin operations may need service role key to bypass RLS

### WalletConnect
- Ensure your WalletConnect Project ID is correctly set
- The app supports Ethereum, Polygon, BSC, Avalanche, and more

## Troubleshooting

### "Access denied" errors
- Check that your wallet address is in `ADMIN_WALLETS`
- Ensure environment variables are loaded (restart dev server)

### Image upload fails
- Verify storage bucket `raffle-images` exists and is public
- Check storage policies allow INSERT for authenticated users

### RLS blocking queries
- For admin operations, use service role key in API routes
- For public queries, ensure raffles have `status = 'live'`

