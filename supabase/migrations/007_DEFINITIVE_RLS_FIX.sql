-- =====================================================
-- DEFINITIVE RLS FIX - Run this to completely fix RLS
-- =====================================================
-- This script will:
-- 1. Disable RLS on raffles table
-- 2. Drop ALL existing policies
-- 3. Verify RLS is disabled
-- =====================================================

-- Step 1: Disable RLS completely
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (in case any remain)
DROP POLICY IF EXISTS "allow_all_inserts" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can create raffles" ON raffles;
DROP POLICY IF EXISTS "public_insert" ON raffles;
DROP POLICY IF EXISTS "Public can view live raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can update raffles" ON raffles;
DROP POLICY IF EXISTS "Users can view entries" ON raffle_entries;
DROP POLICY IF EXISTS "Users can insert entries" ON raffle_entries;

-- Step 3: Verify RLS is disabled
DO $$
DECLARE
    rls_status boolean;
BEGIN
    SELECT rowsecurity INTO rls_status
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'raffles';
    
    IF rls_status = true THEN
        RAISE EXCEPTION 'RLS is still enabled! Run ALTER TABLE raffles DISABLE ROW LEVEL SECURITY; again';
    ELSE
        RAISE NOTICE '✅ RLS is DISABLED on raffles table';
    END IF;
END $$;

-- Step 4: Verify no policies exist
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'raffles';
    
    IF policy_count > 0 THEN
        RAISE NOTICE '⚠️ Warning: % policies still exist on raffles table', policy_count;
        RAISE NOTICE 'Run: SELECT policyname FROM pg_policies WHERE tablename = ''raffles''; to see them';
    ELSE
        RAISE NOTICE '✅ No policies exist on raffles table';
    END IF;
END $$;

-- Step 5: Final verification query
SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN rowsecurity THEN 'ENABLED ❌'
        ELSE 'DISABLED ✅'
    END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'raffles';

SELECT 
    'Policies Count' as check_type,
    COUNT(*)::text as status
FROM pg_policies
WHERE tablename = 'raffles';

-- =====================================================
-- If you see "DISABLED ✅" and "0" policies, RLS is fixed!
-- =====================================================

