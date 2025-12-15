# Automatic Winner Drawing Setup

## Overview
The platform automatically draws winners when raffles end. This can be done via:
1. **Client-side trigger** (when viewing a raffle page)
2. **Cron job** (recommended for production)

## Cron Job Setup

### Option 1: Vercel Cron Jobs (Recommended)

1. **Create `vercel.json` in project root:**
```json
{
  "crons": [
    {
      "path": "/api/raffles/check-winners",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to check for ended raffles and draw winners.

2. **Deploy to Vercel:**
   - Push to GitHub
   - Vercel will automatically detect and enable the cron job

### Option 2: External Cron Service

Use services like:
- **Cron-job.org**
- **EasyCron**
- **Uptime Robot**

**Endpoint to call:**
```
POST https://your-domain.com/api/raffles/check-winners
```

**Schedule:** Every 5-10 minutes

### Option 3: Manual Trigger

You can manually trigger winner drawing by calling:
```bash
curl -X POST https://your-domain.com/api/raffles/check-winners
```

## How It Works

1. **Checks for ended raffles:**
   - Finds all raffles with `status = 'live'`
   - Where `ends_at <= now()`
   - And `winner_user_id IS NULL`

2. **Draws winners:**
   - Randomly selects from all entries
   - Updates raffle with winner
   - Sets status to `'completed'`

3. **Handles edge cases:**
   - No entries → Marks as completed without winner
   - Already has winner → Skips
   - Errors → Logs and continues with next raffle

## Testing

To test locally:
```bash
curl -X POST http://localhost:3000/api/raffles/check-winners
```

## Monitoring

Check Vercel logs or your cron service logs to verify:
- Winners are being drawn
- No errors occur
- Raffles are properly updated

