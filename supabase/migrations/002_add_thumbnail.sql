-- Migration: Add thumbnail field to labs table
ALTER TABLE labs ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Update existing labs to have default thumbnails based on subject
UPDATE labs SET thumbnail = CASE subject
    WHEN 'physics' THEN 'https://example.com/thumbs/physics.jpg'
    WHEN 'chemistry' THEN 'https://example.com/thumbs/chemistry.jpg'
    WHEN 'biology' THEN 'https://example.com/thumbs/biology.jpg'
    ELSE NULL
END;

-- Create index on thumbnail for faster queries
CREATE INDEX IF NOT EXISTS idx_labs_thumbnail ON labs(thumbnail);

-- Update thumbnail field definition to include sample data
ALTER TABLE labs ALTER COLUMN thumbnail SET DEFAULT NULL;
