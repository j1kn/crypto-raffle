-- =====================================================
-- EMERGENCY: DISABLE RLS ON RAFFLES TABLE
-- =====================================================
-- This completely disables RLS on the raffles table
-- Use this if service role key is not working
-- =====================================================

-- Disable RLS entirely on raffles table
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'raffles';

-- =====================================================
-- IMPORTANT: After disabling RLS, raffle creation should work
-- =====================================================
-- Once service role key is confirmed working, you can re-enable RLS:
-- ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
-- =====================================================

