# 🐛 CRITICAL BUG FIX: Wallet Address Case Sensitivity Issue

## Problem Summary

Users were passing the skill quiz (2/3 or 3/3 correct) but still getting blocked with the error:
> "You must complete the skill quiz before entering this raffle. Please take the quiz first."

## Root Cause Analysis

### The Issue: Wallet Address Case Mismatch

The quiz system and entry system were using **different case formats** for wallet addresses:

**Quiz System** (`/api/quiz/questions` and `/api/quiz/submit`):
- Normalized ALL wallet addresses to **lowercase**
- Example: `0x8759dcf37b7c85cc202236e918f0539bc072c6eb`

**Entry System** (`/api/raffles/[id]/enter`):
- Used wallet addresses **as-is** (mixed case from wallet)
- Example: `0x8759DcF37b7C85Cc202236E918F0539BC072C6EB`

### Why This Caused the Bug

1. User connects wallet with mixed-case address: `0x8759DcF37b7C85Cc202236E918F0539BC072C6EB`
2. Quiz system creates/finds user with lowercase: `0x8759dcf37b7c85cc202236e918f0539bc072c6eb`
3. Quiz attempt is saved with this lowercase user_id
4. Entry API tries to find user with mixed-case address
5. **Two scenarios could occur:**
   - Different user_id is found/created (duplicate user)
   - Same user_id but quiz_attempts query fails due to case mismatch in joins

### Code Flow

```
User clicks "ENTER RAFFLE"
  ↓
Opens QuizModal
  ↓
POST /api/quiz/questions
  - walletAddress.toLowerCase() → creates user
  - Saves quiz_session with lowercase wallet
  ↓
User completes quiz
  ↓
POST /api/quiz/submit
  - Uses session data (lowercase wallet)
  - Saves quiz_attempt with lowercase user_id
  ↓
User proceeds to payment
  ↓
POST /api/raffles/[id]/enter
  - Uses walletAddress AS-IS (mixed case) ❌
  - Looks up user with mixed case
  - Queries quiz_attempts with potentially wrong user_id
  - NO QUIZ ATTEMPTS FOUND → Error!
```

## The Fix

### Changed File: `app/api/raffles/[id]/enter/route.ts`

**Before:**
```typescript
const { data: userData, error: userError } = await supabase
  .from('users')
  .upsert({ wallet_address: walletAddress }, { onConflict: 'wallet_address' })
  .select()
  .single();
```

**After:**
```typescript
// CRITICAL: Normalize wallet address to lowercase to match quiz system
const normalizedWalletAddress = walletAddress.toLowerCase();

const { data: userData, error: userError } = await supabase
  .from('users')
  .upsert({ wallet_address: normalizedWalletAddress }, { onConflict: 'wallet_address' })
  .select()
  .single();
```

## Impact

✅ **Fixed:** Users can now successfully enter raffles after passing the quiz
✅ **Consistent:** All wallet addresses are now normalized to lowercase across the entire system
✅ **No Duplicates:** Prevents creation of duplicate user records with different case formats

## Testing Instructions

1. Connect wallet with mixed-case address
2. Click "ENTER RAFFLE" on any skill-based raffle
3. Complete quiz with 2/3 or 3/3 correct answers
4. Verify you can proceed to payment (no "complete quiz first" error)
5. Complete payment and verify entry is created

## Related Files

- `/app/api/quiz/questions/route.ts` - Already normalizes to lowercase ✅
- `/app/api/quiz/submit/route.ts` - Uses session data (lowercase) ✅
- `/app/api/raffles/[id]/enter/route.ts` - NOW normalizes to lowercase ✅

## Deployment

**Commit:** `575945a`
**Message:** "CRITICAL FIX: Normalize wallet address to lowercase in entry API"
**Status:** Pushed to GitHub main branch
**Next:** Vercel will auto-deploy

## Prevention

To prevent similar issues in the future:

1. **Always normalize wallet addresses** to lowercase when storing/querying
2. **Use a helper function** for wallet address normalization:
   ```typescript
   const normalizeWallet = (address: string) => address.toLowerCase();
   ```
3. **Add database constraint** to enforce lowercase in wallet_address column
4. **Add tests** to verify case-insensitive wallet address handling

## Additional Notes

- Ethereum addresses are case-insensitive (EIP-55 checksums are optional)
- Lowercasing is the standard practice in web3 applications
- This fix ensures consistency across all user-facing APIs
