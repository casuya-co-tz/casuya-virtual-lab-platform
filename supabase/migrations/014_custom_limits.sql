-- Custom Rate Limits & Integration Engineer Assignment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developer_profiles' AND column_name = 'custom_rate_limit') THEN
    ALTER TABLE developer_profiles ADD COLUMN custom_rate_limit INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developer_profiles' AND column_name = 'custom_burst_limit') THEN
    ALTER TABLE developer_profiles ADD COLUMN custom_burst_limit INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'developer_profiles' AND column_name = 'assigned_engineer_id') THEN
    ALTER TABLE developer_profiles ADD COLUMN assigned_engineer_id UUID REFERENCES profiles(id);
  END IF;
END $$;

-- NECTA Curriculum Tagging
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'labs' AND column_name = 'necta_topic') THEN
    ALTER TABLE labs ADD COLUMN necta_topic TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'labs' AND column_name = 'necta_subtopic') THEN
    ALTER TABLE labs ADD COLUMN necta_subtopic TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'labs' AND column_name = 'necta_level') THEN
    ALTER TABLE labs ADD COLUMN necta_level TEXT CHECK (necta_level IN ('O-Level', 'A-Level'));
  END IF;
END $$;
