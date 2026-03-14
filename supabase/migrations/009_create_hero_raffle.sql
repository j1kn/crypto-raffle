-- =====================================================
-- CREATE HERO RAFFLE (Featured Raffle for Home Page)
-- =====================================================
-- This raffle will appear as the hero/featured raffle at the top of the home page
-- The most recent live raffle automatically becomes the hero raffle
--
-- ⚠️ TIME FORMAT GUIDE:
-- Format: 'YYYY-MM-DD HH:MM:SS+00'
-- Example: '2025-01-15 10:30:00+00' = January 15, 2025 at 10:30 AM UTC
-- 
-- To adjust times:
-- - Year: 2025, 2026, etc.
-- - Month: 01-12 (January = 01, December = 12)
-- - Day: 01-31
-- - Hour: 00-23 (24-hour format, 00 = midnight, 23 = 11 PM)
-- - Minute: 00-59
-- - Second: 00-59 (usually 00)
-- - +00 = UTC timezone (keep this unless you know your timezone offset)
--
-- Examples:
-- '2025-01-15 09:00:00+00' = Jan 15, 2025 at 9:00 AM
-- '2025-12-25 23:59:59+00' = Dec 25, 2025 at 11:59:59 PM
-- '2025-06-01 14:30:00+00' = Jun 1, 2025 at 2:30 PM

-- First, get the Ethereum chain UUID
WITH ethereum_chain AS (
  SELECT id FROM chains WHERE slug = 'ethereum' LIMIT 1
)

-- Insert Hero Raffle
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
)
SELECT 
  'PrimePick Mega Launch Raffle',  -- Change this to your raffle title
  'Join our biggest raffle yet! Win massive prizes in our official launch event. This is the featured raffle that appears at the top of our home page.',  -- Change this to your description
  'https://your-image-url-here.com/hero-raffle.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL (see instructions below)
  5.0,  -- Prize pool amount (e.g., 5 ETH)
  'ETH',  -- Prize pool symbol (ETH, SOL, etc.)
  0.01,  -- Ticket price (e.g., 0.01 ETH)
  1000,  -- Max tickets
  'live',  -- Status: 'draft', 'live', 'closed', 'completed'
  ethereum_chain.id,  -- Chain UUID (fetched from chains table)
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 10:00:00+00'::timestamptz,  -- ⚠️ START TIME: Format: 'YYYY-MM-DD HH:MM:SS+00'
                                           -- Example: '2025-01-15 10:00:00+00' = Jan 15, 2025 at 10:00 AM UTC
                                           -- Adjust: Year, Month, Day, Hour (24h), Minute, Second
  '2025-01-22 18:00:00+00'::timestamptz,  -- ⚠️ END TIME: Format: 'YYYY-MM-DD HH:MM:SS+00'
                                           -- Example: '2025-01-22 18:00:00+00' = Jan 22, 2025 at 6:00 PM UTC
                                           -- Adjust: Year, Month, Day, Hour (24h), Minute, Second
  NULL  -- created_by (NULL for admin-created raffles)
FROM ethereum_chain;

-- Verify the raffle was created
SELECT 
  id,
  title,
  status,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  ends_at,
  created_at
FROM raffles
WHERE title = 'PrimePick Mega Launch Raffle'
ORDER BY created_at DESC
LIMIT 1;

