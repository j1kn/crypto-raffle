-- Migration: Create 6 Skill-Based Raffles with Quiz Questions
-- Created: 2026-01-23
-- Description: Creates 6 raffles with escalating prizes and difficulty, plus raffle-specific quiz questions

-- First, let's add a field to track free ticket allocation
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS free_ticket_percentage INTEGER DEFAULT 0 CHECK (free_ticket_percentage >= 0 AND free_ticket_percentage <= 100);
COMMENT ON COLUMN raffles.free_ticket_percentage IS 'Percentage of first entries that are free (0-100). Example: 10 means first 10% of tickets are free';

-- Add a field to raffle_entries to track if entry was free
ALTER TABLE raffle_entries ADD COLUMN IF NOT EXISTS is_free_entry BOOLEAN DEFAULT false;
COMMENT ON COLUMN raffle_entries.is_free_entry IS 'True if this entry was part of the free ticket allocation';

-- Add entry limit per wallet to raffles table
ALTER TABLE raffles ADD COLUMN IF NOT EXISTS entry_limit_per_wallet INTEGER DEFAULT NULL;
COMMENT ON COLUMN raffles.entry_limit_per_wallet IS 'Maximum number of tickets a single wallet can purchase (NULL = 20% of max_tickets)';

-- Get the Ethereum chain UUID
DO $$
DECLARE
  eth_chain_uuid UUID;
  raffle1_id UUID;
  raffle2_id UUID;
  raffle3_id UUID;
  raffle4_id UUID;
  raffle5_id UUID;
  raffle6_id UUID;
BEGIN
  -- Get Ethereum chain ID
  SELECT id INTO eth_chain_uuid FROM chains WHERE slug = 'ethereum' OR chain_id = 1 LIMIT 1;
  
  IF eth_chain_uuid IS NULL THEN
    RAISE EXCEPTION 'Ethereum chain not found. Please run migration 002_add_popular_chains.sql first';
  END IF;

  -- RAFFLE 1: Genesis Pick (Free-entry hook · trust-builder)
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet
  ) VALUES (
    'Genesis Pick',
    'The opening ritual. Early believers enter free. Latecomers pay for conviction. Skill filters luck; discipline filters noise.

Prize: $1,000 USDT
Entry: $10 per ticket
Free Tickets: First 10% (100 tickets) are FREE
Max per wallet: 3 tickets
Duration: 7 days

Answer 2 out of 3 skill questions correctly to qualify.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Crypto%20Referral%20Program%20_%20Earn%20Crypto%20_%20KuCoin.jpeg',
    1000,
    'USDT',
    10,
    1000,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '7 days',
    true,
    10, -- 10% free tickets
    3   -- Max 3 tickets per wallet
  ) RETURNING id INTO raffle1_id;

  -- RAFFLE 2: Trader's Reflex
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet
  ) VALUES (
    'Trader''s Reflex',
    'Speed beats hope. This raffle rewards those who understand reaction, not prediction.

Prize: $2,500 USDT
Entry: $15 per ticket
Duration: 10 days
Max per wallet: 5 tickets

Answer all 3 skill questions correctly to qualify.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Gemini_Generated_Image_uzj8bkuzj8bkuzj8.png',
    2500,
    'USDT',
    15,
    800,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '10 days',
    false,
    0, -- No free tickets
    5  -- Max 5 tickets per wallet
  ) RETURNING id INTO raffle2_id;

  -- RAFFLE 3: Liquidity Mind
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet
  ) VALUES (
    'Liquidity Mind',
    'Not for gamblers. For those who understand depth, flow, and exits.

Prize: $5,000 USDT
Entry: $25 per ticket
Duration: 14 days
Max per wallet: 5 tickets

Answer 2 out of 3 skill questions correctly to qualify.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Gemini_Generated_Image_ejw0mhejw0mhejw0.png',
    5000,
    'USDT',
    25,
    600,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '14 days',
    false,
    0,
    5
  ) RETURNING id INTO raffle3_id;

  -- RAFFLE 4: Alpha Vault
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet
  ) VALUES (
    'Alpha Vault',
    'This is where amateurs stop. Capital meets comprehension.

Prize: $10,000 USDT
Entry: $50 per ticket
Duration: 21 days
Max per wallet: 3 tickets

Answer all 3 skill questions correctly to qualify.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Gemini_Generated_Image_ms0liims0liims0l.png',
    10000,
    'USDT',
    50,
    500,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '21 days',
    false,
    0,
    3
  ) RETURNING id INTO raffle4_id;

  -- RAFFLE 5: Whale Signal
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet
  ) VALUES (
    'Whale Signal',
    'Low noise. High intent. Only disciplined capital swims here.

Prize: $25,000 USDT
Entry: $100 per ticket
Duration: 30 days
Max per wallet: 2 tickets

Answer all 3 skill questions correctly to qualify.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Gemini_Generated_Image_uzj8bkuzj8bkuzj8.png',
    25000,
    'USDT',
    100,
    400,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '30 days',
    false,
    0,
    2
  ) RETURNING id INTO raffle5_id;

  -- RAFFLE 6: Prime Crown (Flagship event)
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
    is_featured,
    free_ticket_percentage,
    entry_limit_per_wallet,
    banner_tagline
  ) VALUES (
    'Prime Crown',
    'One ticket. One mind. One outcome. No retries. No crowd. Just precision.

Prize: $50,000 USDT
Entry: $250 per ticket
Duration: 45 days
Max per wallet: 1 ticket

Answer all 3 skill questions correctly to qualify. No retries allowed.',
    'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/Gemini_Generated_Image_vo2cuuvo2cuuvo2c.png',
    50000,
    'USDT',
    250,
    300,
    'live',
    eth_chain_uuid,
    '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    NOW(),
    NOW() + INTERVAL '45 days',
    true,
    0,
    1,
    '🏆 PRIME CROWN - $50,000 USDT - One Ticket, One Chance, One Winner'
  ) RETURNING id INTO raffle6_id;

  -- Now insert raffle-specific quiz questions
  -- RAFFLE 1: Genesis Pick Questions (answer 2/3)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('What does market cap actually represent in crypto?', 'Total value of all coins in circulation', 'Total trading volume', 'Number of holders', 'Mining difficulty', 'A', 'crypto', 'basic', true),
  ('Why does high liquidity reduce price manipulation?', 'Larger orders are needed to move price significantly', 'It increases transaction fees', 'It makes trading faster', 'It attracts more investors', 'A', 'crypto', 'intermediate', true),
  ('What happens to gas fees when Ethereum network demand spikes?', 'Gas fees increase due to higher competition for block space', 'Gas fees decrease', 'Gas fees stay the same', 'Transactions become free', 'A', 'crypto', 'basic', true);

  -- RAFFLE 2: Trader's Reflex Questions (answer all 3)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('What is slippage and when does it occur most?', 'Price difference between expected and executed trade, occurs in low liquidity', 'A type of trading fee', 'Network congestion delay', 'Wallet connection error', 'A', 'crypto', 'intermediate', true),
  ('Market order vs limit order — key difference?', 'Market executes immediately at current price, limit waits for specific price', 'Market is cheaper', 'Limit is faster', 'No difference', 'A', 'crypto', 'basic', true),
  ('Why do low-volume tokens move violently?', 'Small trades can cause large price swings due to thin order books', 'They are more popular', 'They have better technology', 'They are newer', 'A', 'crypto', 'intermediate', true);

  -- RAFFLE 3: Liquidity Mind Questions (answer 2/3)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('What is an AMM and why does it need liquidity providers?', 'Automated Market Maker that uses liquidity pools instead of order books', 'A type of cryptocurrency', 'A trading bot', 'A wallet type', 'A', 'crypto', 'intermediate', true),
  ('Explain impermanent loss in one sentence.', 'Loss compared to holding tokens when their price ratio changes in a liquidity pool', 'Permanent loss of funds', 'Transaction fee', 'Network congestion', 'A', 'crypto', 'advanced', true),
  ('Why does low TVL increase risk?', 'Lower Total Value Locked means less liquidity and higher price volatility', 'It means the project is new', 'It increases fees', 'It slows down transactions', 'A', 'crypto', 'intermediate', true);

  -- RAFFLE 4: Alpha Vault Questions (answer all 3)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('What is on-chain transparency and why does it matter?', 'All transactions are publicly verifiable on the blockchain, ensuring trust', 'Private transactions only', 'Faster processing', 'Lower fees', 'A', 'crypto', 'intermediate', true),
  ('Why are multisig wallets considered safer?', 'Require multiple signatures to authorize transactions, reducing single point of failure', 'They are faster', 'They have lower fees', 'They are easier to use', 'A', 'crypto', 'intermediate', true),
  ('What risk does leverage introduce during high volatility?', 'Amplified losses that can lead to liquidation of positions', 'Guaranteed profits', 'Lower trading fees', 'Faster transactions', 'A', 'crypto', 'advanced', true);

  -- RAFFLE 5: Whale Signal Questions (answer all 3)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('What is wallet clustering analysis?', 'Identifying wallets controlled by the same entity through transaction patterns', 'Grouping wallets by balance', 'Sorting by creation date', 'Organizing by network', 'A', 'crypto', 'advanced', true),
  ('Why do whales split transactions?', 'To minimize price impact and avoid detection of large movements', 'To save on fees', 'To increase speed', 'To test the network', 'A', 'crypto', 'advanced', true),
  ('What does sudden liquidity withdrawal usually signal?', 'Potential rug pull or major sell-off, indicating risk', 'Project upgrade', 'New partnership', 'Increased security', 'A', 'crypto', 'advanced', true);

  -- RAFFLE 6: Prime Crown Questions (answer all 3, no retries)
  INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active) VALUES
  ('Difference between probability and expected value?', 'Probability is chance of outcome, expected value is average outcome over time', 'They are the same thing', 'Probability is always higher', 'Expected value is a percentage', 'A', 'crypto', 'advanced', true),
  ('Why does skill-based entry strengthen legal positioning?', 'Demonstrates game of skill rather than pure chance, avoiding gambling regulations', 'It makes it more expensive', 'It attracts better players', 'It increases prize pools', 'A', 'crypto', 'advanced', true),
  ('What defines a fair on-chain draw?', 'Verifiable randomness using blockchain data that cannot be manipulated', 'Fastest transaction wins', 'Highest bidder wins', 'First entry wins', 'A', 'crypto', 'advanced', true);

  RAISE NOTICE 'Successfully created 6 skill-based raffles with quiz questions';
  RAISE NOTICE 'Raffle 1 (Genesis Pick): % - 10%% free tickets', raffle1_id;
  RAISE NOTICE 'Raffle 2 (Trader''s Reflex): %', raffle2_id;
  RAISE NOTICE 'Raffle 3 (Liquidity Mind): %', raffle3_id;
  RAISE NOTICE 'Raffle 4 (Alpha Vault): %', raffle4_id;
  RAISE NOTICE 'Raffle 5 (Whale Signal): %', raffle5_id;
  RAISE NOTICE 'Raffle 6 (Prime Crown): %', raffle6_id;
END $$;

-- Create index for free entry lookups
CREATE INDEX IF NOT EXISTS idx_raffle_entries_free ON raffle_entries(raffle_id, is_free_entry) WHERE is_free_entry = true;

-- Add migration history record
INSERT INTO migration_history (migration_name, description) 
VALUES ('027_create_6_skill_raffles', 'Created 6 skill-based raffles with escalating prizes and raffle-specific quiz questions. Added free ticket tracking and entry limits.');
