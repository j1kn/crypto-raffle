# Debug Quiz Validation Issue

## Problem
User scored 2/3 on quiz but still getting "complete the quiz first" error when trying to enter.

## Possible Causes

### 1. Quiz Attempt Not Saved
The quiz submission might be failing silently. Check:
- Browser console for errors during quiz submission
- Network tab to see if `/api/quiz/submit` returns success
- Database `quiz_attempts` table to see if record exists

### 2. Raffle ID Mismatch
The quiz might be saving with a different raffle_id than expected. Check:
- What raffle_id is shown in the URL when taking quiz
- What raffle_id is in the quiz_attempts table
- What raffle_id is being checked during entry

### 3. User ID Mismatch
The user might have multiple user records. Check:
- What user_id is created when wallet connects
- What user_id is saved with quiz attempt
- What user_id is checked during entry validation

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Take the quiz again
4. Look for these logs:
   - `[Quiz Passed] Checking free entry eligibility...`
   - `[Free Entry Check]` with response data
   - Any error messages

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Take the quiz
4. Find the `/api/quiz/submit` request
5. Check the Response:
   ```json
   {
     "success": true,
     "passed": true,
     "score": 2,
     "totalQuestions": 3,
     "attemptId": "..."
   }
   ```

### Step 3: Check Database Directly
Run this query in Supabase SQL Editor:

```sql
-- Check quiz attempts for your wallet
SELECT 
  qa.id,
  qa.raffle_id,
  qa.user_id,
  qa.score,
  qa.passed,
  qa.created_at,
  u.wallet_address,
  r.title as raffle_title
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
JOIN raffles r ON qa.raffle_id = r.id
WHERE u.wallet_address = 'YOUR_WALLET_ADDRESS_HERE'
ORDER BY qa.created_at DESC
LIMIT 10;
```

Replace `YOUR_WALLET_ADDRESS_HERE` with your actual wallet address.

### Step 4: Check User Records
```sql
-- Check if you have multiple user records
SELECT id, wallet_address, created_at
FROM users
WHERE wallet_address = 'YOUR_WALLET_ADDRESS_HERE';
```

### Step 5: Check Entry Validation Logs
When you try to enter, check the server logs in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Logs" or "Functions"
4. Look for logs from `/api/raffles/[id]/enter`
5. Should see:
   - `[Quiz Validation] Starting validation for:`
   - `[Quiz Validation] Query result:`
   - Either success or error message

## Quick Fix Options

### Option 1: Clear Browser Cache
1. Clear browser cache and cookies
2. Disconnect wallet
3. Reconnect wallet
4. Take quiz again
5. Try to enter

### Option 2: Use Different Browser
1. Open in incognito/private mode
2. Connect wallet
3. Take quiz
4. Try to enter

### Option 3: Manual Database Fix (If Quiz Was Saved)
If the quiz attempt exists in database but validation is failing:

```sql
-- Check the exact raffle_id and user_id
SELECT 
  r.id as raffle_id,
  r.title,
  u.id as user_id,
  u.wallet_address
FROM raffles r
CROSS JOIN users u
WHERE u.wallet_address = 'YOUR_WALLET_ADDRESS_HERE'
AND r.title = 'Genesis Pick';

-- Then check if quiz attempt exists with these IDs
SELECT *
FROM quiz_attempts
WHERE raffle_id = 'RAFFLE_ID_FROM_ABOVE'
AND user_id = 'USER_ID_FROM_ABOVE';
```

## Expected Behavior

### Correct Flow:
1. User clicks "ENTER RAFFLE"
2. Quiz modal opens
3. User answers 3 questions
4. Scores 2/3 or 3/3
5. Quiz modal shows "Congratulations!"
6. User clicks "Continue to Payment"
7. System checks free entry eligibility
8. If free: Entry created immediately
9. If not free: Payment modal opens

### What Should Happen in Database:
1. Record created in `quiz_attempts` table:
   - `raffle_id`: UUID of the raffle
   - `user_id`: UUID of the user
   - `score`: 2 or 3
   - `passed`: true
   - `wallet_address`: Your wallet address

2. When entering, API should:
   - Find this quiz_attempts record
   - Validate score >= 2
   - Allow entry

## Contact Information

If none of these steps work, provide:
1. Your wallet address
2. Which raffle you're trying to enter (title)
3. Screenshot of browser console errors
4. Screenshot of Network tab showing quiz submission response
5. Result of the SQL queries above

This will help identify the exact issue.
