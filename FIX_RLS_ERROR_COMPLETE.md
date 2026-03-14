# 🔧 COMPLETE FIX: "new row violates row-level security policy" Error

## 🚨 The Problem

You're getting this error when creating raffles:
```
Error: new row violates row-level security policy
```

This happens because **Row Level Security (RLS)** is enabled on the `raffles` table and is blocking inserts.

---

## ✅ SOLUTION: Two Options

### **Option 1: Disable RLS (FASTEST - Works Immediately)** ⚡

This is the **quickest fix** and will work right away.

#### Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard
2. Select your project: `puofbkubhtkynvdlwquu`
3. Click **SQL Editor** in the left sidebar
4. Click **New query** button

#### Step 2: Copy and Paste This SQL

```sql
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
```

#### Step 3: Click "Run" Button

Wait for "Success" message.

#### Step 4: Try Creating Raffle Again

Go back to your admin panel and try creating a raffle. **It should work immediately!**

---

### **Option 2: Use Service Role Key (PROPER - But Requires Setup)** 🔐

This is the **proper solution** but requires adding the service role key to Vercel.

#### Step 1: Get Service Role Key from Supabase

1. Go to: https://supabase.com/dashboard
2. Select project: `puofbkubhtkynvdlwquu`
3. Click **Settings** (gear icon) → **API**
4. Find **"service_role"** section (NOT anon key)
5. Click **"Reveal"** button
6. **Copy the ENTIRE key** (it's very long, hundreds of characters)

#### Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `crypto-raffle-heys`
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** [Paste the service_role key you copied]
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

#### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

#### Step 4: Try Creating Raffle

The service role key will bypass RLS automatically.

---

## 🎯 RECOMMENDED: Use Option 1 First

**I recommend using Option 1 (disable RLS) first** because:
- ✅ Works immediately (no waiting for deployment)
- ✅ No configuration needed
- ✅ You can test raffle creation right away

Then, later, you can:
1. Add service role key to Vercel (Option 2)
2. Re-enable RLS:
   ```sql
   ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
   ```

---

## 📋 Step-by-Step Checklist

### Quick Fix (Option 1):

- [ ] Go to Supabase SQL Editor
- [ ] Run: `ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;`
- [ ] See "Success" message
- [ ] Try creating raffle in admin panel
- [ ] ✅ Should work!

### Proper Fix (Option 2):

- [ ] Get service_role key from Supabase
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Redeploy project
- [ ] Try creating raffle
- [ ] ✅ Should work!

---

## 🔍 Verify RLS is Disabled

After running Option 1, you can verify RLS is disabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'raffles';
```

Should show: `rowsecurity = false`

---

## 🚨 If Still Not Working

### Check 1: Verify SQL Ran Successfully

- Go back to Supabase SQL Editor
- Check if you see "Success" message
- If you see an error, copy the error and check it

### Check 2: Verify in Supabase Table Editor

1. Go to Supabase Dashboard → **Table Editor**
2. Click on `raffles` table
3. Try to manually insert a row
4. If it works, RLS is disabled

### Check 3: Check Vercel Logs

1. Go to Vercel Dashboard
2. Your Project → **Deployments** → Latest
3. Click **Functions** tab
4. Look for `/api/admin/raffles` function
5. Check **Logs** for errors

### Check 4: Test Connection Endpoint

Visit: `https://crypto-raffle-heys.vercel.app/api/admin/test-connection`

This will tell you if the service role key is working.

---

## 📝 What the Code Does Now

The code is already configured to:
1. ✅ Use service role key when available
2. ✅ Create Supabase client directly with service role key
3. ✅ Bypass RLS automatically (if service role key is set)
4. ✅ Show clear error messages if RLS blocks

**The only thing blocking you is RLS on the database side.**

---

## ✅ After Fixing

Once RLS is disabled (Option 1) or service role key is added (Option 2):

1. ✅ Raffle creation will work
2. ✅ No more "RLS violation" errors
3. ✅ Raffles will be saved to database
4. ✅ You can see them in Supabase Table Editor

---

## 🎉 Summary

**FASTEST FIX:**
1. Go to Supabase SQL Editor
2. Run: `ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;`
3. Try creating raffle → **Should work!**

**PROPER FIX (Later):**
1. Add service role key to Vercel
2. Redeploy
3. Re-enable RLS (optional)

---

**Run the SQL command and your raffle creation will work immediately!** 🚀

