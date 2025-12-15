# 🚨 EMERGENCY FIX: RLS Policy Violation

## ⚠️ IMMEDIATE SOLUTION

You're getting "new row violates row-level security policy" error. Here's how to fix it RIGHT NOW:

---

## 🔧 Solution 1: Disable RLS Temporarily (FASTEST FIX)

### Step 1: Go to Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select project: `puofbkubhtkynvdlwquu`
3. Click **SQL Editor** in left sidebar
4. Click **New query**

### Step 2: Run This SQL

Copy and paste this EXACT SQL:

```sql
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
```

### Step 3: Click "Run"

### Step 4: Try Creating Raffle Again

It should work immediately!

---

## 🔧 Solution 2: Verify Service Role Key (IF Solution 1 Doesn't Work)

### Step 1: Get Service Role Key

1. In Supabase Dashboard → **Settings** → **API**
2. Find **"service_role"** section
3. Click **"Reveal"** button
4. Copy the ENTIRE key (it's very long, hundreds of characters)

### Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Add:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** [Paste the service_role key you copied]
   - **Environment:** Production, Preview, Development
5. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Wait for deployment to complete

### Step 4: Try Creating Raffle Again

---

## ✅ What I Changed in the Code

1. **Direct Service Role Key Usage:**
   - Changed API route to create Supabase client DIRECTLY with service role key
   - No longer uses `createServerClient()` function
   - Ensures service role key is definitely being used

2. **Better Error Messages:**
   - Shows exactly what SQL to run if RLS error occurs
   - Provides clear instructions

3. **Enhanced Logging:**
   - Logs service role key status
   - Shows exactly what's happening

---

## 🎯 Recommended Approach

**Use Solution 1 FIRST** (disable RLS) - it's the fastest and will work immediately.

Then, once raffle creation is working:
1. Add service role key to Vercel (Solution 2)
2. Redeploy
3. Re-enable RLS in Supabase:
   ```sql
   ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
   ```

---

## 📋 Quick Checklist

- [ ] Run SQL: `ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;` in Supabase
- [ ] Try creating raffle
- [ ] Should work now!
- [ ] (Optional) Add service role key to Vercel
- [ ] (Optional) Redeploy
- [ ] (Optional) Re-enable RLS later

---

## 🚨 If Still Not Working

1. **Check Supabase:**
   - Verify RLS is actually disabled:
     ```sql
     SELECT tablename, rowsecurity 
     FROM pg_tables 
     WHERE schemaname = 'public' AND tablename = 'raffles';
     ```
   - Should show `rowsecurity = false`

2. **Check Vercel Logs:**
   - Look for error messages
   - Check if service role key is being used

3. **Try Test Endpoint:**
   - Visit: `https://your-vercel-url.vercel.app/api/admin/test-connection`
   - See what it says

---

**Run the SQL to disable RLS and it will work immediately!**

