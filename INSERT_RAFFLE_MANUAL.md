# 🎯 Insert PrimePick Launch Raffle - Manual SQL

## Quick Instructions

Since the admin panel is still having RLS issues, here's how to insert the raffle directly into Supabase.

---

## Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard
2. Select project: `puofbkubhtkynvdlwquu`
3. Click **SQL Editor** → **New query**

---

## Step 2: Copy and Paste This SQL

```sql
-- Insert PrimePick Launch Raffle
-- First, get the Ethereum chain UUID (if it exists)
WITH ethereum_chain AS (
  SELECT id FROM chains WHERE slug = 'ethereum' LIMIT 1
)
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
  'PrimePick Launch Raffle',
  'Win 1 ETH in our first official PrimePick raffle. Entries are open immediately. Each ticket costs 0.001 ETH. Winner takes the entire prize pool.',
  NULL,
  1,
  'ETH',
  0.001,
  1000,
  'live',
  (SELECT id FROM ethereum_chain), -- Get Ethereum chain UUID if it exists
  '0x842bab27de95e329eb17733c1f29c082e5dd94c3',
  '2025-12-15 10:50:00+00'::timestamptz,
  '2025-12-15 13:00:00+00'::timestamptz,
  NULL
RETURNING id, title, status, created_at;
```

---

## Step 3: Click "Run"

Wait for "Success" message. You should see the raffle ID returned.

---

## Step 4: Verify Raffle Was Created

Run this query to see the raffle:

```sql
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
```

---

## ✅ Raffle Details

- **Title:** PrimePick Launch Raffle
- **Description:** Win 1 ETH in our first official PrimePick raffle. Entries are open immediately. Each ticket costs 0.001 ETH. Winner takes the entire prize pool.
- **Prize Pool:** 1 ETH
- **Ticket Price:** 0.001 ETH
- **Max Tickets:** 1000
- **Status:** live
- **Chain:** Ethereum (ETH)
- **Receiving Address:** 0x842bab27de95e329eb17733c1f29c082e5dd94c3
- **Starts At:** 15/12/2025, 10:50
- **Ends At:** 15/12/2025, 13:00

---

## 🎉 After Inserting

1. The raffle will appear on your main website
2. Users can enter the raffle
3. It will show as "live" status
4. All details will be displayed correctly

---

## 📝 Note

The SQL file is also saved at: `supabase/migrations/008_insert_primepick_launch_raffle.sql`

You can copy from there or use the SQL above.

---

**Run the SQL and your raffle will be live on the website!** 🚀

