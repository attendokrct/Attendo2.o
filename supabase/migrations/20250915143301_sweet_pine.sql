/*
  # Create function to get student attendance data

  1. Function
    - `get_student_attendance` - Returns attendance records for a student by roll number
    - Bypasses RLS for testing purposes
    - Returns combined data from both attendance tables

  2. Security
    - Function runs with definer rights to bypass RLS
    - Only accessible to authenticated users
*/

CREATE OR REPLACE FUNCTION get_student_attendance(student_roll text)
RETURNS TABLE (
  id uuid,
  period_id uuid,
  student_id uuid,
  date date,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  student_uuid uuid;
BEGIN
  -- Get student ID from roll number
  SELECT s.id INTO student_uuid
  FROM students s
  WHERE s.roll_number = student_roll;
  
  IF student_uuid IS NULL THEN
    RETURN;
  END IF;
  
  -- Return attendance records from both tables
  RETURN QUERY
  SELECT ar.id, ar.period_id, ar.student_id, ar.date, ar.status, ar.created_at, ar.updated_at
  FROM attendance_records ar
  WHERE ar.student_id = student_uuid
  
  UNION ALL
  
  SELECT ah.id, ah.period_id, ah.student_id, ah.date, ah.status, ah.created_at, ah.updated_at
  FROM attendance_history ah
  WHERE ah.student_id = student_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_student_attendance(text) TO authenticated;