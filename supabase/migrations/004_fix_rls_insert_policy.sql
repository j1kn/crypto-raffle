-- =====================================================
-- TEMPORARY RLS POLICY FOR DEBUGGING RAFFLE INSERTS
-- =====================================================
-- This policy allows ALL inserts to the raffles table
-- Use this ONLY for debugging. Remove after confirming service role key works.
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

-- Drop existing insert policies
DROP POLICY IF EXISTS "Authenticated users can create raffles" ON raffles;
DROP POLICY IF EXISTS "public_insert" ON raffles;
DROP POLICY IF EXISTS "allow_all_inserts" ON raffles;

-- Create temporary policy that allows ALL inserts (for debugging)
CREATE POLICY "allow_all_inserts"
ON raffles
FOR INSERT
TO public
WITH CHECK (true);

-- =====================================================
-- NOTE: This policy is TEMPORARY for debugging.
-- Once you confirm the service role key is working,
-- you can remove this policy and rely on service role key
-- which bypasses RLS entirely.
-- =====================================================

