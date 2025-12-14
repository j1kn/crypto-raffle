-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chains table
CREATE TABLE IF NOT EXISTS chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  chain_id INTEGER UNIQUE NOT NULL,
  native_symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prize_pool_amount NUMERIC NOT NULL,
  prize_pool_symbol TEXT NOT NULL,
  ticket_price NUMERIC NOT NULL,
  max_tickets INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'live', 'closed', 'completed')),
  chain_uuid UUID REFERENCES chains(id),
  receiving_address TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_entries table
CREATE TABLE IF NOT EXISTS raffle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(raffle_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_chain ON raffles(chain_uuid);
CREATE INDEX IF NOT EXISTS idx_raffle_entries_raffle ON raffle_entries(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_entries_user ON raffle_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chains (public read)
CREATE POLICY "Chains are viewable by everyone" ON chains
  FOR SELECT USING (true);

-- RLS Policies for users
-- Allow users to view any user data (needed for lookups)
-- In production, you may want to restrict this further
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- RLS Policies for raffles
-- Public can only see live raffles, and cannot see receiving_address
-- Note: receiving_address is excluded via the public_raffles view
CREATE POLICY "Public can view live raffles" ON raffles
  FOR SELECT USING (status = 'live');
  
-- Allow inserts for authenticated users (admin will use service role key)
CREATE POLICY "Authenticated users can create raffles" ON raffles
  FOR INSERT WITH CHECK (true);
  
-- Allow updates for authenticated users
CREATE POLICY "Authenticated users can update raffles" ON raffles
  FOR UPDATE USING (true);

-- RLS Policies for raffle_entries
-- Note: In a production app with proper auth, you'd use auth.uid() here
-- For now, we allow authenticated users to view/insert entries
-- You may want to add additional checks based on wallet address matching
CREATE POLICY "Users can view entries" ON raffle_entries
  FOR SELECT USING (true);
  
CREATE POLICY "Users can insert entries" ON raffle_entries
  FOR INSERT WITH CHECK (true);

-- Create a view for public raffle data (excludes receiving_address, includes winner info)
CREATE OR REPLACE VIEW public_raffles AS
SELECT 
  id,
  title,
  description,
  image_url,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  max_tickets,
  status,
  chain_uuid,
  starts_at,
  ends_at,
  created_at,
  winner_user_id,
  winner_drawn_at
FROM raffles
WHERE status IN ('live', 'completed');

-- Grant access to the view
GRANT SELECT ON public_raffles TO anon, authenticated;
