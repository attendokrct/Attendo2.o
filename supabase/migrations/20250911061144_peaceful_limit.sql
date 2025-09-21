/*
  # Fix Attendance Table Constraints

  1. Database Changes
    - Ensure proper constraints on attendance_records table
    - Add composite unique constraint on (period_id, student_id, date)
    - Ensure date field is properly indexed
    - Add similar constraints to attendance_history table

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with proper constraints
*/

-- Add composite unique constraint to prevent duplicate attendance records for same student, period, and date
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'attendance_records_unique_per_day' 
    AND table_name = 'attendance_records'
  ) THEN
    ALTER TABLE attendance_records 
    ADD CONSTRAINT attendance_records_unique_per_day 
    UNIQUE (period_id, student_id, date);
  END IF;
END $$;

-- Add index on date field for better query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_attendance_records_date'
  ) THEN
    CREATE INDEX idx_attendance_records_date ON attendance_records (date);
  END IF;
END $$;

-- Add composite unique constraint to attendance_history table as well
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'attendance_history_unique_per_day' 
    AND table_name = 'attendance_history'
  ) THEN
    ALTER TABLE attendance_history 
    ADD CONSTRAINT attendance_history_unique_per_day 
    UNIQUE (period_id, student_id, date);
  END IF;
END $$;

-- Ensure both tables have proper date defaults
DO $$
BEGIN
  -- Check if date column has proper default in attendance_records
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_records' 
    AND column_name = 'date' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE attendance_records 
    ALTER COLUMN date SET DEFAULT CURRENT_DATE;
  END IF;
  
  -- Check if date column has proper default in attendance_history
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_history' 
    AND column_name = 'date' 
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE attendance_history 
    ALTER COLUMN date SET DEFAULT CURRENT_DATE;
  END IF;
END $$;