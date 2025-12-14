# 🔐 Superman Admin Panel Setup (PIN-Based)

## ✅ New PIN-Based Admin System

Your admin panel is now protected by a **secret PIN** instead of wallet addresses!

**Admin Route:** `/superman` (harder to guess than `/admin`)

---

## 🎯 Quick Setup

### Step 1: Set Your Secret PIN

**In Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key:** `ADMIN_PIN`
   - **Value:** Your secret PIN (e.g., `MySecretPin123!`)
   - **Important:** Make it strong and unique!
5. Select all environments: ✅ **Production**, ✅ **Preview**, ✅ **Development**
6. Click **Save**
7. **Redeploy** your project

**For Local Development:**
Add to `.env.local`:
```bash
ADMIN_PIN=MySecretPin123!
```

---

## 🔑 How to Access Admin Panel

1. **Go to:** `https://your-domain.com/superman`
2. **Enter your secret PIN** in the login form
3. Click **"ACCESS ADMIN PANEL"**
4. You'll be redirected to the admin dashboard!

---

## 📋 Features

### Security Improvements:
- ✅ Custom route: `/superman` (harder to guess than `/admin`)
- ✅ PIN-based authentication (no wallet required)
- ✅ Session-based access (PIN verified once per session)
- ✅ Logout button to clear session

### Admin Functions:
- ✅ View all raffles (draft, live, closed, completed)
- ✅ Create new raffles
- ✅ Edit existing raffles
- ✅ Delete raffles
- ✅ Upload raffle images
- ✅ Set receiving addresses (hidden from public)

---

## 🔒 PIN Security Tips

1. **Use a strong PIN:**
   - At least 8 characters
   - Mix of letters, numbers, and symbols
   - Don't use common words or dates

2. **Keep it secret:**
   - Never share your PIN
   - Don't commit it to Git
   - Store it securely (password manager)

3. **Change it regularly:**
   - Update `ADMIN_PIN` in Vercel
   - Redeploy after changing

---

## 🛡️ How It Works

1. **Login:** User visits `/superman` and enters PIN
2. **Verification:** PIN is checked against `ADMIN_PIN` environment variable
3. **Session:** On success, session is stored in browser localStorage
4. **Access:** User can access all admin routes while session is active
5. **Logout:** Click logout button to clear session

---

## 📍 Admin Routes

- **Login:** `/superman`
- **Dashboard:** `/superman/dashboard`
- **Create Raffle:** `/superman/raffles/new`
- **Edit Raffle:** `/superman/raffles/[id]/edit`

---

## 🚨 Troubleshooting

### "Invalid PIN" Error
- Check `ADMIN_PIN` is set in Vercel environment variables
- Verify PIN matches exactly (case-sensitive)
- Redeploy after setting/updating PIN

### Can't Access Admin Panel
- Make sure you're visiting `/superman` (not `/admin`)
- Clear browser cache and localStorage
- Try again with correct PIN

### Session Expired
- Click logout and login again
- Clear browser localStorage if needed

---

## 🔄 Migration from Wallet-Based Admin

**Old System:** `/admin` (wallet-based)
**New System:** `/superman` (PIN-based)

The old `/admin` route still exists but you should use `/superman` for better security.

---

## ✅ Example PIN Ideas

- `PrimePick2024!`
- `RaffleAdmin#123`
- `SuperSecretPIN!`
- `MySecureAdminPass`

**Remember:** Use a strong, unique PIN and keep it secure!

---

**Your admin panel is now at:** `https://your-domain.com/superman` 🔐

