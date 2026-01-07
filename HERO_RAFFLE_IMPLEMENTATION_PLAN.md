# Hero Raffle Implementation Plan

## Current Situation
- The `is_featured` column exists in the database (boolean, default false)
- Admin form has a checkbox for `is_featured`
- API endpoints handle `is_featured` field
- **Problem**: Homepage currently uses `created_at` to determine hero raffle (most recent = hero)
- **Problem**: No validation to ensure only one hero raffle is live at a time

## Issues to Fix

### 1. Homepage Hero Raffle Logic
**Current**: Fetches most recent live raffle by `created_at`
**Needed**: Fetch raffle where `is_featured = true` AND `status = 'live'`

### 2. Single Hero Raffle Enforcement
**Current**: Multiple raffles can have `is_featured = true`
**Needed**: When setting a raffle as featured:
   - If it's being set to live AND featured, unfeature all other live raffles
   - Only one live featured raffle should exist at a time

### 3. API Validation
**Needed**: Add logic in create/update endpoints to:
   - Check if another live raffle has `is_featured = true`
   - If yes, set it to `false` before creating/updating the new hero raffle
   - Only apply this when the new raffle is both `live` AND `is_featured = true`

## Implementation Steps

### Step 1: Update Homepage Hero Raffle Query
- File: `app/page.tsx`
- Change `fetchHeroRaffle()` to query: `is_featured = true AND status = 'live'`
- Order by `created_at DESC` as fallback if multiple exist (shouldn't happen after validation)

### Step 2: Add Hero Raffle Validation in Create API
- File: `app/api/admin/raffles/route.ts` (POST)
- Before inserting, if `is_featured = true` AND `status = 'live'`:
  - Query for other live raffles with `is_featured = true`
  - Update them to `is_featured = false`

### Step 3: Add Hero Raffle Validation in Update API
- File: `app/api/admin/raffles/[id]/route.ts` (PUT)
- Before updating, if setting `is_featured = true` AND `status = 'live'`:
  - Query for other live raffles with `is_featured = true` (excluding current raffle)
  - Update them to `is_featured = false`

### Step 4: Improve Admin Form UI
- File: `app/admin/raffles/new/page.tsx` and `app/admin/raffles/[id]/edit/page.tsx`
- Add helpful text explaining that only one hero raffle can be live at a time
- Show warning if trying to set featured when another featured raffle exists

## Database Schema
✅ `is_featured` column exists: `boolean, nullable, default false`

## Testing Checklist
- [ ] Create a raffle with `is_featured = true` and `status = 'live'` → Should appear as hero
- [ ] Create another raffle with `is_featured = true` and `status = 'live'` → First one should be unfeatured
- [ ] Update a draft raffle to `is_featured = true` and `status = 'live'` → Should become hero, others unfeatured
- [ ] Set a featured raffle to `status = 'closed'` → Should no longer appear as hero
- [ ] Homepage should show only the featured live raffle as hero
- [ ] Regular raffles list should exclude the hero raffle

