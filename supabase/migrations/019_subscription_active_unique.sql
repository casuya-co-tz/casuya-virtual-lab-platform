-- Prevent duplicate active subscriptions per user (idempotent payment callbacks/polls)

-- Dedupe existing active subscriptions first: keep the most recent per user.
DELETE FROM subscriptions a
USING subscriptions b
WHERE a.user_id = b.user_id
  AND a.status = 'active' AND b.status = 'active'
  AND a.id <> b.id
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_unique_active_user
  ON subscriptions(user_id)
  WHERE status = 'active';
