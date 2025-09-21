/*
  # Create attendance history table for archival

  1. New Tables
    - `attendance_history`
      - Same structure as attendance_records
      - Used for long-term storage of attendance data
      - No automatic cleanup

  2. Security
    - Enable RLS on attendance_history table
    - Add policies for faculty access
*/

-- Create attendance_history table for long-term storage
CREATE TABLE IF NOT EXISTS attendance_history (
  id uuid PRIMARY KEY,
  period_id uuid REFERENCES periods(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'on_duty')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE attendance_history ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance_history
CREATE POLICY "Allow faculty to read attendance history"
  ON attendance_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM periods
      WHERE periods.id = attendance_history.period_id
      AND periods.faculty_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_attendance_history_updated_at
  BEFORE UPDATE ON attendance_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_history_period_date 
  ON attendance_history(period_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_history_student_date 
  ON attendance_history(student_id, date);