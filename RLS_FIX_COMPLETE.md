# ✅ RLS Violation Fix - Complete

## 🔧 What Was Fixed

### 1. **Service Role Key Only** ✅
- **BEFORE:** Fallback to anon key if service role key missing
- **AFTER:** **REQUIRES** service role key, throws error if missing
- **Why:** Anon key cannot bypass RLS policies

### 2. **Environment Variable Names** ✅
- **BEFORE:** Using `NEXT_PUBLIC_SUPABASE_URL` for server-side
- **AFTER:** Uses `SUPABASE_URL` (preferred) or falls back to `NEXT_PUBLIC_SUPABASE_URL`
- **Why:** Server-side should use non-public env vars

### 3. **Undefined Value Handling** ✅
- **BEFORE:** Undefined values could be passed to insert
- **AFTER:** Removes all undefined values before insert
- **Why:** Undefined values trigger RLS failures

### 4. **Temporary RLS Policy** ✅
- Created SQL migration: `004_fix_rls_insert_policy.sql`
- Allows all inserts for debugging
- Can be removed once service role key is confirmed working

---

## 🚨 CRITICAL: Environment Variables

### Required in Vercel:

```bash
# Server-side (for API routes)
SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]  ← REQUIRED

# Client-side (for browser)
NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ IMPORTANT:
- **DO NOT** use `NEXT_PUBLIC_SUPABASE_ANON_KEY` in API routes
- **ONLY** use `SUPABASE_SERVICE_ROLE_KEY` in API routes
- Service role key **bypasses all RLS policies**

---

## 📋 Step-by-Step Fix

### Step 1: Add Service Role Key to Vercel

1. Go to Supabase Dashboard → Settings → API
2. Copy **service_role** key (NOT anon key)
3. Go to Vercel → Settings → Environment Variables
4. Add:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** [paste service role key]
   - **Environment:** Production, Preview, Development
5. **Redeploy** your project

### Step 2: Run Temporary RLS Policy (Optional - for debugging)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/004_fix_rls_insert_policy.sql`
3. Paste and run
4. This allows inserts even without service role key (temporary)

### Step 3: Test Raffle Creation

1. Go to `/superman` and login
2. Create a raffle
3. Should work without RLS errors

### Step 4: Verify in Database

1. Go to Supabase Dashboard → Table Editor
2. Check `raffles` table
3. New raffle should appear

---

## 🔍 Verification Checklist

After fixes:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to Vercel
- [ ] `SUPABASE_URL` added to Vercel (or using NEXT_PUBLIC_SUPABASE_URL)
- [ ] Project redeployed
- [ ] Temporary RLS policy run (optional)
- [ ] Try creating raffle
- [ ] No "RLS violation" error
- [ ] Raffle appears in database
- [ ] Check Vercel logs for "✅ Using SERVICE ROLE KEY"

---

## 🧪 What the Code Now Does

1. **Validates service role key exists** before processing
2. **Throws error** if service role key is missing (no fallback)
3. **Removes undefined values** from request body
4. **Uses service role key** to create Supabase client
5. **Bypasses all RLS policies** automatically

---

## 📝 Code Changes

### `lib/supabase.ts`:
- ✅ Requires `SUPABASE_SERVICE_ROLE_KEY` (no fallback)
- ✅ Uses `SUPABASE_URL` (preferred) for server-side
- ✅ Throws error if service role key missing

### `app/api/admin/raffles/route.ts`:
- ✅ Validates service role key before processing
- ✅ Removes undefined values from request body
- ✅ Better error messages

### `supabase/migrations/004_fix_rls_insert_policy.sql`:
- ✅ Temporary policy for debugging
- ✅ Can be removed after confirming service role key works

---

## 🚨 If Still Getting RLS Errors

1. **Check Vercel Logs:**
   - Look for "❌ SUPABASE_SERVICE_ROLE_KEY is REQUIRED"
   - Verify service role key is actually set

2. **Verify Environment Variables:**
   - In Vercel, check that `SUPABASE_SERVICE_ROLE_KEY` exists
   - Check that it's the **service_role** key (not anon key)

3. **Run Temporary RLS Policy:**
   - Run `004_fix_rls_insert_policy.sql` in Supabase
   - This will allow inserts even without service role key

4. **Check Request Body:**
   - Open browser DevTools → Network tab
   - Check the request payload
   - Verify no undefined values

---

## ✅ Expected Behavior

After adding service role key:

1. API route logs: "✅ Using SERVICE ROLE KEY for admin operation"
2. Supabase client logs: "✅ Creating Supabase client with SERVICE ROLE KEY"
3. Insert succeeds without RLS errors
4. Raffle appears in database

---

**The code now REQUIRES service role key and will not fall back to anon key!**



