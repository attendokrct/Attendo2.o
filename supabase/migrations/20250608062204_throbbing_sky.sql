/*
  # Add Student Authentication Support

  1. Changes
    - Add email column to students table
    - Add parent_phone column for WhatsApp notifications
    - Update existing students with generated email addresses

  2. Security
    - Update RLS policies to support student access
*/

-- Add email and parent_phone columns to students table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'email'
  ) THEN
    ALTER TABLE students ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'parent_phone'
  ) THEN
    ALTER TABLE students ADD COLUMN parent_phone text;
  END IF;
END $$;

-- Generate email addresses for existing students
UPDATE students 
SET email = LOWER(roll_number) || '@student.krct.ac.in'
WHERE email IS NULL;

-- Generate sample parent phone numbers (for demo purposes)
UPDATE students 
SET parent_phone = '+91' || (9000000000 + (RANDOM() * 999999999)::bigint)::text
WHERE parent_phone IS NULL;

-- Add unique constraint on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'students' AND constraint_name = 'students_email_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_email_key UNIQUE (email);
  END IF;
END $$;

-- Add RLS policy for students to read their own data
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Add RLS policy for students to read their attendance records
CREATE POLICY "Students can read own attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE email = auth.jwt() ->> 'email'
    )
  );