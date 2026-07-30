-- ==========================================
-- CASUYA VIRTUAL LABORATORY PLATFORM
-- Initial Database Schema
-- ==========================================

-- Ensure auth.uid() function exists (Supabase compatibility)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE SQL STABLE
  AS 'SELECT current_setting(''app.current_user_id'', true)::uuid';

-- ==========================================
-- CORE TABLES
-- ==========================================

CREATE TABLE schools (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  billing_contact_email TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  role          TEXT CHECK (role IN ('admin','student','developer')) DEFAULT 'student',
  school_id     UUID REFERENCES schools(id) ON DELETE SET NULL,
  language      TEXT CHECK (language IN ('en','sw')) DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  name_sw       TEXT NOT NULL,
  icon          TEXT,
  sort_order    INT DEFAULT 0
);

CREATE TABLE topics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id    UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  title_sw      TEXT NOT NULL,
  sort_order    INT DEFAULT 0
);

CREATE TABLE subtopics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id      UUID REFERENCES topics(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  title_sw      TEXT NOT NULL,
  sort_order    INT DEFAULT 0
);

CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id         UUID REFERENCES schools(id) ON DELETE SET NULL,
  tier              TEXT CHECK (tier IN ('free','premium','enterprise')) DEFAULT 'free',
  status            TEXT CHECK (status IN ('active','expired','pending','cancelled')) DEFAULT 'active',
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 524288000,
  provider          TEXT,
  transaction_id    TEXT,
  amount            NUMERIC(10,2),
  currency          TEXT DEFAULT 'TZS',
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE labs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id       UUID REFERENCES subtopics(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  title_sw          TEXT NOT NULL,
  description       TEXT,
  subject           TEXT CHECK (subject IN ('physics','chemistry','biology')) NOT NULL,
  html_threejs_code TEXT,
  thumbnail         TEXT,
  is_published      BOOL DEFAULT FALSE,
  version           INT DEFAULT 1,
  security_score    INT DEFAULT 0,
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lab_id            UUID REFERENCES labs(id) ON DELETE CASCADE,
  status            TEXT CHECK (status IN ('not_started','in_progress','completed')) DEFAULT 'not_started',
  score             INT DEFAULT 0,
  completion_data   JSONB,
  sync_version      INT DEFAULT 0,
  last_server_ts    TIMESTAMPTZ,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  UNIQUE(student_id, lab_id)
);

-- ==========================================
-- SUBJECT PRESETS
-- ==========================================

CREATE TABLE chemistry_presets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id                UUID REFERENCES labs(id) ON DELETE CASCADE,
  indicator_name        TEXT NOT NULL,
  ph_range_start        NUMERIC(4,2),
  ph_range_end          NUMERIC(4,2),
  color_hex             TEXT,
  molarity_balance      NUMERIC(8,4),
  precipitate_color     TEXT,
  config                JSONB
);

CREATE TABLE physics_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id          UUID REFERENCES labs(id) ON DELETE CASCADE,
  constant_name   TEXT NOT NULL,
  constant_value  NUMERIC(12,6),
  unit            TEXT,
  min_value       NUMERIC(12,6),
  max_value       NUMERIC(12,6),
  config          JSONB
);

CREATE TABLE biology_assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id              UUID REFERENCES labs(id) ON DELETE CASCADE,
  asset_name          TEXT NOT NULL,
  storage_path        TEXT NOT NULL,
  asset_type          TEXT CHECK (asset_type IN ('model','texture','label')),
  interactive_nodes   JSONB,
  visibility_layers   JSONB
);

-- ==========================================
-- API & BILLING
-- ==========================================

CREATE TABLE school_seats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id             UUID REFERENCES schools(id) ON DELETE CASCADE,
  subscription_id       UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  allocated_profile_id  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE developer_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_or_school     TEXT NOT NULL,
  api_tier              TEXT CHECK (api_tier IN ('free','premium','enterprise')) DEFAULT 'free',
  monthly_request_limit INT DEFAULT 5000,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_credentials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id      UUID REFERENCES developer_profiles(id) ON DELETE CASCADE,
  public_token      TEXT NOT NULL UNIQUE,
  hashed_secret     TEXT NOT NULL,
  scopes            TEXT[] DEFAULT ARRAY['labs:read'],
  is_active         BOOL DEFAULT TRUE,
  expires_at        TIMESTAMPTZ,
  request_count     BIGINT DEFAULT 0,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_usage (
  id                BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  credential_id     UUID REFERENCES api_credentials(id) ON DELETE CASCADE,
  endpoint          TEXT NOT NULL,
  status_code       INT NOT NULL,
  ip_address        INET,
  accessed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PLATFORM CONFIG
-- ==========================================

CREATE TABLE platform_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  updated_by    UUID REFERENCES profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documentation (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  category      TEXT DEFAULT 'general',
  published     BOOL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AUDIT TRAIL
-- ==========================================

CREATE TABLE audit_log (
  id            BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  actor_id      UUID REFERENCES profiles(id),
  action        TEXT NOT NULL,
  target_type   TEXT NOT NULL,
  target_id     UUID NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_profiles_school ON profiles(school_id);
CREATE INDEX idx_labs_subtopic ON labs(subtopic_id);
CREATE INDEX idx_labs_subject_published ON labs(subject, is_published);
CREATE INDEX idx_labs_created_by ON labs(created_by);
CREATE INDEX idx_lab_progress_student ON lab_progress(student_id);
CREATE INDEX idx_lab_progress_lab ON lab_progress(lab_id);
CREATE INDEX idx_school_seats_school ON school_seats(school_id);
CREATE INDEX idx_school_seats_subscription ON school_seats(subscription_id);
CREATE INDEX idx_api_credentials_developer ON api_credentials(developer_id);
CREATE INDEX idx_api_usage_credential ON api_usage(credential_id, accessed_at);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_school ON subscriptions(school_id);
CREATE INDEX idx_documentation_slug ON documentation(slug);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, created_at);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile" ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Published labs visible" ON labs FOR SELECT
  USING (is_published = true OR created_by = auth.uid());
CREATE POLICY "Admins manage labs" ON labs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Own progress" ON lab_progress FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Own credentials" ON api_credentials FOR ALL
  USING (developer_id = auth.uid());

CREATE POLICY "Admins read audit" ON audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
