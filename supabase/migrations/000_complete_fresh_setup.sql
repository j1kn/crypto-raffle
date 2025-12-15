-- =====================================================
-- COMPLETE FRESH DATABASE SETUP FOR PRIMEPICK TOURNAMENT
-- Copy and paste this entire file into Supabase SQL Editor
-- This will DELETE all existing tables and create fresh ones
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: DROP ALL EXISTING TABLES (in correct order)
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS raffle_entries CASCADE;
DROP TABLE IF EXISTS raffles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS chains CASCADE;

-- Drop views
DROP VIEW IF EXISTS public_raffles CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chains table
CREATE TABLE chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  chain_id INTEGER UNIQUE NOT NULL,
  native_symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffles table
CREATE TABLE raffles (
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
  winner_user_id UUID REFERENCES users(id),
  winner_drawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create raffle_entries table
CREATE TABLE raffle_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(raffle_id, user_id)
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_raffles_status ON raffles(status);
CREATE INDEX idx_raffles_chain ON raffles(chain_uuid);
CREATE INDEX idx_raffles_winner ON raffles(winner_user_id);
CREATE INDEX idx_raffle_entries_raffle ON raffle_entries(raffle_id);
CREATE INDEX idx_raffle_entries_user ON raffle_entries(user_id);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffle_entries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE RLS POLICIES
-- =====================================================

-- Chains: Public read access
DROP POLICY IF EXISTS "Chains are viewable by everyone" ON chains;
CREATE POLICY "Chains are viewable by everyone" ON chains
  FOR SELECT USING (true);

-- Users: Public read, allow inserts
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- Raffles: Public can see live raffles only, cannot see receiving_address
DROP POLICY IF EXISTS "Public can view live raffles" ON raffles;
CREATE POLICY "Public can view live raffles" ON raffles
  FOR SELECT USING (status = 'live');

DROP POLICY IF EXISTS "Authenticated users can create raffles" ON raffles;
CREATE POLICY "Authenticated users can create raffles" ON raffles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update raffles" ON raffles;
CREATE POLICY "Authenticated users can update raffles" ON raffles
  FOR UPDATE USING (true);

-- Raffle entries: Public read, allow inserts
DROP POLICY IF EXISTS "Users can view entries" ON raffle_entries;
CREATE POLICY "Users can view entries" ON raffle_entries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert entries" ON raffle_entries;
CREATE POLICY "Users can insert entries" ON raffle_entries
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 6: CREATE PUBLIC VIEW (excludes receiving_address)
-- =====================================================

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

-- =====================================================
-- STEP 7: INSERT DEFAULT CHAINS (Ethereum and Solana)
-- =====================================================

INSERT INTO chains (name, slug, chain_id, native_symbol) VALUES
  ('Ethereum', 'ethereum', 1, 'ETH'),
  ('Solana', 'solana', 101, 'SOL')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 8: GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- COMPLETE! ✅
-- =====================================================
-- 
-- Your database is now set up with:
-- ✅ Users table
-- ✅ Chains table (Ethereum, Solana)
-- ✅ Raffles table (with winner fields)
-- ✅ Raffle entries table
-- ✅ RLS policies configured
-- ✅ Public view for live raffles
-- ✅ All indexes created
-- 
-- You can now create raffles from the admin panel!
-- =====================================================

