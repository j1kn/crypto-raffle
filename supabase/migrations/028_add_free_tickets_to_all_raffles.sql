-- Migration: Add 10% Free Tickets to All Skill Raffles
-- Created: 2026-01-23
-- Description: Updates all 6 skill raffles to have 10% free ticket allocation

-- Update all skill-based raffles to have 10% free tickets
UPDATE raffles 
SET free_ticket_percentage = 10
WHERE title IN (
  'Genesis Pick',
  'Trader''s Reflex',
  'Liquidity Mind',
  'Alpha Vault',
  'Whale Signal',
  'Prime Crown'
)
AND status = 'live';

-- Verify the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM raffles
  WHERE title IN (
    'Genesis Pick',
    'Trader''s Reflex',
    'Liquidity Mind',
    'Alpha Vault',
    'Whale Signal',
    'Prime Crown'
  )
  AND free_ticket_percentage = 10
  AND status = 'live';
  
  RAISE NOTICE 'Updated % raffles to have 10%% free tickets', updated_count;
  
  IF updated_count < 6 THEN
    RAISE WARNING 'Expected 6 raffles to be updated, but only % were updated', updated_count;
  END IF;
END $$;

-- Add migration history record
INSERT INTO migration_history (migration_name, description) 
VALUES ('028_add_free_tickets_to_all_raffles', 'Updated all 6 skill-based raffles to have 10% free ticket allocation for first entries');
