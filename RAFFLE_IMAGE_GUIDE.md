# Raffle Image Guide

## Image Requirements

### Image Specifications
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1200x600 pixels (2:1 aspect ratio)
- **File Size**: Under 2MB (for fast loading)
- **Content**: Should represent the raffle theme/prize

### Image URL Options

You have **3 options** for image URLs:

---

## Option 1: Supabase Storage (Recommended)

### Step 1: Upload to Supabase Storage

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `puofbkubhtkynvdlwquu`

2. **Open Storage:**
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket" (if you don't have one)
   - Name it: `raffle-images`
   - Make it **Public** (so images can be accessed)

3. **Upload Images:**
   - Click on the bucket
   - Click "Upload file"
   - Upload your raffle images
   - Copy the **Public URL** of each image

### Step 2: Get Image URL Format

After uploading, your image URL will look like:
```
https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/hero-raffle.jpg
```

**Format:**
```
https://[YOUR-PROJECT-ID].supabase.co/storage/v1/object/public/[BUCKET-NAME]/[FILENAME]
```

---

## Option 2: External Image Hosting

You can use any image hosting service:

- **Imgur**: Upload and get direct link
- **Cloudinary**: Free tier available
- **AWS S3**: If you have AWS account
- **Any CDN**: As long as it's publicly accessible

**Example:**
```
https://i.imgur.com/your-image-id.jpg
https://res.cloudinary.com/your-account/image/upload/raffle.jpg
```

---

## Option 3: Direct URL from Your Server

If you host images on your own server:
```
https://yourdomain.com/images/raffle-1.jpg
```

---

## Quick Setup for Supabase Storage

### Create Bucket via SQL (Optional)

If you prefer SQL, run this in Supabase SQL Editor:

```sql
-- Create public bucket for raffle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('raffle-images', 'raffle-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Upload via Supabase Dashboard (Easier)

1. Go to Storage → Create bucket → Name: `raffle-images` → Public: ✅
2. Upload your images
3. Copy the Public URL for each image

---

## Image Naming Suggestions

For easy organization:
- `hero-raffle.jpg` - For hero/featured raffle
- `raffle-1.jpg` - For regular raffle #1
- `raffle-2.jpg` - For regular raffle #2
- `weekly-winner.jpg` - Descriptive names work too

---

## Testing Image URLs

Before using in SQL, test your image URL:
1. Copy the URL
2. Paste in browser
3. Image should load directly
4. If it works, use it in the SQL script

---

## Example Image URLs (Replace These)

In the SQL scripts, you'll see:
```sql
image_url: 'https://your-image-url-here.com/hero-raffle.jpg'
```

**Replace with your actual URLs:**
```sql
-- Supabase Storage example:
image_url: 'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/hero-raffle.jpg'

-- External hosting example:
image_url: 'https://i.imgur.com/abc123.jpg'
```

---

## Important Notes

1. **Images must be publicly accessible** - No authentication required
2. **Use HTTPS URLs** - Required for security
3. **Test URLs first** - Make sure images load before inserting
4. **Optimize images** - Compress to reduce file size and improve loading speed

---

## Need Help?

If you need help uploading images:
1. Use Supabase Storage (easiest option)
2. Or use any free image hosting service
3. Just make sure the URL is publicly accessible

