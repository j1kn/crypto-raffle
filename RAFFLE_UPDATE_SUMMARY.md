# Raffle Update Summary

**Date:** January 28, 2026  
**Migration:** `031_update_raffles_with_new_prizes.sql`

## Overview
Successfully updated all 7 live raffles with new prize pools, ticket prices, and restarted timers. All raffles now have 10% free entries for the first participants.

## ✅ Updated Raffles (All Live):

### 1. Genesis Pick - $1000 USDT Grand Prize 🏆
- **Prize Pool:** $1000 USDT
- **Ticket Price:** $5 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 500
- **Max per Wallet:** 5
- **Duration:** 30 days (ends Feb 27, 2026)
- **Current Entries:** 4
- **Status:** ✅ Live

### 2. Elite Raffle - $500 USDT Prize 🥇
- **Prize Pool:** $500 USDT (upgraded from $100)
- **Ticket Price:** $4 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 300
- **Max per Wallet:** 5
- **Duration:** 21 days (ends Feb 18, 2026)
- **Current Entries:** 1
- **Status:** ✅ Live

### 3. Pro Raffle - $200 USDT Prize 🥈
- **Prize Pool:** $200 USDT (upgraded from $2500)
- **Ticket Price:** $3 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 200
- **Max per Wallet:** 10
- **Duration:** 14 days (ends Feb 11, 2026)
- **Current Entries:** 0
- **Status:** ✅ Live

### 4. Quick Win - $50 USDT Prize 🥉
- **Prize Pool:** $50 USDT (upgraded from $5000)
- **Ticket Price:** $2 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 100
- **Max per Wallet:** 20
- **Duration:** 7 days (ends Feb 4, 2026)
- **Current Entries:** 0
- **Status:** ✅ Live

### 5. Starter Raffle - $30 USDT Prize 🎯
- **Prize Pool:** $30 USDT (upgraded from $10000)
- **Ticket Price:** $1.50 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 80
- **Max per Wallet:** 20
- **Duration:** 5 days (ends Feb 2, 2026)
- **Current Entries:** 0
- **Status:** ✅ Live

### 6. Micro Raffle - $10 USDT Prize 🎲
- **Prize Pool:** $10 USDT (upgraded from $25000)
- **Ticket Price:** $1 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 50
- **Max per Wallet:** 20
- **Duration:** 3 days (ends Jan 31, 2026)
- **Current Entries:** 0
- **Status:** ✅ Live

### 7. Practice Raffle - $5 USDT Prize 🎮
- **Prize Pool:** $5 USDT (upgraded from $50000)
- **Ticket Price:** $0.50 USD
- **Free Entries:** First 10% are FREE
- **Max Tickets:** 30
- **Max per Wallet:** 20
- **Duration:** 2 days (ends Jan 30, 2026)
- **Current Entries:** 0
- **Status:** ✅ Live

## Key Features

### 1. Free Entry System (10%)
- All raffles now offer the first 10% of tickets completely FREE
- Encourages early participation
- Tracked via `free_ticket_percentage` column

### 2. Entry Limits per Wallet
- **High-value raffles ($500+):** Max 5 tickets per wallet
- **Mid-value raffles ($100-$499):** Max 10 tickets per wallet
- **Low-value raffles (<$100):** Max 20 tickets per wallet

### 3. Fresh Timers
- All raffles have new countdown timers
- Duration ranges from 2 days to 30 days
- Staggered end dates for continuous engagement

### 4. USDT Prize Pools
- All prizes in stable USDT
- Clear, attractive prize amounts
- Range from $5 to $1000

## Raffle Structure

| Raffle | Prize | Ticket Price | Free % | Max Tickets | Max/Wallet | Duration |
|--------|-------|--------------|--------|-------------|------------|----------|
| Genesis Pick | $1000 | $5.00 | 10% | 500 | 5 | 30 days |
| Elite Raffle | $500 | $4.00 | 10% | 300 | 5 | 21 days |
| Pro Raffle | $200 | $3.00 | 10% | 200 | 10 | 14 days |
| Quick Win | $50 | $2.00 | 10% | 100 | 20 | 7 days |
| Starter Raffle | $30 | $1.50 | 10% | 80 | 20 | 5 days |
| Micro Raffle | $10 | $1.00 | 10% | 50 | 20 | 3 days |
| Practice Raffle | $5 | $0.50 | 10% | 30 | 20 | 2 days |

## Migration Details

**File:** [`supabase/migrations/031_update_raffles_with_new_prizes.sql`](supabase/migrations/031_update_raffles_with_new_prizes.sql)

**Actions Performed:**
1. ✅ Updated all 7 raffle prize pools
2. ✅ Set new ticket prices ($0.50 - $5.00)
3. ✅ Restarted all countdown timers
4. ✅ Added 10% free entry system
5. ✅ Set entry limits per wallet
6. ✅ Set maximum ticket caps
7. ✅ Logged migration in history

## Database Changes

The raffles table already had the `free_ticket_percentage` and `entry_limit_per_wallet` columns, so we just updated the values:

- **`free_ticket_percentage`**: Set to 10 for all raffles
- **`entry_limit_per_wallet`**: Set based on prize pool (5-20)
- **`max_tickets`**: Adjusted based on prize pool size

## Summary

**Total Active Raffles:** 7  
**Total Prize Pool:** $1,795 USDT  
**Ticket Price Range:** $0.50 - $5.00 USD  
**All Raffles:** Live with 10% free entries

---

**Status:** ✅ All raffles successfully updated and live in Supabase  
**GitHub:** ✅ Changes pushed to repository
