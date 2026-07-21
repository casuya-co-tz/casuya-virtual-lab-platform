-- ==========================================
-- SEED DATA: Subjects, Topics, Subtopics
-- NECTA-aligned curriculum for Tanzania
-- ==========================================

-- Physics
INSERT INTO subjects (name, name_sw, icon, sort_order) VALUES
  ('Physics', 'Fizikia', 'physics_icon', 1);

WITH pid AS (SELECT id FROM subjects WHERE name = 'Physics')
INSERT INTO topics (subject_id, title, title_sw, sort_order)
SELECT pid.id, t.* FROM pid, (VALUES
  ('Mechanics', 'Mechanika', 1),
  ('Light', 'Nuru', 2),
  ('Electricity', 'Umeme', 3),
  ('Waves', 'Mawimbi', 4)
) AS t(title, title_sw, sort_order);

-- Mechanics subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Mechanics')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Measurement', 'Vipimo', 1),
  ('Motion', 'Mwendo', 2),
  ('Forces', 'Nguvu', 3),
  ('Work Energy Power', 'Kazi Nguvu Nguvu', 4)
) AS s(title, title_sw, sort_order);

-- Light subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Light')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Reflection', 'Uakisi', 1),
  ('Refraction', 'Kinyume', 2),
  ('Lenses', 'Lenzi', 3)
) AS s(title, title_sw, sort_order);

-- Electricity subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Electricity')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Current', 'Mkondo', 1),
  ('Circuits', 'Sakiti', 2),
  ('Electromagnetism', 'Umeme Sumaku', 3)
) AS s(title, title_sw, sort_order);

-- Waves subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Waves')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Wave Properties', 'Sifa za Mawimbi', 1),
  ('Sound', 'Sauti', 2),
  ('EM Spectrum', 'Spectra ya Umeme', 3)
) AS s(title, title_sw, sort_order);

-- Chemistry
INSERT INTO subjects (name, name_sw, icon, sort_order) VALUES
  ('Chemistry', 'Kemia', 'chemistry_icon', 2);

WITH pid AS (SELECT id FROM subjects WHERE name = 'Chemistry')
INSERT INTO topics (subject_id, title, title_sw, sort_order)
SELECT pid.id, t.* FROM pid, (VALUES
  ('General Chemistry', 'Kemia ya Jumla', 1),
  ('Acids and Bases', 'Asidi na Besi', 2),
  ('Organic Chemistry', 'Kemia Hai', 3)
) AS t(title, title_sw, sort_order);

-- General Chemistry subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'General Chemistry')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('States of Matter', 'Hali za Maada', 1),
  ('Atomic Structure', 'Muundo wa Atomi', 2),
  ('Bonding', 'Vifungo', 3)
) AS s(title, title_sw, sort_order);

-- Acids and Bases subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Acids and Bases')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('pH Scale', 'Kipimo cha pH', 1),
  ('Indicators', 'Vionyeshi', 2),
  ('Titration', 'Titration', 3),
  ('Salts', 'Chumvi', 4)
) AS s(title, title_sw, sort_order);

-- Organic Chemistry subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Organic Chemistry')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Hydrocarbons', 'Hidrokaboni', 1),
  ('Functional Groups', 'Makundi Kazi', 2),
  ('Polymers', 'Polima', 3)
) AS s(title, title_sw, sort_order);

-- Biology
INSERT INTO subjects (name, name_sw, icon, sort_order) VALUES
  ('Biology', 'Biolojia', 'biology_icon', 3);

WITH pid AS (SELECT id FROM subjects WHERE name = 'Biology')
INSERT INTO topics (subject_id, title, title_sw, sort_order)
SELECT pid.id, t.* FROM pid, (VALUES
  ('Cell Biology', 'Biolojia ya Seli', 1),
  ('Genetics', 'Jenetiki', 2),
  ('Ecology', 'Ikolojia', 3)
) AS t(title, title_sw, sort_order);

-- Cell Biology subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Cell Biology')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Cell Structure', 'Muundo wa Seli', 1),
  ('Cell Division', 'Mgawanyiko wa Seli', 2),
  ('Tissues', 'Tishu', 3)
) AS s(title, title_sw, sort_order);

-- Genetics subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Genetics')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('DNA Structure', 'Muundo wa DNA', 1),
  ('Inheritance', 'Urithi', 2),
  ('Variation', 'Tofauti', 3)
) AS s(title, title_sw, sort_order);

-- Ecology subtopics
WITH tid AS (SELECT id FROM topics WHERE title = 'Ecology')
INSERT INTO subtopics (topic_id, title, title_sw, sort_order)
SELECT tid.id, s.* FROM tid, (VALUES
  ('Ecosystems', 'Mifumo ikolojia', 1),
  ('Food Chains', 'Minyororo ya Chakula', 2),
  ('Conservation', 'Uhifadhi', 3)
) AS s(title, title_sw, sort_order);
