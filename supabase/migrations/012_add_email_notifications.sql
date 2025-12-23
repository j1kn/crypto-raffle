-- Add optional email field to raffle_entries for notifications
-- This is compatible with existing schema and doesn't break anything

ALTER TABLE raffle_entries
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN raffle_entries.email IS 'Optional email address for raffle notifications (user consent required)';

-- Create an index for email lookups (optional, for future email features)
CREATE INDEX IF NOT EXISTS idx_raffle_entries_email ON raffle_entries(email) WHERE email IS NOT NULL;