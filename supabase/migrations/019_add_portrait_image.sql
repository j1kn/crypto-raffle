-- Add portrait image field for mobile home/tournament pages
-- Landscape image (image_url) will be used for desktop and mobile detail pages
-- Portrait image (image_url_portrait) will be used for mobile home/tournament pages only

ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS image_url_portrait TEXT;

COMMENT ON COLUMN raffles.image_url_portrait IS 'Portrait orientation image for mobile home and tournament pages. Landscape image (image_url) is used for desktop and mobile detail pages.';

