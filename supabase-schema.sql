-- Migration script to create past_papers table
-- Run this with: npx supabase db push

CREATE TABLE past_papers (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  paper_number INTEGER NOT NULL,
  exam_body TEXT NOT NULL,
  title TEXT NOT NULL,
  title_sw TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_past_papers_subject ON past_papers(subject);
CREATE INDEX idx_past_papers_year ON past_papers(year);
CREATE INDEX idx_past_papers_sort_order ON past_papers(sort_order);

-- Insert initial data
INSERT INTO past_papers (id, subject, year, paper_number, exam_body, title, title_sw, is_premium, sort_order, created_at) VALUES
('1', 'physics', 2023, 1, 'NEET', 'Physics Practical Assessment', 'Maadun Tukufu wa Physics', false, 1, NOW()),
('2', 'chemistry', 2023, 1, 'NEET', 'Chemistry Practical Assessment', 'Maadun Tukufu wa Chemistry', false, 2, NOW()),
('3', 'biology', 2023, 1, 'NEET', 'Biology Practical Assessment', 'Maadun Tukufu wa Biology', false, 3, NOW()),
('4', 'physics', 2022, 1, 'WASSCE', 'Physics Practical Assessment', 'Maadun Tukufu wa Physics', true, 4, NOW()),
('5', 'chemistry', 2022, 1, 'WASSCE', 'Chemistry Practical Assessment', 'Maadun Tukufu wa Chemistry', false, 5, NOW());

COMMENT ON TABLE past_papers IS 'Stores past paper practical assessments';
