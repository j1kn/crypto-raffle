-- =====================================================
-- CREATE REGULAR RAFFLES (For Home Page Grid)
-- =====================================================
-- These raffles will appear in the 6-raffle grid on the home page
-- The hero raffle is automatically excluded from this list

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
  NOW(),  -- Start time
  NOW() + INTERVAL '5 days',  -- End time (5 days from now)
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
  NOW(),
  NOW() + INTERVAL '6 days',
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
  NOW(),
  NOW() + INTERVAL '3 days',
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
  NOW(),
  NOW() + INTERVAL '10 days',
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
  NOW(),
  NOW() + INTERVAL '4 days',
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
  NOW(),
  NOW() + INTERVAL '14 days',
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

