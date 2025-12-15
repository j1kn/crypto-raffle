-- =====================================================
-- INSERT PRIMEPICK LAUNCH RAFFLE DIRECTLY TO SUPABASE
-- =====================================================
-- This script inserts the PrimePick Launch Raffle directly
-- Run this in Supabase SQL Editor to create the raffle
-- =====================================================

-- Insert the raffle
INSERT INTO raffles (
  title,
  description,
  image_url,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  max_tickets,
  status,
  chain_uuid,
  receiving_address,
  starts_at,
  ends_at,
  created_by
) VALUES (
  'PrimePick Launch Raffle',
  'Win 1 ETH in our first official PrimePick raffle. Entries are open immediately. Each ticket costs 0.001 ETH. Winner takes the entire prize pool.',
  NULL, -- No image URL provided
  1, -- 1 ETH
  'ETH',
  0.001, -- 0.001 ETH per ticket
  1000, -- Max 1000 tickets
  'live', -- Status: live (entries are open)
  NULL, -- chain_uuid (can be set to 'ethereum' if needed, but NULL works)
  '0x842bab27de95e329eb17733c1f29c082e5dd94c3', -- Receiving address
  '2025-12-15 10:50:00+00'::timestamptz, -- Starts at: 15/12/2025, 10:50
  '2025-12-15 13:00:00+00'::timestamptz, -- Ends at: 15/12/2025, 13:00
  NULL -- created_by (PIN-based admin, no user ID)
)
RETURNING id, title, status, created_at;

-- Verify the raffle was created
SELECT 
  id,
  title,
  description,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  max_tickets,
  status,
  receiving_address,
  starts_at,
  ends_at,
  created_at
FROM raffles
WHERE title = 'PrimePick Launch Raffle'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- After running this, the raffle will appear on your website!
-- =====================================================

