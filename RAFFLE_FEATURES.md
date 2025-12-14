# 🎰 Raffle Features Documentation

## ✅ Implemented Features

### 1. Raffle Detail Page (`/raffles/[id]`)

**All Required Elements:**
- ✅ **Title** - Displayed prominently
- ✅ **Image** - Large banner image at top
- ✅ **Description** - Full description below title
- ✅ **Live Timer** - Countdown timer showing time remaining
- ✅ **Prize Pool** - Displayed with currency symbol
- ✅ **Entry Price** - Shows ticket/entry cost
- ✅ **Enter Now Button** - Allows users to enter raffle

**Additional Features:**
- ✅ **Live Entries Section** - Shows all users who entered (updates every 5 seconds)
- ✅ **Winner Section** - Displays winner when raffle ends
- ✅ **Entry Count** - Shows total entries vs max tickets
- ✅ **User Entry Status** - Shows if user has already entered

### 2. User Profile/Dashboard (`/dashboard`)

**Ticket Display:**
- ✅ Shows all raffles user has entered
- ✅ Displays raffle title, image, prize pool
- ✅ Shows countdown timer for each raffle
- ✅ Links to view full raffle details
- ✅ Shows transaction hash if available

**Access:**
- Users can access dashboard after connecting wallet
- All entered raffles are automatically saved
- Tickets appear immediately after entering

### 3. Automatic Winner Selection

**How It Works:**
1. When raffle timer ends, system automatically detects it
2. Random winner is selected from all entries
3. Winner is saved to database
4. Winner section appears on raffle page
5. Raffle status changes to "completed"

**API Endpoints:**
- `/api/raffles/[id]/draw-winner` - Draw winner for specific raffle
- `/api/raffles/check-winners` - Check and draw winners for all ended raffles

### 4. Live Entries Display

**Features:**
- Shows last 50 entries in real-time
- Updates every 5 seconds automatically
- Displays wallet address (shortened format)
- Shows entry timestamp
- Highlights user's own entry with "YOU" badge
- Only shows for active raffles

### 5. Winner Display

**Winner Section Shows:**
- Winner wallet address
- Date/time when winner was drawn
- Special "WINNER ANNOUNCED!" banner
- Crown icon for visual emphasis

## 🔧 Database Changes

### New Fields Added:
- `raffles.winner_user_id` - UUID of winning user
- `raffles.winner_drawn_at` - Timestamp when winner was drawn

### Migration Files:
- `003_add_winner_fields.sql` - Adds winner columns to raffles table

**To Apply Migration:**
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration file: `003_add_winner_fields.sql`

## 🚀 Automatic Winner Drawing

### Option 1: Manual Trigger (Current)
- Winner is drawn when user visits raffle page after it ends
- System checks if raffle ended and draws winner automatically

### Option 2: Cron Job (Recommended for Production)

**Set up a cron job to call:**
```
POST https://your-domain.com/api/raffles/check-winners
```

**Cron Schedule:** Every 5 minutes
```bash
*/5 * * * * curl -X POST https://your-domain.com/api/raffles/check-winners
```

**Or use Vercel Cron Jobs:**
Create `vercel.json` with:
```json
{
  "crons": [{
    "path": "/api/raffles/check-winners",
    "schedule": "*/5 * * * *"
  }]
}
```

## 📋 User Flow

### Entering a Raffle:
1. User visits raffle detail page
2. Sees all raffle information (title, image, description, timer, prize, entry price)
3. Clicks "ENTER NOW" button
4. Wallet must be connected
5. Entry is saved to database
6. User receives confirmation
7. Ticket appears in user's dashboard/profile

### Viewing Tickets:
1. User goes to `/dashboard`
2. Sees all raffles they've entered
3. Can click to view full raffle details
4. Sees countdown timers for active raffles

### Winner Selection:
1. When raffle timer reaches zero
2. System automatically selects random winner
3. Winner is saved to database
4. Winner section appears on raffle page
5. All users can see the winner

## 🎯 Admin Panel Access

**Quick Steps:**
1. Get your wallet address (connect wallet on site)
2. Add to `ADMIN_WALLETS` environment variable in Vercel
3. Go to `/admin` or click "ADMIN" link in header
4. Create raffles that will be visible to everyone!

**See `ADMIN_ACCESS.md` for detailed instructions.**

## 🔄 Real-Time Updates

- **Entry Count** - Updates every 5 seconds
- **Live Entries** - Updates every 5 seconds
- **Countdown Timer** - Updates every second
- **Winner Display** - Appears immediately after drawing

## 📊 Database Schema

**raffles table:**
- All original fields
- `winner_user_id` - UUID of winner
- `winner_drawn_at` - When winner was drawn

**raffle_entries table:**
- Links users to raffles
- One entry per user per raffle
- Stores entry timestamp

**users table:**
- Stores wallet addresses
- Links to entries and winners

## 🎨 UI Features

- Dark neon gaming theme
- Live updating counters
- Winner announcement banner
- Entry list with user highlighting
- Responsive mobile-first design
- Real-time status indicators

---

**All features are now implemented and ready to use!** 🎉

