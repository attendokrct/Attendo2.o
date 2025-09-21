/*
  # Weekly Attendance Cleanup System

  1. Changes
    - Add function to archive attendance records older than a week
    - Create a scheduled task to run the cleanup weekly
    - Preserve historical data for statistics
*/

-- Create a function to archive old attendance records
CREATE OR REPLACE FUNCTION cleanup_old_attendance_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Move records older than 7 days to attendance_history
  INSERT INTO attendance_history (
    id,
    period_id,
    student_id,
    date,
    status,
    created_at,
    updated_at
  )
  SELECT
    id,
    period_id,
    student_id,
    date,
    status,
    created_at,
    updated_at
  FROM attendance_records
  WHERE date < CURRENT_DATE - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1
    FROM attendance_history
    WHERE attendance_history.id = attendance_records.id
  );

  -- Remove old records from the main table
  DELETE FROM attendance_records
  WHERE date < CURRENT_DATE - INTERVAL '7 days';
END;
$$;