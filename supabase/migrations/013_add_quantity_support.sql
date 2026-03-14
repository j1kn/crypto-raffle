-- Add quantity field to raffle_entries for multiple ticket purchases
-- This maintains backward compatibility by defaulting to 1

ALTER TABLE raffle_entries
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Add a check constraint to ensure quantity is positive
ALTER TABLE raffle_entries
ADD CONSTRAINT quantity_positive CHECK (quantity > 0);

-- Update the unique constraint to allow multiple entries per user (for different purchases)
-- Remove the old unique constraint
ALTER TABLE raffle_entries
DROP CONSTRAINT IF EXISTS raffle_entries_raffle_id_user_id_key;

-- Add a comment for clarity
COMMENT ON COLUMN raffle_entries.quantity IS 'Number of tickets purchased in this entry (default 1)';