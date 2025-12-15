-- =====================================================
-- DELETE ALL EXISTING RAFFLES
-- =====================================================
-- This script removes all raffles so you can create fresh ones
-- Run this in Supabase SQL Editor

-- Delete all raffle entries first (due to foreign key constraint)
DELETE FROM raffle_entries;

-- Delete all raffles
DELETE FROM raffles;

-- Verify deletion
SELECT 
  COUNT(*) as remaining_raffles,
  COUNT(*) FILTER (WHERE status = 'live') as live_raffles,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_raffles
FROM raffles;

-- Should return: remaining_raffles = 0

