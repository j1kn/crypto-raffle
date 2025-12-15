-- =====================================================
-- CREATE HERO RAFFLE (Featured Raffle for Home Page)
-- =====================================================
-- This raffle will appear as the hero/featured raffle at the top of the home page
-- The most recent live raffle automatically becomes the hero raffle

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
  NOW(),  -- Start time (starts immediately)
  NOW() + INTERVAL '7 days',  -- End time (7 days from now - adjust as needed)
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

