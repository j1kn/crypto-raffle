-- Create 100 USDT Speed Tournament Raffle
-- Prize Pool: 100 USDT
-- Entry Fee: 2 USDT
-- Max Tickets: 100
-- Free Tickets: 10% (first 10 tickets free)
-- Duration: 7 days

INSERT INTO raffles (
  title,
  description,
  image_url,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  max_tickets,
  status,
  starts_at,
  ends_at,
  receiving_address,
  raffle_type,
  free_ticket_percentage,
  entry_limit_per_wallet
) VALUES (
  '100 USDT Speed Tournament',
  'Fast-paced skill tournament with 100 USDT prize pool! 🚀

💰 Prize Pool: 100 USDT
🎫 Entry Fee: 2 USDT
📊 Total Tickets: 100
🎁 FREE Tickets: First 10 entries (10%)
⏱️ Duration: 7 days
🧠 Skill Required: Pass quiz (2/3 correct)

This is a speed tournament - first 100 skilled participants win their chance at the 100 USDT prize pool. The first 10 entries are completely FREE after passing the skill quiz!

How to Enter:
1. Pass the skill-based quiz (2/3 questions correct)
2. If you''re in the first 10 entries, you get in FREE!
3. After first 10, pay 2 USDT per entry
4. Winner drawn automatically after 7 days

Good luck! 🍀',
  'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/FREE%20DOWNLOAD%20!!!%203D%20Cryptocurrency%20Icon%20Pack%20_%20Tether%20USDT.jpeg',
  100,
  'USDT',
  2,
  100,
  'live',
  NOW(),
  NOW() + INTERVAL '7 days',
  '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
  'skill',
  10,
  20
);

-- Verify the raffle was created
SELECT 
  id,
  title,
  prize_pool_amount,
  prize_pool_symbol,
  ticket_price,
  max_tickets,
  free_ticket_percentage,
  status,
  ends_at
FROM raffles 
WHERE title = '100 USDT Speed Tournament';
