# Profile System Setup Guide

## Overview

The profile system allows users to customize their identity while maintaining wallet address as the primary identifier. Profiles are optional and can be completed at any time.

## Database Setup

### Migration Applied
The `create_profiles_table` migration has been applied to your Supabase database. This creates:
- `profiles` table with fields: `wallet_address`, `display_name`, `email`, `profile_picture_url`
- RLS policies for public viewing and user updates
- Auto-update trigger for `updated_at` timestamp

## Storage Bucket Setup

**IMPORTANT**: You need to manually create the storage bucket in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Storage**
3. Click **"New bucket"**
4. Name: `profile-pictures`
5. Set to **Public** (users need to view profile pictures)
6. Create bucket
7. Go to **Policies** tab
8. Add the following policies:

### Policy 1: Public Read Access
- Policy name: "Public read access"
- Allowed operation: SELECT
- Target roles: `anon`, `authenticated`
- Policy definition: `true`

### Policy 2: Authenticated Upload
- Policy name: "Authenticated upload"
- Allowed operation: INSERT
- Target roles: `authenticated`
- Policy definition: `true`

### Policy 3: User Update/Delete (Optional)
- Policy name: "Users can update their own pictures"
- Allowed operation: UPDATE, DELETE
- Target roles: `authenticated`
- Policy definition: `true` (or implement stricter checks based on wallet address matching)

## API Routes

### `/api/profile`
- **GET**: Fetch profile by wallet address
  - Query: `?walletAddress=0x...`
  - Returns: `{ profile: {...} }` or `{ profile: null }`

- **POST**: Create or update profile
  - Body: `{ walletAddress, displayName, email?, profilePictureUrl? }`
  - Returns: `{ profile: {...} }`

### `/api/profile/upload`
- **POST**: Upload profile picture
  - FormData: `file` (image file), `walletAddress`
  - Returns: `{ url: "..." }` (public URL of uploaded image)

### `/api/dashboard/stats`
- **GET**: Fetch dashboard statistics
  - Query: `?walletAddress=0x...`
  - Returns: `{ activeRaffles, totalEntries, pendingDraws, wins }`

## Features

### Auto-Profile Creation
When a user connects their wallet for the first time (via `/api/users/get-or-create`), a default profile is automatically created with:
- `display_name`: Shortened wallet address (e.g., "0x1234...5678")
- `email`: null
- `profile_picture_url`: null

Users can then customize their profile in the Settings page.

### Profile Fields
- **Display Name** (Required): User's chosen display name
- **Email** (Optional): For notifications
- **Profile Picture** (Optional): Uploaded image (max 5MB, JPG/PNG/GIF)

### Dashboard Features
- Profile card showing display name, wallet address, email, and profile picture
- Stats cards: Active Raffles, Total Entries, Pending Draws, Wins
- Enhanced raffle entry cards with status badges (ACTIVE, WON, ENDED)
- Link to Settings page

### Settings Page (`/settings`)
- Edit display name (required)
- Edit email (optional)
- Upload/change profile picture
- Real-time preview of changes
- Form validation and error handling

## Usage

1. **View Profile**: Users see their profile on the Dashboard
2. **Edit Profile**: Navigate to `/settings` from Dashboard
3. **Upload Picture**: Choose image in Settings, save to upload
4. **Auto-Creation**: Profiles are created automatically when wallet connects

## Notes

- Profile pictures are stored in `profile-pictures` bucket
- Images are validated for type (image/*) and size (max 5MB)
- Display name is required but can be changed anytime
- Email is optional and used for notifications
- Wallet address is the primary key and cannot be changed

