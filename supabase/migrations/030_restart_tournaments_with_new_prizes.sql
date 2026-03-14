-- Migration: Restart tournaments with new prize pools and entry fees
-- Date: 2026-01-28
-- Description: Update existing tournaments with new prize pools, entry fees, and restart timers with 10% free entries

-- Update the $500 Elite Tournament (keep as main tournament with 1000 USDT prize)
UPDATE skill_tournaments
SET 
  title = 'Elite Championship - $1000 USDT Prize',
  description = 'The ultimate skill challenge! Answer 3 crypto questions correctly and compete for the grand prize of $1000 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 1000,
  prize_pool_symbol = 'USDT',
  entry_fee = 5,
  ends_at = NOW() + INTERVAL '30 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '86b6be65-43c5-4fec-a708-805d737fc498';

-- Update $150 tournament to $500 tournament
UPDATE skill_tournaments
SET 
  title = 'Pro Tournament - $500 USDT Prize',
  description = 'Test your crypto knowledge! Answer 3 questions correctly and compete for $500 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 500,
  prize_pool_symbol = 'USDT',
  entry_fee = 4,
  ends_at = NOW() + INTERVAL '21 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '3f92f57f-3c73-4836-9a87-a47820da70ed';

-- Update $10 tournament to $200 tournament
UPDATE skill_tournaments
SET 
  title = 'Advanced Challenge - $200 USDT Prize',
  description = 'Show your skills! Answer 3 crypto questions and win $200 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 200,
  prize_pool_symbol = 'USDT',
  entry_fee = 3,
  ends_at = NOW() + INTERVAL '14 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '29a9ac71-0ec8-4da2-ab83-56bc3166759d';

-- Update $1 tournament to $50 tournament
UPDATE skill_tournaments
SET 
  title = 'Quick Fire - $50 USDT Prize',
  description = 'Fast-paced crypto quiz! Answer 3 questions and compete for $50 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 50,
  prize_pool_symbol = 'USDT',
  entry_fee = 2,
  ends_at = NOW() + INTERVAL '7 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '7ff44ffe-78cb-4c9f-8b07-85ae1e99939f';

-- Update $0.6 tournament to $30 tournament
UPDATE skill_tournaments
SET 
  title = 'Starter Challenge - $30 USDT Prize',
  description = 'Perfect for beginners! Answer 3 crypto questions and win $30 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 30,
  prize_pool_symbol = 'USDT',
  entry_fee = 1.5,
  ends_at = NOW() + INTERVAL '5 days',
  status = 'live',
  updated_at = NOW()
WHERE id = 'c88660c5-ebc6-4dc4-bf36-cf4b125cf2fe';

-- Update $0.15 tournament to $10 tournament
UPDATE skill_tournaments
SET 
  title = 'Micro Tournament - $10 USDT Prize',
  description = 'Entry level tournament! Answer 3 crypto questions and compete for $10 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 10,
  prize_pool_symbol = 'USDT',
  entry_fee = 1,
  ends_at = NOW() + INTERVAL '3 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '6580224c-b649-42fe-9575-ce538a12834d';

-- Update the smallest tournament (keep it as a practice tournament)
UPDATE skill_tournaments
SET 
  title = 'Practice Tournament - $5 USDT Prize',
  description = 'Practice your skills! Answer 3 crypto questions and win $5 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 5,
  prize_pool_symbol = 'USDT',
  entry_fee = 0.5,
  ends_at = NOW() + INTERVAL '2 days',
  status = 'live',
  updated_at = NOW()
WHERE id = '55a9d5a1-1fa7-4f20-84eb-74bb3c4c5853';

-- Add 10% free entry percentage to ALL tournaments (if column exists)
-- This assumes the free_ticket_percentage column exists in skill_tournaments
-- If it doesn't exist, we'll need to add it first

-- Check if we need to add the column to skill_tournaments table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skill_tournaments' 
    AND column_name = 'free_ticket_percentage'
  ) THEN
    ALTER TABLE skill_tournaments 
    ADD COLUMN free_ticket_percentage INTEGER DEFAULT 0 
    CHECK (free_ticket_percentage >= 0 AND free_ticket_percentage <= 100);
    
    COMMENT ON COLUMN skill_tournaments.free_ticket_percentage IS 
    'Percentage of first entries that are free (0-100). Example: 10 means first 10% of entries are free';
  END IF;
END $$;

-- Now set 10% free entries for all tournaments
UPDATE skill_tournaments
SET free_ticket_percentage = 10
WHERE status = 'live';

-- Add entry_limit_per_wallet if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skill_tournaments' 
    AND column_name = 'entry_limit_per_wallet'
  ) THEN
    ALTER TABLE skill_tournaments 
    ADD COLUMN entry_limit_per_wallet INTEGER;
    
    COMMENT ON COLUMN skill_tournaments.entry_limit_per_wallet IS 
    'Maximum number of entries a single wallet can make (NULL = unlimited)';
  END IF;
END $$;

-- Set reasonable entry limits based on prize pool
UPDATE skill_tournaments SET entry_limit_per_wallet = 5 WHERE prize_pool_amount >= 500;
UPDATE skill_tournaments SET entry_limit_per_wallet = 10 WHERE prize_pool_amount >= 100 AND prize_pool_amount < 500;
UPDATE skill_tournaments SET entry_limit_per_wallet = 20 WHERE prize_pool_amount < 100;

-- Add is_free_entry column to skill_tournament_entries if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skill_tournament_entries' 
    AND column_name = 'is_free_entry'
  ) THEN
    ALTER TABLE skill_tournament_entries 
    ADD COLUMN is_free_entry BOOLEAN DEFAULT FALSE;
    
    COMMENT ON COLUMN skill_tournament_entries.is_free_entry IS 
    'True if this entry was part of the free ticket allocation';
  END IF;
END $$;

-- Log the migration
INSERT INTO migration_history (migration_name, description)
VALUES (
  '030_restart_tournaments_with_new_prizes',
  'Updated all tournaments with new prize pools ($5-$1000), entry fees ($0.5-$5), restarted timers, and added 10% free entries'
);

-- Display summary of updated tournaments
SELECT 
  title,
  prize_pool_amount || ' ' || prize_pool_symbol as prize_pool,
  entry_fee || ' USD' as entry_fee,
  free_ticket_percentage || '% free' as free_entries,
  entry_limit_per_wallet as max_entries_per_wallet,
  ends_at,
  (SELECT COUNT(*) FROM skill_tournament_entries WHERE tournament_id = skill_tournaments.id) as current_entries
FROM skill_tournaments
WHERE status = 'live'
ORDER BY prize_pool_amount DESC;
