-- Add winner fields to raffles table
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS winner_drawn_at TIMESTAMP WITH TIME ZONE;

-- Create index for winner lookups
CREATE INDEX IF NOT EXISTS idx_raffles_winner ON raffles(winner_user_id);

-- Add comment
COMMENT ON COLUMN raffles.winner_user_id IS 'User ID of the raffle winner (drawn randomly when raffle ends)';
COMMENT ON COLUMN raffles.winner_drawn_at IS 'Timestamp when the winner was drawn';

