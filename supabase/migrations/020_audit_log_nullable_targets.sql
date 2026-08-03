-- Audit log events without a specific entity (login, logout, signup) were
-- silently dropped because target_id/target_type were NOT NULL.

ALTER TABLE audit_log
  ALTER COLUMN target_type DROP NOT NULL,
  ALTER COLUMN target_id DROP NOT NULL;
