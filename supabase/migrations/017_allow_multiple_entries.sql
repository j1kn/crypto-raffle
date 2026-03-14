-- Remove UNIQUE constraint on raffle_entries (raffle_id, user_id) to allow multiple entries
-- Users can now enter the same raffle multiple times, but still subject to 20% total ticket limit

-- Drop the unique constraint
ALTER TABLE raffle_entries 
DROP CONSTRAINT IF EXISTS raffle_entries_raffle_id_user_id_key;

-- Create a new index for efficient querying (non-unique)
CREATE INDEX IF NOT EXISTS idx_raffle_entries_raffle_user 
ON raffle_entries(raffle_id, user_id);

-- Add a comment explaining the change
COMMENT ON TABLE raffle_entries IS 'Users can have multiple entries per raffle, but total tickets per user cannot exceed 20% of max_tickets';

