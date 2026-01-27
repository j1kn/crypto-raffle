# Instructions: Create 100 USDT Speed Tournament

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/yfvdbttqhpgbqvvqtqxe
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the following SQL:

```sql
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
```

5. Click "Run" button
6. You should see the new raffle details in the results

## Option 2: Using the Admin Panel

1. Go to your admin panel: https://your-domain.com/admin
2. Enter your admin PIN
3. Click "Create New Raffle"
4. Fill in the form with these details:

**Basic Information:**
- Title: `100 USDT Speed Tournament`
- Description: (Copy from the SQL above)
- Image URL: `https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/FREE%20DOWNLOAD%20!!!%203D%20Cryptocurrency%20Icon%20Pack%20_%20Tether%20USDT.jpeg`

**Prize & Tickets:**
- Prize Pool Amount: `100`
- Prize Pool Symbol: `USDT`
- Ticket Price: `2`
- Max Tickets: `100`

**Settings:**
- Status: `live`
- Raffle Type: `skill`
- Free Ticket Percentage: `10`
- Entry Limit Per Wallet: `20`
- Duration: `7 days`

**Payment:**
- Receiving Address: `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`

5. Click "Create Raffle"

## Raffle Specifications

| Setting | Value |
|---------|-------|
| **Title** | 100 USDT Speed Tournament |
| **Prize Pool** | 100 USDT |
| **Entry Fee** | 2 USDT |
| **Total Tickets** | 100 |
| **Free Tickets** | 10 (first 10% are FREE) |
| **Duration** | 7 days |
| **Type** | Skill-based (requires quiz) |
| **Status** | Live |
| **Max Per Wallet** | 20 tickets |

## How It Works

1. **First 10 Entries (FREE):**
   - Users pass the skill quiz (2/3 correct)
   - Entry created automatically
   - No payment required
   - Message: "🎉 You've entered for FREE!"

2. **Entries 11-100 (Paid):**
   - Users pass the skill quiz (2/3 correct)
   - Payment modal opens
   - USDT pre-selected as payment method
   - User pays 2 USDT per entry
   - Entry created after payment confirmation

3. **Winner Selection:**
   - After 7 days, raffle ends automatically
   - Winner drawn randomly from all entries
   - Winner receives 100 USDT prize pool

## Verification

After creating the raffle, verify it's live:

1. Go to your website: https://your-domain.com/raffles
2. You should see "100 USDT Speed Tournament" in the list
3. Click on it to view details
4. Verify all information is correct
5. Test the entry flow:
   - Click "ENTER RAFFLE"
   - Complete the quiz
   - Verify free entry works (if you're in first 10)
   - Or verify payment modal shows USDT

## Migration File

The migration file has been created at:
`supabase/migrations/029_create_100_usdt_speed_tournament.sql`

This file is ready to be applied via Supabase Dashboard or CLI.
