/*
  # Add missing RLS policies for attendance_history table

  1. Security Changes
    - Add INSERT policy for authenticated faculty to create attendance history records
    - Add UPDATE policy for authenticated faculty to modify attendance history records
    - Policies ensure faculty can only manage records for their own periods

  2. Changes Made
    - INSERT policy: Faculty can insert attendance history for their assigned periods
    - UPDATE policy: Faculty can update attendance history for their assigned periods
*/

-- Policy to allow faculty to insert attendance history records for their periods
CREATE POLICY "Allow faculty to insert attendance history"
  ON attendance_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM periods
      WHERE periods.id = attendance_history.period_id
      AND periods.faculty_id = auth.uid()
    )
  );

-- Policy to allow faculty to update attendance history records for their periods
CREATE POLICY "Allow faculty to update attendance history"
  ON attendance_history
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM periods
      WHERE periods.id = attendance_history.period_id
      AND periods.faculty_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM periods
      WHERE periods.id = attendance_history.period_id
      AND periods.faculty_id = auth.uid()
    )
  );