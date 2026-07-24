ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews (is_public);
