# 🔐 Supabase Service Role Key Setup

## ⚠️ CRITICAL: Service Role Key Required

The admin API routes **MUST** use the **SERVICE ROLE KEY** (not anon key) to bypass RLS policies.

---

## 📋 How to Get Service Role Key

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `puofbkubhtkynvdlwquu`

2. **Navigate to Settings**
   - Click **Settings** (gear icon) in left sidebar
   - Click **API** under Project Settings

3. **Copy Service Role Key**
   - Find **"service_role"** key (NOT anon key)
   - Click **"Reveal"** to show the key
   - **Copy the entire key** (it's very long)

4. **Add to Vercel Environment Variables**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - **Settings** → **Environment Variables**
   - Add new variable:
     - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
     - **Value:** [Paste your service role key here]
     - **Environment:** Production, Preview, Development
   - Click **Save**
   - **Redeploy** your project

---

## 🔒 Security Warning

- ⚠️ **NEVER** commit service role key to Git
- ⚠️ **NEVER** use service role key in client-side code
- ⚠️ **ONLY** use in server-side API routes
- ✅ Service role key bypasses ALL RLS policies
- ✅ Keep it secret and secure

---

## ✅ After Adding Service Role Key

1. Redeploy your Vercel project
2. Try creating a raffle again
3. Should work without "Failed to fetch" error

---

## 🧪 Test Connection

After adding the key, the API routes will:
- ✅ Bypass RLS policies
- ✅ Create raffles successfully
- ✅ Update/delete raffles
- ✅ Access all data without restrictions

---

**Your Service Role Key is in Supabase Dashboard → Settings → API → service_role key**

