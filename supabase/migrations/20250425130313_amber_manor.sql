/*
  # Add RLS policies for periods table

  1. Security Changes
    - Add INSERT policy for authenticated faculty to create their own periods
    - Add DELETE policy for authenticated faculty to remove their own periods
    - Add UPDATE policy for authenticated faculty to modify their own periods

  Note: The SELECT policy already exists from a previous migration
*/

-- Policy to allow faculty to insert their own periods
CREATE POLICY "Faculty can insert own periods"
ON periods
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = faculty_id);

-- Policy to allow faculty to delete their own periods
CREATE POLICY "Faculty can delete own periods"
ON periods
FOR DELETE
TO authenticated
USING (auth.uid() = faculty_id);

-- Policy to allow faculty to update their own periods
CREATE POLICY "Faculty can update own periods"
ON periods
FOR UPDATE
TO authenticated
USING (auth.uid() = faculty_id)
WITH CHECK (auth.uid() = faculty_id);