-- Pricing Navigation: Database Migration
-- Run this against the database to add pricing support

-- 1. Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_sw TEXT NOT NULL,
  description TEXT,
  description_sw TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TZS',
  interval TEXT NOT NULL DEFAULT 'monthly',
  user_type TEXT NOT NULL CHECK (user_type IN ('standard', 'developer')),
  features JSONB NOT NULL DEFAULT '[]',
  rate_limit_per_min INTEGER,
  burst_per_min INTEGER,
  max_api_keys INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_plans_user_type ON pricing_plans(user_type);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);

-- 2. Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  plan_id UUID NOT NULL REFERENCES pricing_plans(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  provider TEXT NOT NULL CHECK (provider IN ('azampesa', 'mpesa', 'tigopesa', 'manual')),
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- 3. Add plan_id to subscriptions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_id') THEN
    ALTER TABLE subscriptions ADD COLUMN plan_id UUID REFERENCES pricing_plans(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'billing_cycle') THEN
    ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
  END IF;
END $$;

-- 4. Add plan_id and subscription_id to developer_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developer_profiles' AND column_name = 'plan_id') THEN
    ALTER TABLE developer_profiles ADD COLUMN plan_id UUID REFERENCES pricing_plans(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developer_profiles' AND column_name = 'subscription_id') THEN
    ALTER TABLE developer_profiles ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
  END IF;
END $$;

-- 5. Create developer_limits view for fast rate-limit lookups
CREATE OR REPLACE VIEW developer_limits AS
SELECT
  dp.id AS developer_id,
  pp.rate_limit_per_min,
  pp.burst_per_min,
  pp.max_api_keys,
  pp.slug AS plan_slug
FROM developer_profiles dp
JOIN pricing_plans pp ON pp.id = dp.plan_id;

-- 6. Seed default pricing plans
INSERT INTO pricing_plans (slug, name, name_sw, description, description_sw, price, currency, interval, user_type, features, rate_limit_per_min, burst_per_min, max_api_keys, sort_order) VALUES
  -- Standard plans (students & teachers)
  ('free', 'Free', 'Bure', 'Access to free foundational labs', 'Upatikanaji wa maabara za msingi bure', 0, 'TZS', 'monthly', 'standard', '["pricing.features.freeLabs"]', NULL, NULL, NULL, 1),
  ('basic', 'Basic', 'Kawaida', 'All labs, offline sync, exam prep', 'Maabara zote, offline sync, maandalizi ya mtihani', 2000, 'TZS', 'monthly', 'standard', '["pricing.features.allLabs","pricing.features.offlineSync","pricing.features.examPrep"]', NULL, NULL, NULL, 2),
  ('pro', 'Pro', 'Bobezi', 'Priority support, analytics, teacher tools', 'Msaada wa kipaumbele, uchambuzi, zana za walimu', 5000, 'TZS', 'monthly', 'standard', '["pricing.features.allLabs","pricing.features.offlineSync","pricing.features.examPrep","pricing.features.analytics","pricing.features.prioritySupport","pricing.features.teacherTools"]', NULL, NULL, NULL, 3),
  ('institution', 'Institution', 'Chuo / Shule', 'School-wide license, admin dashboard', 'Leseni ya shule nzima, dashibodi ya msimamizi', 25000, 'TZS', 'monthly', 'standard', '["pricing.features.schoolWide","pricing.features.analytics","pricing.features.apiAccess","pricing.features.dedicatedSupport"]', NULL, NULL, NULL, 4),
  -- Developer plans (API access)
  ('dev_free', 'Free', 'Bure', 'Basic API access, 1 key', 'Upatikanaji wa API msingi, ufunguo 1', 0, 'TZS', 'monthly', 'developer', '["pricing.features.apiAccess"]', 10, 20, 1, 5),
  ('dev_basic', 'Basic', 'Kawaida', 'Full API, 3 keys, webhooks', 'API kamili, funguo 3, webhooks', 10000, 'TZS', 'monthly', 'developer', '["pricing.features.apiAccess","pricing.features.apiKeys5","pricing.features.webhooks"]', 60, 120, 3, 6),
  ('dev_pro', 'Pro', 'Bobezi', '10 keys, priority support, SLA', 'Funguo 10, msaada wa kipaumbele, SLA', 30000, 'TZS', 'monthly', 'developer', '["pricing.features.apiAccess","pricing.features.apiKeysUnlimited","pricing.features.webhooks","pricing.features.prioritySupport","pricing.features.sla"]', 300, 600, 10, 7),
  ('dev_enterprise', 'Enterprise', 'Shirika', 'Unlimited keys, dedicated infra, SLA 99.9%', 'Funguo zisizo na kikomo, miundombinu, SLA 99.9%', 80000, 'TZS', 'monthly', 'developer', '["pricing.features.apiAccess","pricing.features.apiKeysUnlimited","pricing.features.webhooks","pricing.features.prioritySupport","pricing.features.sla","pricing.features.dedicatedSupport","pricing.features.customRateLimits"]', 1000, 2000, NULL, 8)
ON CONFLICT (slug) DO NOTHING;
