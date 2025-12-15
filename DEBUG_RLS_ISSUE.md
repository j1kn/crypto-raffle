# 🔍 Debug RLS Issue - Step by Step

## You've tried both methods but still getting RLS error. Let's debug this completely.

---

## Step 1: Check RLS Status

### Go to Supabase SQL Editor and run:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'raffles';
```

**Expected Result:**
- `rowsecurity = false` → RLS is disabled ✅
- `rowsecurity = true` → RLS is still enabled ❌

**If RLS is still enabled:**
```sql
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
```

---

## Step 2: Check All RLS Policies

Run this to see all policies on the raffles table:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'raffles';
```

**If you see any policies, drop them:**

```sql
-- Drop all policies on raffles table
DROP POLICY IF EXISTS "allow_all_inserts" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can create raffles" ON raffles;
DROP POLICY IF EXISTS "public_insert" ON raffles;
DROP POLICY IF EXISTS "Public can view live raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can update raffles" ON raffles;
```

---

## Step 3: Test Connection Endpoint

Visit this URL in your browser:
```
https://crypto-raffle-heys.vercel.app/api/admin/check-rls
```

This will tell you:
- ✅ If service role key is set
- ✅ If service role key can insert
- ✅ If RLS is blocking
- ✅ What the exact error is

**Share the response** so we can see what's happening.

---

## Step 4: Verify Service Role Key in Vercel

1. Go to Vercel Dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Check:
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` exists
   - ✅ Value is the **service_role** key (not anon key)
   - ✅ It's very long (hundreds of characters)
   - ✅ Starts with `eyJ...`

**If it's missing or wrong:**
- Get it from Supabase → Settings → API → service_role
- Add it to Vercel
- **Redeploy** (important!)

---

## Step 5: Check Vercel Logs

1. Go to Vercel Dashboard
2. Your Project → **Deployments** → Latest
3. Click **Functions** → `/api/admin/raffles`
4. Click **Logs**

**Look for:**
- `✅ Supabase client created directly with service role key`
- `✅ Test query successful`
- `🚨 RLS is STILL ENABLED`
- Any error messages

---

## Step 6: Complete RLS Reset

If nothing works, completely reset RLS:

```sql
-- 1. Disable RLS
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies
DROP POLICY IF EXISTS "allow_all_inserts" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can create raffles" ON raffles;
DROP POLICY IF EXISTS "public_insert" ON raffles;
DROP POLICY IF EXISTS "Public can view live raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can update raffles" ON raffles;

-- 3. Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'raffles';
-- Should show: rowsecurity = false

-- 4. Verify no policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'raffles';
-- Should return: (0 rows)
```

---

## Step 7: Test Direct Insert in Supabase

1. Go to Supabase Dashboard → **Table Editor**
2. Click on `raffles` table
3. Click **Insert row**
4. Fill in:
   - `title`: "Test Raffle"
   - `prize_pool_amount`: 1
   - `prize_pool_symbol`: "ETH"
   - `ticket_price`: 0.001
   - `max_tickets`: 100
   - `status`: "draft"
   - `receiving_address`: "0x0000000000000000000000000000000000000000"
   - `ends_at`: (pick a future date)
5. Click **Save**

**If this works:** RLS is disabled ✅
**If this fails:** RLS is still enabled ❌

---

## Step 8: Check Table Structure

Make sure the table has all required columns:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'raffles'
ORDER BY ordinal_position;
```

**Required columns:**
- `title` (text, NOT NULL)
- `prize_pool_amount` (numeric, NOT NULL)
- `prize_pool_symbol` (text, NOT NULL)
- `ticket_price` (numeric, NOT NULL)
- `max_tickets` (integer, NOT NULL)
- `status` (text, NOT NULL)
- `receiving_address` (text, NOT NULL)
- `ends_at` (timestamp, NOT NULL)

---

## 🚨 Common Issues

### Issue 1: RLS Re-enabled After Disabling

**Solution:** Run the disable command again:
```sql
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
```

### Issue 2: Policies Still Exist

**Solution:** Drop all policies (see Step 6)

### Issue 3: Service Role Key Not Set

**Solution:** Add it to Vercel and redeploy

### Issue 4: Wrong Key Type

**Solution:** Make sure you're using **service_role** key, not anon key

### Issue 5: Project Not Redeployed

**Solution:** After adding service role key, **redeploy** in Vercel

---

## 📋 Quick Diagnostic Checklist

Run these in order:

- [ ] Check RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'raffles';`
- [ ] Disable RLS: `ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;`
- [ ] Drop all policies (see Step 6)
- [ ] Visit: `/api/admin/check-rls` endpoint
- [ ] Check Vercel logs for errors
- [ ] Verify service role key in Vercel
- [ ] Test direct insert in Supabase Table Editor
- [ ] Try creating raffle again

---

## 🆘 Still Not Working?

**Share with me:**
1. Response from `/api/admin/check-rls` endpoint
2. Vercel logs (screenshot or copy)
3. Result of RLS status query
4. Result of policies query
5. Any error messages you see

This will help me identify the exact issue!

---

**Start with Step 1 and work through each step. Share what you find!**

