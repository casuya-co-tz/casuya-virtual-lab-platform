-- ==========================================
-- MIGRATION: Add Teacher Role
-- ==========================================

-- 1. Update the role constraint to include 'teacher'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin','student','developer','teacher'));

-- 2. Add RLS policy so teachers can view progress of students in their school
CREATE POLICY "Teachers view school progress" ON lab_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles teacher 
      JOIN profiles student ON student.id = lab_progress.student_id
      WHERE teacher.id = auth.uid() 
      AND teacher.role = 'teacher' 
      AND teacher.school_id = student.school_id
    )
  );
