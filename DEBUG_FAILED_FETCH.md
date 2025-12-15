# 🔍 Debugging "Failed to Fetch" Error

## Common Causes

1. **Service Role Key Not Set in Vercel** ⚠️ MOST COMMON
2. **Network/CORS Error**
3. **API Route Crashing Before Response**
4. **Invalid Request Body**
5. **Supabase Client Initialization Failure**

---

## 🔧 Step-by-Step Debugging

### Step 1: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. **Settings** → **Environment Variables**
4. Verify these exist:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://puofbkubhtkynvdlwquu.supabase.co`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGci...`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = `[your service role key]` ← **CRITICAL**
   - ✅ `ADMIN_PIN` = `London@123!!`

5. **If `SUPABASE_SERVICE_ROLE_KEY` is missing:**
   - Get it from Supabase Dashboard → Settings → API → service_role key
   - Add it to Vercel
   - **Redeploy** your project

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating a raffle
4. Look for errors:
   - Network errors
   - CORS errors
   - JavaScript errors

### Step 3: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. **Deployments** → Click latest deployment
3. **Functions** tab
4. Look for `/api/admin/raffles` function
5. Check **Logs** for errors:
   - "Admin PIN not configured"
   - "Supabase credentials not configured"
   - "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not set"
   - Supabase insert errors

### Step 4: Test API Route Directly

Use curl or Postman to test:

```bash
curl -X POST https://your-vercel-url.vercel.app/api/admin/raffles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Raffle",
    "prize_pool_amount": "100",
    "prize_pool_symbol": "ETH",
    "ticket_price": "1",
    "max_tickets": "100",
    "status": "draft",
    "receiving_address": "0x123...",
    "ends_at": "2024-12-31T23:59:59Z"
  }'
```

Check the response for error messages.

---

## 🚨 Most Likely Issues

### Issue 1: Service Role Key Missing

**Symptom:** "Failed to fetch" with no detailed error

**Fix:**
1. Get service role key from Supabase
2. Add to Vercel as `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

### Issue 2: API Route Crashing

**Symptom:** Network error, no response

**Check:**
- Vercel function logs
- Look for uncaught exceptions
- Check if `createServerClient()` is throwing

### Issue 3: CORS Error

**Symptom:** CORS error in browser console

**Fix:**
- API routes should not have CORS issues in Next.js
- Check if route is accessible

### Issue 4: Invalid Request Body

**Symptom:** 400 error or parsing error

**Check:**
- Browser Network tab → Request payload
- Verify all required fields are present

---

## ✅ Verification Checklist

After adding service role key:

- [ ] Service role key added to Vercel
- [ ] Project redeployed
- [ ] Try creating raffle again
- [ ] Check browser console for errors
- [ ] Check Vercel logs for errors
- [ ] Verify Supabase client is created (check logs)
- [ ] Verify raffle data is being sent correctly

---

## 📋 What the Code Now Does

1. **Validates environment variables** before processing
2. **Logs detailed errors** to Vercel logs
3. **Handles network errors** gracefully
4. **Shows specific error messages** to user
5. **Checks Supabase client initialization**

---

## 🔍 Check These Logs

### In Vercel Logs, Look For:

```
✅ Creating Supabase client: { url: '...', hasServiceRoleKey: true, ... }
Creating raffle with data: { title: '...', ... }
Inserting raffle with data: { ... }
Raffle created successfully: [uuid]
```

### If You See:

```
❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is not set
```
→ **Add service role key to Vercel**

```
❌ SUPABASE_URL is not set
```
→ **Add NEXT_PUBLIC_SUPABASE_URL to Vercel**

```
Supabase insert error: ...
```
→ **Check the specific Supabase error message**

---

**The code now has comprehensive error handling. Check Vercel logs for the exact error!**

