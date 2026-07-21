-- ==========================================
-- PAYMENTS TABLE
-- ==========================================

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT DEFAULT 'TZS',
  payment_method    TEXT NOT NULL,
  status            TEXT CHECK (status IN ('pending','completed','failed','refunded')) DEFAULT 'pending',
  metadata          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id, created_at DESC);
CREATE INDEX idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own payments" ON payments FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read payments" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
