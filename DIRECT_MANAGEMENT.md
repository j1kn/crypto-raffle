# Direct Management via API

I can now manage your Vercel deployments and Supabase database directly using the API tokens you provided!

## ✅ What's Set Up

### 1. **Vercel API Integration**
- **Token:** Configured and working
- **Projects Found:** `crypto-raffle-heys`, `crypto-raffle`, and others
- **API Route:** `/api/deploy/vercel`
- **Capabilities:**
  - Trigger deployments
  - View deployment status
  - Redeploy existing deployments

### 2. **Supabase API Integration**
- **Service Role Key:** Configured
- **API Route:** `/api/supabase/query`
- **Capabilities:**
  - Query tables
  - Insert data
  - Update data
  - Delete data
  - Run SQL queries

## 🚀 How to Use

### Deploy to Vercel

**Option 1: Via API Route (from me)**
Just ask me: *"Deploy to Vercel"* and I'll:
1. Push code to GitHub
2. Trigger Vercel deployment
3. Show you the deployment URL

**Option 2: Via Script**
```bash
npm run deploy:all
```

**Option 3: Manual API Call**
```bash
curl -X POST http://localhost:3000/api/deploy/vercel \
  -H "Content-Type: application/json" \
  -d '{"action": "deploy"}'
```

### Manage Supabase

**Query Raffles:**
```bash
curl -X POST http://localhost:3000/api/supabase/query \
  -H "Content-Type: application/json" \
  -d '{
    "action": "query",
    "table": "raffles"
  }'
```

**Insert Raffle:**
```bash
curl -X POST http://localhost:3000/api/supabase/query \
  -H "Content-Type: application/json" \
  -d '{
    "action": "insert",
    "table": "raffles",
    "data": {
      "title": "New Raffle",
      "description": "Test",
      "prize_pool_amount": 1.0,
      "ticket_price": 0.001,
      ...
    }
  }'
```

## 📋 What I Can Do For You

### Vercel:
- ✅ Deploy your project
- ✅ Check deployment status
- ✅ View deployment logs
- ✅ Redeploy if needed
- ✅ Set environment variables (via API)

### Supabase:
- ✅ Create raffles directly
- ✅ Update raffle data
- ✅ Query raffles and entries
- ✅ Run SQL migrations
- ✅ Manage database schema

## 🔒 Security

- Tokens are stored securely (not in Git)
- API routes are server-side only
- Service role key has full access (use carefully)
- Vercel token has deployment access

## 🎯 Example Commands You Can Ask Me

1. **"Deploy to Vercel"** - I'll push and deploy
2. **"Create a raffle in Supabase"** - I'll insert it directly
3. **"Show me all live raffles"** - I'll query Supabase
4. **"Update raffle #123"** - I'll update it
5. **"Check Vercel deployment status"** - I'll check for you

## 📝 Current Status

✅ **Vercel:** Connected and ready
✅ **Supabase:** Connected and ready  
✅ **GitHub:** Already connected (auto-push enabled)

## 🚀 Next Steps

Just tell me what you want to do:
- Deploy to Vercel
- Create raffles
- Query data
- Update anything

I'll handle it directly!



