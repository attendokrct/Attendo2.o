/*
  # Initial Schema Setup for College Attendance System

  1. New Tables
    - `faculty`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `designation` (text)
      - `department` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `classes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `name` (text)
      - `student_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `students`
      - `id` (uuid, primary key)
      - `roll_number` (text, unique)
      - `name` (text)
      - `class_id` (uuid, references classes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `periods`
      - `id` (uuid, primary key)
      - `faculty_id` (uuid, references faculty)
      - `class_id` (uuid, references classes)
      - `name` (text)
      - `time_slot` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `attendance_records`
      - `id` (uuid, primary key)
      - `period_id` (uuid, references periods)
      - `student_id` (uuid, references students)
      - `date` (date)
      - `status` (text, check constraint: 'present' or 'absent')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create faculty table
CREATE TABLE faculty (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  student_count integer NOT NULL DEFAULT 40,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_number text UNIQUE NOT NULL,
  name text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create periods table
CREATE TABLE periods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id uuid REFERENCES faculty(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  time_slot text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_id uuid REFERENCES periods(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow faculty to read own data"
  ON faculty
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow faculty to read all classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow faculty to read all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow faculty to read assigned periods"
  ON periods
  FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Allow faculty to manage attendance records"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM periods
      WHERE periods.id = attendance_records.period_id
      AND periods.faculty_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_faculty_updated_at
  BEFORE UPDATE ON faculty
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_periods_updated_at
  BEFORE UPDATE ON periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();