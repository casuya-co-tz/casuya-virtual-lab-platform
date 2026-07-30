-- ==========================================
-- DATABASE PERFORMANCE INDEXES
-- Run this migration to add missing indexes
-- ==========================================

-- 1. Enable pg_trgm for fast ILIKE / fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GIN indexes for search route (ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_labs_title_trgm ON labs USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_labs_title_sw_trgm ON labs USING GIN (title_sw gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_labs_description_trgm ON labs USING GIN (description gin_trgm_ops);

-- 3. Add deleted_at column if missing (required by API routes)
ALTER TABLE labs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. Partial index for published lab listing (most common query)
CREATE INDEX IF NOT EXISTS idx_labs_deleted_at ON labs(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_labs_published_active
  ON labs (created_at DESC)
  WHERE is_published = true AND deleted_at IS NULL;

-- 5. Composite index for subject-filtered listing
CREATE INDEX IF NOT EXISTS idx_labs_subject_published_created
  ON labs (subject, created_at DESC)
  WHERE is_published = true AND deleted_at IS NULL;

-- 6. Index for code endpoint (single lab code fetch)
CREATE INDEX IF NOT EXISTS idx_labs_code_fetch
  ON labs (id, is_published, is_premium)
  WHERE deleted_at IS NULL;

-- 7. Index for lab_progress joins (frequently joined)
CREATE INDEX IF NOT EXISTS idx_lab_progress_lab_student
  ON lab_progress (lab_id, student_id);
