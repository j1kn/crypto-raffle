-- SQL script to create profile-pictures storage bucket
-- Run this in Supabase SQL Editor

-- Note: Storage buckets must be created via Supabase Dashboard or Storage API
-- This SQL file is for reference only
-- 
-- To create the bucket:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: profile-pictures
-- 4. Set to Public
-- 5. Create bucket
-- 6. Go to Policies tab and add these policies:

-- Policy 1: Public read access
-- Policy name: "Public read access"
-- Allowed operation: SELECT
-- Target roles: anon, authenticated
-- Policy definition: true

-- Policy 2: Authenticated upload
-- Policy name: "Authenticated upload"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- Policy definition: true

-- Policy 3: Users can update their own files
-- Policy name: "Users can update their own files"
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- Policy definition: true

-- Policy 4: Users can delete their own files
-- Policy name: "Users can delete their own files"
-- Allowed operation: DELETE
-- Target roles: authenticated
-- Policy definition: true

