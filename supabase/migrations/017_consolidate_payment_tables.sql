-- ==========================================
-- CONSOLIDATE PAYMENT TABLES
-- ==========================================
-- The `payments` table (002) is legacy and unused.
-- All payment logic now uses `payment_transactions` (20250724000000).
-- This migration migrates any existing data and drops the old table.

-- Migrate existing data from payments to payment_transactions (best-effort)
INSERT INTO payment_transactions (user_id, amount, currency, provider, status, metadata, created_at)
SELECT
  user_id,
  amount::INTEGER,
  COALESCE(currency, 'TZS'),
  COALESCE(payment_method, 'azampesa'),
  CASE
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'failed' THEN 'failed'
    WHEN status = 'refunded' THEN 'refunded'
    ELSE 'pending'
  END,
  metadata,
  created_at
FROM payments
WHERE NOT EXISTS (
  SELECT 1 FROM payment_transactions pt
  WHERE pt.user_id = payments.user_id
    AND pt.amount = payments.amount::INTEGER
    AND pt.created_at = payments.created_at
)
ON CONFLICT DO NOTHING;

-- Drop RLS policies first
DROP POLICY IF EXISTS "Own payments" ON payments;
DROP POLICY IF EXISTS "Admins read payments" ON payments;

-- Drop the legacy table
DROP TABLE IF EXISTS payments CASCADE;

-- Add index for provider_transaction_id if not exists
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_tx
  ON payment_transactions(provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;
