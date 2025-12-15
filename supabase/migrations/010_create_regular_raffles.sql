-- =====================================================
-- CREATE REGULAR RAFFLES (For Home Page Grid)
-- =====================================================
-- These raffles will appear in the 6-raffle grid on the home page
-- The hero raffle is automatically excluded from this list
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

-- Insert Regular Raffle #1
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
  'Weekly Winner Raffle',  -- Change this to your raffle title
  'Enter our weekly raffle for a chance to win amazing prizes! New raffle every week.',  -- Change this to your description
  'https://your-image-url-here.com/raffle-1.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  2.0,  -- Prize pool amount
  'ETH',  -- Prize pool symbol
  0.005,  -- Ticket price
  500,  -- Max tickets
  'live',  -- Status
  ethereum_chain.id,  -- Chain UUID
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 10:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-20 18:00:00+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL  -- created_by
FROM ethereum_chain;

-- Insert Regular Raffle #2
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
  'Community Choice Raffle',
  'Voted by the community! This raffle features prizes chosen by our amazing community members.',
  'https://your-image-url-here.com/raffle-2.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  3.0,
  'ETH',
  0.008,
  750,
  'live',
  ethereum_chain.id,
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 11:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-21 20:00:00+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL
FROM ethereum_chain;

-- Insert Regular Raffle #3
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
  'Flash Raffle',
  'Quick raffle with fast results! Enter now and winners announced soon.',
  'https://your-image-url-here.com/raffle-3.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  1.5,
  'ETH',
  0.003,
  300,
  'live',
  ethereum_chain.id,
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 12:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-18 15:00:00+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL
FROM ethereum_chain;

-- Insert Regular Raffle #4
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
  'Premium Prize Raffle',
  'High-value prizes await! Enter for a chance to win premium rewards.',
  'https://your-image-url-here.com/raffle-4.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  4.0,
  'ETH',
  0.01,
  800,
  'live',
  ethereum_chain.id,
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 13:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-25 22:00:00+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL
FROM ethereum_chain;

-- Insert Regular Raffle #5
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
  'Beginner Friendly Raffle',
  'Perfect for newcomers! Low entry fee with great prizes. Start your raffle journey here.',
  'https://your-image-url-here.com/raffle-5.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  1.0,
  'ETH',
  0.002,
  400,
  'live',
  ethereum_chain.id,
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 14:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-19 16:00:00+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL
FROM ethereum_chain;

-- Insert Regular Raffle #6
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
  'Elite Tournament Raffle',
  'For the elite players! Higher stakes, bigger rewards. Are you ready?',
  'https://your-image-url-here.com/raffle-6.jpg',  -- ⚠️ REPLACE WITH YOUR IMAGE URL
  6.0,
  'ETH',
  0.015,
  1200,
  'live',
  ethereum_chain.id,
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',  -- ⚠️ REPLACE WITH YOUR RECEIVING WALLET ADDRESS
  '2025-01-15 15:00:00+00'::timestamptz,  -- ⚠️ START TIME: 'YYYY-MM-DD HH:MM:SS+00'
  '2025-01-29 23:59:59+00'::timestamptz,  -- ⚠️ END TIME: 'YYYY-MM-DD HH:MM:SS+00'
  NULL
FROM ethereum_chain;

-- Verify all raffles were created
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
WHERE status = 'live'
ORDER BY created_at DESC;

