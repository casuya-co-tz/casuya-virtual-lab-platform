-- ==========================================
-- MIGRATION 005: Security Hardening
-- Solution 5: Minor-unit integer ledger
-- Solution 6: Soft-delete cascade isolation
-- ==========================================

BEGIN;

-- ==========================================
-- SOLUTION 5: Convert payments to integer minor units
-- TZS has no active cents, but we scale by 100 for safety
-- ==========================================

ALTER TABLE payments ADD COLUMN amount_minor_units INT8;

UPDATE payments SET amount_minor_units = ROUND(amount * 100)::INT8 WHERE amount IS NOT NULL;

ALTER TABLE payments DROP COLUMN amount;
ALTER TABLE payments RENAME COLUMN amount_minor_units TO amount;

ALTER TABLE payments ALTER COLUMN amount SET NOT NULL;
ALTER TABLE payments ADD CONSTRAINT chk_positive_payment_amount CHECK (amount >= 0);

-- Apply same fix to subscriptions
ALTER TABLE subscriptions ADD COLUMN amount_minor_units INT8;

UPDATE subscriptions SET amount_minor_units = ROUND(amount * 100)::INT8 WHERE amount IS NOT NULL;

ALTER TABLE subscriptions DROP COLUMN amount;
ALTER TABLE subscriptions RENAME COLUMN amount_minor_units TO amount;

ALTER TABLE subscriptions ADD CONSTRAINT chk_positive_subscription_amount CHECK (amount >= 0);

-- ==========================================
-- SOLUTION 6: Soft-delete for curriculum nodes
-- Replace destructive cascades with logical flags
-- ==========================================

ALTER TABLE topics ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE subtopics ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE labs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Convert cascading deletes to RESTRICT for content tables
ALTER TABLE subtopics DROP CONSTRAINT IF EXISTS subtopics_topic_id_fkey;
ALTER TABLE subtopics ADD CONSTRAINT subtopics_topic_id_fkey
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT;

ALTER TABLE labs DROP CONSTRAINT IF EXISTS labs_subtopic_id_fkey;
ALTER TABLE labs ADD CONSTRAINT labs_subtopic_id_fkey
  FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE RESTRICT;

-- ==========================================
-- Automated cascade trigger for soft-deletes
-- ==========================================

CREATE OR REPLACE FUNCTION handle_curriculum_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'topics' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE subtopics
        SET deleted_at = NEW.deleted_at
        WHERE topic_id = OLD.id AND deleted_at IS NULL;

    ELSIF TG_TABLE_NAME = 'subtopics' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        UPDATE labs
        SET deleted_at = NEW.deleted_at
        WHERE subtopic_id = OLD.id AND deleted_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_soft_delete_topics
    AFTER UPDATE OF deleted_at ON topics
    FOR EACH ROW EXECUTE FUNCTION handle_curriculum_soft_delete();

CREATE TRIGGER trigger_soft_delete_subtopics
    AFTER UPDATE OF deleted_at ON subtopics
    FOR EACH ROW EXECUTE FUNCTION handle_curriculum_soft_delete();

-- ==========================================
-- Indexes for soft-delete queries
-- ==========================================

CREATE INDEX idx_topics_deleted_at ON topics(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_subtopics_deleted_at ON subtopics(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_labs_deleted_at ON labs(deleted_at) WHERE deleted_at IS NULL;

COMMIT;
