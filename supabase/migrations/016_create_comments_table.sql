-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL, -- Denormalized for easy display
  display_name TEXT, -- From profile if available
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read comments
CREATE POLICY "Public comments are viewable by everyone" 
ON comments FOR SELECT 
TO public 
USING (true);

-- Policy: Authenticated users can insert comments
-- Note: Since we're using wallet addresses, we'll handle auth in API routes with service role
CREATE POLICY "Users can insert their own comments" 
ON comments FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE 
TO authenticated 
USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE 
TO authenticated 
USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

COMMENT ON TABLE comments IS 'User comments section at the bottom of the homepage';
COMMENT ON COLUMN comments.wallet_address IS 'Denormalized wallet address for display without joins';
COMMENT ON COLUMN comments.display_name IS 'Optional display name from user profile';

