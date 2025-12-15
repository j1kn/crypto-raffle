# 🔗 Supabase Database Connection

## Your Supabase Credentials

**Project URL:** `https://puofbkubhtkynvdlwquu.supabase.co`  
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4`

---

## ✅ Environment Variables Setup

### For Local Development (.env.local)

Create or update `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://puofbkubhtkynvdlwquu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4
```

### For Vercel (Production)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

   **Variable 1:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://puofbkubhtkynvdlwquu.supabase.co`
   - **Environment:** Production, Preview, Development

   **Variable 2:**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1b2Zia3ViaHRreW52ZGx3cXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MjIyOTgsImV4cCI6MjA4MTA5ODI5OH0.iiH7f70Qw93hnojj1FTJbYh80ndiin2ZvFoNuoD03F4`
   - **Environment:** Production, Preview, Development

5. Click **Save**
6. **Redeploy** your project

---

## 🗄️ Database Setup

### Step 1: Run SQL Migration

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New query**
4. Open file: `supabase/migrations/000_complete_fresh_setup.sql`
5. Copy ALL contents and paste into SQL Editor
6. Click **Run**
7. Wait for "Success" message

### Step 2: Verify Tables Created

After running SQL, verify these tables exist:
- ✅ `users`
- ✅ `chains` (should have Ethereum and Solana)
- ✅ `raffles`
- ✅ `raffle_entries`
- ✅ `public_raffles` (view)

---

## 🧪 Test Connection

### Test 1: Check Supabase Client

The code should automatically use these credentials from environment variables.

### Test 2: Create a Test Raffle

1. Go to `/superman` and login with PIN
2. Click "CREATE RAFFLE"
3. Fill out the form
4. Click "CREATE RAFFLE"
5. Should work without "Failed to fetch" error

---

## 🔍 Troubleshooting

### "Failed to fetch" Error

**Possible causes:**
1. Environment variables not set in Vercel
2. Project not redeployed after adding variables
3. Database tables not created (run SQL migration)
4. RLS policies blocking access

**Solutions:**
1. ✅ Verify variables in Vercel
2. ✅ Redeploy after adding variables
3. ✅ Run SQL migration in Supabase
4. ✅ Check Supabase logs for errors

### Connection Issues

**Check:**
- Supabase project is active
- URL is correct: `https://puofbkubhtkynvdlwquu.supabase.co`
- Anon key is correct (no extra spaces)
- Network/firewall not blocking Supabase

---

## 📋 Quick Checklist

- [ ] Environment variables set in `.env.local` (local dev)
- [ ] Environment variables set in Vercel (production)
- [ ] SQL migration run in Supabase
- [ ] Tables created successfully
- [ ] Project redeployed (if using Vercel)
- [ ] Test creating a raffle

---

**Your Supabase is now connected!** 🎉

