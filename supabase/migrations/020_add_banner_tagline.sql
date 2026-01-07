-- Add banner_tagline column to raffles table
-- This will be used to display promotional banners for hero raffles

ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS banner_tagline TEXT;

COMMENT ON COLUMN raffles.banner_tagline IS 'Promotional tagline displayed in the top banner for hero raffles. Shown in a scrolling/moving banner that links to the raffle detail page.';

