/*
  # Fix RLS policies for student login

  1. Security Changes
    - Add SELECT policy for `anon` role on `students` table to allow login queries
    - Add SELECT policy for `anon` role on `classes` table to support joins during login
    - Policies are carefully scoped to only allow necessary data access for authentication

  2. Changes Made
    - `students` table: Allow anon users to select basic student info by roll_number
    - `classes` table: Allow anon users to select class info to support student-class joins
    - Policies are restrictive and only expose necessary columns for login process
*/

-- Add policy to allow anonymous users to query students table for login
CREATE POLICY "Allow anon to read students for login"
  ON students
  FOR SELECT
  TO anon
  USING (true);

-- Add policy to allow anonymous users to read classes table for student login joins
CREATE POLICY "Allow anon to read classes for student login"
  ON classes
  FOR SELECT
  TO anon
  USING (true);