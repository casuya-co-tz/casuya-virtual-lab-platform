-- Past Papers & Mock Practicals
CREATE TABLE IF NOT EXISTS past_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology')),
  year INT NOT NULL,
  paper_number INT NOT NULL DEFAULT 1,
  exam_body TEXT NOT NULL DEFAULT 'NECTA',
  title TEXT NOT NULL,
  title_sw TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  is_premium BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_past_papers_subject ON past_papers(subject, year);

INSERT INTO past_papers (subject, year, paper_number, title, title_sw, questions, is_premium, sort_order) VALUES
  ('physics', 2024, 1, 'NECTA Physics Practical 2024 - Paper 1', 'Fizikia Ya Vitendo 2024 - Karatasi 1',
   '[{"id":"q1","question":"Using a metre rule and a pivot, determine the centre of gravity of a uniform meter rule. Record your measurements and calculate the result.","question_sw":"Kwa kutumia kipinga cha mita na msingi, amua kituo cha uzito cha kipinga cha mita chepesi. Rekodi vipimo vyako na ukadiria matokeo.","marks":10,"type":"practical"}]',
   true, 1),
  ('chemistry', 2024, 1, 'NECTA Chemistry Practical 2024 - Paper 1', 'Kemia Ya Vitendo 2024 - Karatasi 1',
   '[{"id":"q1","question":"You are provided with solution A. Use it to carry out the following tests: (a) Place 2 cm of solution A in a test tube and add sodium hydroxide solution dropwise. (b) Place 2 cm of solution A and add dilute hydrochloric acid.","question_sw":"Umetolewa suluhisho A. Tumia ili kufanya majaribio yafuatayo: (a) Weka cm 2 za suluhisho A kwenye mtubia wa majaribio na ongeza suluhisho la natriamu oksidi. (b) Weka cm 2 za suluhisho A na ongeza asidi ya hidrokloriki iliyolainishwa.","marks":15,"type":"practical"}]',
   true, 1),
  ('biology', 2024, 1, 'NECTA Biology Practical 2024 - Paper 1', 'Biolojia Ya Vitendo 2024 - Karatasi 1',
   '[{"id":"q1","question":"You are given a specimen of a leaf. Using a hand lens, study it and draw a labeled diagram. Record the following: (i) Type of leaf (ii) Venation pattern (iii) Margin type","question_sw":"Umepewa mfano wa jani. Kwa kutumia kioo cha mkono, uchunguza na uchoro ramani iliyowekwa lebo. Rekodi yafuatayo: (i) Aina ya jani (ii) Muundo wa mishipa (iii) Aina ya kingo","marks":10,"type":"practical"}]',
   true, 1),
  ('physics', 2023, 1, 'NECTA Physics Practical 2023 - Paper 1', 'Fizikia Ya Vitendo 2023 - Karatasi 1',
   '[{"id":"q1","question":"A metre rule is balanced on a pivot at the 50 cm mark. A mass of 200 g is hung at the 20 cm mark. Determine where a 150 g mass should be placed to balance the rule.","question_sw":"Kipinga cha mita kimesawazishwa kwenye msingi wa alama ya 50 cm. uzito wa g 200 umewekwa kwenye alama ya 20 cm. Amua mahali ambapo uzito wa g 150 unapaswa kuwekwa ili kusawazisha kipinga.","marks":10,"type":"practical"}]',
   true, 2),
  ('chemistry', 2023, 1, 'NECTA Chemistry Practical 2023 - Paper 1', 'Kemia Ya Vitendo 2023 - Karatasi 1',
   '[{"id":"q1","question":"You are provided with a white solid. Describe how you would identify it using the following tests: (a) Dissolve a portion in water (b) Add dilute hydrochloric acid to another portion","question_sw":"Umepewa chembe chembe nyeupe. Eleza jinsi utakavyoitambua kwa kutumia majaribio yafuatayo: (a) Yeyusha sehemu katika maji (b) Ongeza asidi ya hidrokloriki iliyolainishwa kwenye sehemu nyingine","marks":15,"type":"practical"}]',
   true, 2),
  ('biology', 2023, 1, 'NECTA Biology Practical 2023 - Paper 1', 'Biolojia Ya Vitendo 2023 - Karatasi 1',
   '[{"id":"q1","question":"Examine the specimen of a mammalian heart provided. Draw a fully labeled diagram and identify the following parts: (i) Aorta (ii) Pulmonary artery (iii) Left ventricle","question_sw":"Kagua mfano wa moyo wa punda uliotolewa. Chora ramani iliyowekwa lebo kamili na utambue sehemu zifuatazo: (i) Aota (ii) Arteri ya mapafu (iii) Kamera ya kushoto","marks":10,"type":"practical"}]',
   true, 2);
