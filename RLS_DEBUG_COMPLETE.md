# 🔍 Complete RLS Debugging Guide

## 🚨 Current Issue: RLS Policy Violation

Even with service role key, you're still getting RLS errors. Let's debug this completely.

---

## 🔧 Step 1: Test Service Role Key Connection

### Test Endpoint Created

I've created a test endpoint to verify your service role key is working:

**URL:** `https://your-vercel-url.vercel.app/api/admin/test-connection`

### What It Does:
1. Checks if `SUPABASE_SERVICE_ROLE_KEY` is set
2. Tries to create Supabase client
3. Tests a query to verify RLS is bypassed
4. Returns detailed error if RLS violation occurs

### How to Use:
1. Deploy the latest code
2. Visit: `https://your-vercel-url.vercel.app/api/admin/test-connection`
3. Check the response:
   - ✅ `success: true` = Service role key is working
   - ❌ `RLS Policy Violation` = Service role key is NOT working

---

## 🔧 Step 2: Verify Environment Variables in Vercel

### Required Variables:

1. **SUPABASE_URL** (or NEXT_PUBLIC_SUPABASE_URL)
   - Value: `https://puofbkubhtkynvdlwquu.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY** ← **CRITICAL**
   - Value: [Your service role key from Supabase]
   - **MUST** be the `service_role` key (NOT anon key)
   - Should start with `eyJ...`
   - Should be very long (hundreds of characters)

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### How to Get Service Role Key:

1. Go to: https://supabase.com/dashboard
2. Select project: `puofbkubhtkynvdlwquu`
3. **Settings** → **API**
4. Find **"service_role"** section
5. Click **"Reveal"** button
6. Copy the ENTIRE key (it's very long)

### Verify in Vercel:

1. Go to Vercel Dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Check:
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` exists
   - ✅ Value is the service_role key (not anon key)
   - ✅ Selected for: Production, Preview, Development
4. **Redeploy** after adding/updating

---

## 🔧 Step 3: Temporary RLS Disable (For Testing)

If service role key still doesn't work, temporarily disable RLS:

### Run This SQL in Supabase:

```sql
-- TEMPORARY: Disable RLS on raffles table
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
```

**File:** `supabase/migrations/005_disable_rls_temporarily.sql`

### After Testing:

Once service role key is confirmed working, re-enable RLS:

```sql
-- Re-enable RLS
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Step 4: Check Vercel Logs

### What to Look For:

1. **Service Role Key Missing:**
   ```
   ❌ SUPABASE_SERVICE_ROLE_KEY is REQUIRED
   ```
   → Add service role key to Vercel

2. **RLS Violation:**
   ```
   🚨 RLS POLICY VIOLATION DETECTED!
   ```
   → Service role key is not working correctly

3. **Client Created Successfully:**
   ```
   ✅ Creating Supabase client with SERVICE ROLE KEY
   ✅ Supabase client created successfully
   ```
   → Client is created, but insert might still fail

4. **Insert Error:**
   ```
   ❌ Supabase insert error: new row violates row-level security policy
   ```
   → RLS is blocking even with service role key

---

## 🚨 Common Issues & Fixes

### Issue 1: Service Role Key Not Set

**Symptom:** Error: "SUPABASE_SERVICE_ROLE_KEY is required"

**Fix:**
1. Get service role key from Supabase
2. Add to Vercel as `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

### Issue 2: Wrong Key Type

**Symptom:** RLS violation even with key set

**Fix:**
- Make sure you're using **service_role** key (not anon key)
- Service role key is much longer than anon key
- Service role key starts with `eyJ...` (same as anon, but different value)

### Issue 3: Key Not Redeployed

**Symptom:** Key is set but still getting errors

**Fix:**
- **Redeploy** your Vercel project after adding the key
- Environment variables are only loaded on deployment

### Issue 4: RLS Still Blocking

**Symptom:** Service role key is set, but RLS still blocks

**Possible Causes:**
1. Key is wrong (using anon key instead)
2. Supabase client not using the key correctly
3. RLS policies are too restrictive

**Fix:**
1. Run test endpoint: `/api/admin/test-connection`
2. Check Vercel logs for detailed errors
3. Temporarily disable RLS (see Step 3)

---

## ✅ Verification Checklist

- [ ] Service role key added to Vercel
- [ ] Using `service_role` key (not anon key)
- [ ] Project redeployed after adding key
- [ ] Test endpoint returns `success: true`
- [ ] Vercel logs show "✅ Creating Supabase client with SERVICE ROLE KEY"
- [ ] Try creating raffle
- [ ] No RLS errors

---

## 🧪 Test Sequence

1. **Deploy latest code** (includes test endpoint)
2. **Add service role key** to Vercel
3. **Redeploy** project
4. **Test connection:** Visit `/api/admin/test-connection`
5. **Check response:**
   - If `success: true` → Service role key is working
   - If RLS error → Check key configuration
6. **Try creating raffle**
7. **Check Vercel logs** for detailed errors

---

## 📝 What the Code Now Does

1. **Detailed logging** of environment variables
2. **Service role key validation** before use
3. **RLS error detection** with specific messages
4. **Test endpoint** to verify connection
5. **Better error messages** for debugging

---

## 🔍 Debugging Commands

### Check Environment Variables (in Vercel Logs):

Look for:
```
🔍 Environment Check: {
  hasSUPABASE_URL: true,
  hasSUPABASE_SERVICE_ROLE_KEY: true,
  serviceRoleKeyLength: 500+ (should be long),
  serviceRoleKeyPrefix: "eyJ..." (should start with eyJ)
}
```

### If Service Role Key is Working:

You should see:
```
✅ Creating Supabase client with SERVICE ROLE KEY
✅ Supabase client created successfully
✅ Supabase client created, attempting insert...
📝 Attempting to insert raffle into database...
📝 Using service role key (should bypass RLS)
Raffle created successfully: [uuid]
```

### If RLS is Still Blocking:

You'll see:
```
🚨 RLS POLICY VIOLATION DETECTED!
🚨 This means the service role key is NOT being used correctly
```

---

**Run the test endpoint first to verify your service role key is working!**

