/*
  # Add On Duty status to attendance records

  1. Changes
    - Update attendance_records table to include 'on_duty' status
    - Modify check constraint for status column
*/

-- Update the check constraint for the status column
ALTER TABLE attendance_records DROP CONSTRAINT attendance_records_status_check;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check 
  CHECK (status IN ('present', 'absent', 'on_duty'));