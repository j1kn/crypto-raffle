# Payment Methods & Free Tickets Update

## Overview
This document explains the payment system and free ticket implementation for all raffles.

---

## ✅ What's Already Working

### 1. **Payment Method Selection**
Users can already choose between multiple payment methods:
- **ETH** (Ethereum - native)
- **USDC** (USD Coin - ERC-20)
- **USDT** (Tether USD - ERC-20)

The payment modal ([`EntryConfirmationModal.tsx`](components/EntryConfirmationModal.tsx)) displays all options and users can select their preferred payment method.

### 2. **Free Entry System**
- Backend API checks free ticket eligibility ([`/api/raffles/[id]/check-free-entry`](app/api/raffles/[id]/check-free-entry/route.ts))
- Entry API accepts `txHash: null` for free entries ([`/api/raffles/[id]/enter`](app/api/raffles/[id]/enter/route.ts))
- Frontend automatically detects and processes free entries ([`app/raffles/[id]/page.tsx`](app/raffles/[id]/page.tsx:557-617))

---

## 🔧 What Needs To Be Done

### Apply Migration to Add 10% Free Tickets to All Raffles

**Migration File:** [`supabase/migrations/028_add_free_tickets_to_all_raffles.sql`](supabase/migrations/028_add_free_tickets_to_all_raffles.sql)

**Option 1: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/pqxqhzfmqxzqoqjnqvkl/sql/new
2. Copy the contents of `supabase/migrations/028_add_free_tickets_to_all_raffles.sql`
3. Paste and run the SQL

**Option 2: Using the Script (Requires Service Role Key)**
```bash
# Add SUPABASE_SERVICE_ROLE_KEY to .env.local first
node apply-free-tickets.js
```

**What This Does:**
- Updates all 6 skill raffles to have `free_ticket_percentage = 10`
- First 10% of tickets in each raffle will be FREE (quiz only, no payment)

---

## 📊 Free Ticket Allocation Per Raffle

| Raffle | Total Tickets | Free Tickets (10%) | Paid Tickets |
|--------|--------------|-------------------|--------------|
| Genesis Pick | 1,000 | 100 | 900 |
| Trader's Reflex | 800 | 80 | 720 |
| Liquidity Mind | 600 | 60 | 540 |
| Alpha Vault | 500 | 50 | 450 |
| Whale Signal | 400 | 40 | 360 |
| Prime Crown | 300 | 30 | 270 |

---

## 🎯 User Experience Flow

### For First 10% of Entries (FREE):
1. User clicks "Enter Raffle"
2. Completes quiz (2/3 correct)
3. ✅ **Automatically entered - no payment required**
4. Success message: "🎉 You've entered for FREE!"

### For Remaining 90% (PAID):
1. User clicks "Enter Raffle"
2. Completes quiz (2/3 correct)
3. Payment modal opens
4. **User selects payment method** (ETH, USDC, or USDT)
5. Confirms payment in wallet
6. Entry recorded

---

## 💰 Payment Method Details

### Configured Payment Methods
All methods use **Ethereum Mainnet (Chain ID: 1)**

```javascript
// lib/paymentMethods.ts
{
  ETH: {
    symbol: 'ETH',
    isNative: true,
    decimals: 18
  },
  USDC: {
    symbol: 'USDC',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  USDT: {
    symbol: 'USDT',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  }
}
```

### How It Works
1. Raffle displays price in USDT (e.g., "$10 USDT")
2. User opens payment modal
3. User selects preferred payment method (ETH, USDC, or USDT)
4. Modal shows total in selected currency
5. Wallet requests payment in selected currency
6. Transaction sent to receiving address: `0x842bab27dE95e329eb17733c1f29c082e5dd94c3`

---

## 🔍 Technical Implementation

### Backend APIs

**Check Free Entry Eligibility:**
```typescript
GET /api/raffles/[id]/check-free-entry
Response: {
  isFreeEntry: boolean,
  freeTicketsRemaining: number,
  message: string
}
```

**Submit Entry:**
```typescript
POST /api/raffles/[id]/enter
Body: {
  walletAddress: string,
  txHash: string | null,  // null for free entries
  email?: string,
  quantity: number
}
```

### Frontend Flow

**After Quiz Pass** ([`app/raffles/[id]/page.tsx`](app/raffles/[id]/page.tsx:557)):
```typescript
const handleQuizPassed = async () => {
  // 1. Check free entry eligibility
  const response = await fetch(`/api/raffles/${raffleId}/check-free-entry`);
  const { isFreeEntry } = await response.json();
  
  if (isFreeEntry) {
    // 2. Submit free entry directly
    await fetch(`/api/raffles/${raffleId}/enter`, {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: address,
        txHash: null,  // No payment
        quantity: 1
      })
    });
  } else {
    // 3. Show payment modal
    setShowConfirmModal(true);
  }
};
```

---

## ✅ Verification Checklist

After applying the migration, verify:

- [ ] All 6 raffles show `free_ticket_percentage = 10` in database
- [ ] First entries in each raffle are free (no payment required)
- [ ] After free tickets are exhausted, payment modal appears
- [ ] Users can select ETH, USDC, or USDT for payment
- [ ] Wallet requests correct currency based on selection
- [ ] Free entries are marked with `is_free_entry = true` in database

---

## 🚀 Next Steps

1. **Apply Migration:** Run the SQL migration to add 10% free tickets to all raffles
2. **Test Free Entry:** Enter a raffle as one of the first 10% - should be free
3. **Test Paid Entry:** Enter after free tickets exhausted - should show payment modal
4. **Test Payment Methods:** Try paying with ETH, USDC, and USDT
5. **Verify Database:** Check that free entries have `is_free_entry = true`

---

## 📝 Notes

- Free ticket percentage is configurable per raffle (currently 10% for all)
- Payment methods can be extended by adding to [`lib/paymentMethods.ts`](lib/paymentMethods.ts)
- All transactions go to the same receiving address regardless of payment method
- Quiz must be passed before any entry (free or paid)
- Free entries are always 1 ticket (no bulk free entries)

---

## 🔗 Related Files

- [`supabase/migrations/028_add_free_tickets_to_all_raffles.sql`](supabase/migrations/028_add_free_tickets_to_all_raffles.sql) - Migration to add free tickets
- [`app/raffles/[id]/page.tsx`](app/raffles/[id]/page.tsx) - Raffle detail page with free entry logic
- [`app/api/raffles/[id]/check-free-entry/route.ts`](app/api/raffles/[id]/check-free-entry/route.ts) - Free entry check API
- [`app/api/raffles/[id]/enter/route.ts`](app/api/raffles/[id]/enter/route.ts) - Entry submission API
- [`components/EntryConfirmationModal.tsx`](components/EntryConfirmationModal.tsx) - Payment modal with method selection
- [`lib/paymentMethods.ts`](lib/paymentMethods.ts) - Payment method configuration
