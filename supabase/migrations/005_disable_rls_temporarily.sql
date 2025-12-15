-- =====================================================
-- TEMPORARY: DISABLE RLS ON RAFFLES TABLE FOR DEBUGGING
-- =====================================================
-- WARNING: This disables RLS entirely. Use ONLY for debugging.
-- Once service role key is confirmed working, re-enable RLS.
-- =====================================================

-- Disable RLS on raffles table (TEMPORARY - for debugging only)
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TO RE-ENABLE RLS LATER:
-- =====================================================
-- ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
-- =====================================================
-- Then run migration 004_fix_rls_insert_policy.sql
-- =====================================================

