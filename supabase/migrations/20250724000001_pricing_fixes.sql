-- Add is_premium to labs and fix upgrade integration
ALTER TABLE labs ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_labs_is_premium ON labs(is_premium);
