-- Migration: Update raffles with new prize pools and restart timers
-- Date: 2026-01-28
-- Description: Keep main $1000 raffle, update others with new prizes ($10, $30, $50, $200, $500) and 10% free entries

-- Keep Genesis Pick as the main $1000 raffle (has 4 entries)
UPDATE raffles
SET 
  title = 'Genesis Pick - $1000 USDT Grand Prize',
  description = 'The flagship raffle! Win $1000 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 1000,
  prize_pool_symbol = 'USDT',
  ticket_price = 5,
  ends_at = NOW() + INTERVAL '30 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 500
WHERE id = 'b201dd3b-71db-41d1-a21b-d4a1027c3938';

-- Update $100 raffle to $500 raffle
UPDATE raffles
SET 
  title = 'Elite Raffle - $500 USDT Prize',
  description = 'High stakes raffle! Win $500 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 500,
  prize_pool_symbol = 'USDT',
  ticket_price = 4,
  ends_at = NOW() + INTERVAL '21 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 300
WHERE id = '03387822-17d0-407a-8fac-69dae17ef91e';

-- Update Trader's Reflex to $200 raffle
UPDATE raffles
SET 
  title = 'Pro Raffle - $200 USDT Prize',
  description = 'Professional level raffle! Win $200 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 200,
  prize_pool_symbol = 'USDT',
  ticket_price = 3,
  ends_at = NOW() + INTERVAL '14 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 200
WHERE id = '037106f9-e87c-4459-9a0a-2a0a4a059f6b';

-- Update Liquidity Mind to $50 raffle
UPDATE raffles
SET 
  title = 'Quick Win - $50 USDT Prize',
  description = 'Fast raffle action! Win $50 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 50,
  prize_pool_symbol = 'USDT',
  ticket_price = 2,
  ends_at = NOW() + INTERVAL '7 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 100
WHERE id = 'fbde96fb-396d-477c-9f15-e01f666c58ed';

-- Update Alpha Vault to $30 raffle
UPDATE raffles
SET 
  title = 'Starter Raffle - $30 USDT Prize',
  description = 'Perfect for beginners! Win $30 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 30,
  prize_pool_symbol = 'USDT',
  ticket_price = 1.5,
  ends_at = NOW() + INTERVAL '5 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 80
WHERE id = 'd1fd49b9-2626-4dab-a6eb-08f7310ca16e';

-- Update Whale Signal to $10 raffle
UPDATE raffles
SET 
  title = 'Micro Raffle - $10 USDT Prize',
  description = 'Entry level raffle! Win $10 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 10,
  prize_pool_symbol = 'USDT',
  ticket_price = 1,
  ends_at = NOW() + INTERVAL '3 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 50
WHERE id = '59e7a566-1277-4f63-88f5-dcdd95c85f34';

-- Update Prime Crown to practice raffle
UPDATE raffles
SET 
  title = 'Practice Raffle - $5 USDT Prize',
  description = 'Practice raffle! Win $5 USDT. First 10% of entries are FREE!',
  prize_pool_amount = 5,
  prize_pool_symbol = 'USDT',
  ticket_price = 0.5,
  ends_at = NOW() + INTERVAL '2 days',
  status = 'live',
  free_ticket_percentage = 10,
  max_tickets = 30
WHERE id = '30171bba-6ad5-4d66-a94d-17a2fc14865f';

-- Set entry limits based on prize pool
UPDATE raffles SET entry_limit_per_wallet = 5 WHERE prize_pool_amount >= 500;
UPDATE raffles SET entry_limit_per_wallet = 10 WHERE prize_pool_amount >= 100 AND prize_pool_amount < 500;
UPDATE raffles SET entry_limit_per_wallet = 20 WHERE prize_pool_amount < 100;

-- Log the migration
INSERT INTO migration_history (migration_name, description)
VALUES (
  '031_update_raffles_with_new_prizes',
  'Updated all raffles with new prize pools ($5-$1000), ticket prices ($0.5-$5), restarted timers, and added 10% free entries'
);

-- Display summary
SELECT 
  title,
  prize_pool_amount || ' ' || prize_pool_symbol as prize_pool,
  ticket_price || ' USD' as ticket_price,
  free_ticket_percentage || '% free' as free_entries,
  entry_limit_per_wallet as max_per_wallet,
  max_tickets,
  ends_at,
  (SELECT COUNT(*) FROM raffle_entries WHERE raffle_id = raffles.id) as current_entries
FROM raffles
WHERE status = 'live'
ORDER BY prize_pool_amount DESC;
