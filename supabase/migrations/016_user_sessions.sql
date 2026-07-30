-- Server-side session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id            UUID PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at) WHERE revoked_at IS NULL;
