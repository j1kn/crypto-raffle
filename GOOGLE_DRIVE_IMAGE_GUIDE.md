# Google Drive Image Guide

## ✅ Yes, You Can Use Google Drive Links!

Your raffle platform now supports Google Drive image links. The system automatically converts Google Drive share links to direct image URLs.

## 📋 How to Use Google Drive Images

### Step 1: Upload Image to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Upload your raffle image
3. Right-click the image file
4. Click "Share" → "Get link"
5. Make sure link sharing is enabled (set to "Anyone with the link")

### Step 2: Copy the Share Link

You'll get a link like:
```
https://drive.google.com/file/d/1ABC123xyz456/view?usp=sharing
```

OR

```
https://drive.google.com/open?id=1ABC123xyz456
```

### Step 3: Use in Raffle Creation

When creating a raffle in the admin panel:
- **Option 1:** Paste the Google Drive share link directly
- **Option 2:** Use the direct image URL (system converts automatically)

The system will automatically convert it to:
```
https://drive.google.com/uc?export=view&id=1ABC123xyz456
```

## 🔧 Supported Formats

The system automatically detects and converts:
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://drive.google.com/drive/folders/FILE_ID` (if it's an image)

## ✅ What Works

- ✅ Google Drive share links (automatically converted)
- ✅ Direct image URLs (Supabase Storage, Imgur, etc.)
- ✅ Any HTTPS image URL

## 📝 Notes

- Make sure the Google Drive file is set to "Anyone with the link can view"
- Large images may take longer to load
- For best performance, use images under 2MB
- Recommended image size: 1200x800px or similar

## 🎯 Example

**In Admin Panel:**
```
Image URL: https://drive.google.com/file/d/1ABC123xyz456/view?usp=sharing
```

**System Converts To:**
```
https://drive.google.com/uc?export=view&id=1ABC123xyz456
```

**Result:** Image displays perfectly in your raffles! ✅

