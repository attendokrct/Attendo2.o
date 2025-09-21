/*
  # Seed Data for College Attendance System

  1. Initial Data
    - Faculty members
    - Classes
    - Students
    - Periods
*/

-- Insert faculty data
INSERT INTO faculty (id, name, email, designation, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Rajesh Kumar', 'faculty@example.com', 'Assistant Professor', 'Department of Physics'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Priya Sharma', 'priya@example.com', 'Associate Professor', 'Department of Computer Science'),
  ('00000000-0000-0000-0000-000000000003', 'Prof. Anil Gupta', 'anil@example.com', 'Professor', 'Department of Electronics');

-- Insert classes
INSERT INTO classes (id, code, name, student_count) VALUES
  ('00000000-0000-0000-0000-000000000101', 'MECH', 'Mechanical', 60),
  ('00000000-0000-0000-0000-000000000102', 'CIVIL', 'Civil', 55),
  ('00000000-0000-0000-0000-000000000103', 'EEE', 'Electrical & Electronics', 50),
  ('00000000-0000-0000-0000-000000000104', 'ECE-A', 'ECE A', 65),
  ('00000000-0000-0000-0000-000000000105', 'ECE-B', 'ECE B', 65),
  ('00000000-0000-0000-0000-000000000106', 'IT', 'Information Technology', 60),
  ('00000000-0000-0000-0000-000000000107', 'AIDS-A', 'AI & Data Science A', 70),
  ('00000000-0000-0000-0000-000000000108', 'AIDS-B', 'AI & Data Science B', 70),
  ('00000000-0000-0000-0000-000000000109', 'AIML', 'AI & ML', 75),
  ('00000000-0000-0000-0000-000000000110', 'CSE-A', 'CSE A', 65),
  ('00000000-0000-0000-0000-000000000111', 'CSE-B', 'CSE B', 65),
  ('00000000-0000-0000-0000-000000000112', 'CSE-C', 'CSE C', 65);

-- Insert periods for faculty1
INSERT INTO periods (faculty_id, class_id, name, time_slot)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  id,
  'Period ' || row_number() over (),
  CASE row_number() over ()
    WHEN 1 THEN '9:00 AM - 10:00 AM'
    WHEN 2 THEN '10:00 AM - 11:00 AM'
    WHEN 3 THEN '11:15 AM - 12:15 PM'
    WHEN 4 THEN '12:15 PM - 1:15 PM'
    WHEN 5 THEN '2:00 PM - 3:00 PM'
    WHEN 6 THEN '3:00 PM - 4:00 PM'
    WHEN 7 THEN '4:15 PM - 5:15 PM'
  END
FROM classes
WHERE code IN ('CSE-A', 'ECE-A', 'MECH', 'CIVIL', 'IT', 'EEE', 'AIDS-A')
ORDER BY code;

-- Insert periods for faculty2
INSERT INTO periods (faculty_id, class_id, name, time_slot)
SELECT 
  '00000000-0000-0000-0000-000000000002',
  id,
  'Period ' || row_number() over (),
  CASE row_number() over ()
    WHEN 1 THEN '9:00 AM - 10:00 AM'
    WHEN 2 THEN '10:00 AM - 11:00 AM'
    WHEN 3 THEN '11:15 AM - 12:15 PM'
    WHEN 4 THEN '12:15 PM - 1:15 PM'
    WHEN 5 THEN '2:00 PM - 3:00 PM'
    WHEN 6 THEN '3:00 PM - 4:00 PM'
    WHEN 7 THEN '4:15 PM - 5:15 PM'
  END
FROM classes
WHERE code IN ('CSE-B', 'ECE-B', 'AIML', 'CSE-C', 'AIDS-B', 'CSE-A', 'IT')
ORDER BY code;

-- Insert periods for faculty3
INSERT INTO periods (faculty_id, class_id, name, time_slot)
SELECT 
  '00000000-0000-0000-0000-000000000003',
  id,
  'Period ' || row_number() over (),
  CASE row_number() over ()
    WHEN 1 THEN '9:00 AM - 10:00 AM'
    WHEN 2 THEN '10:00 AM - 11:00 AM'
    WHEN 3 THEN '11:15 AM - 12:15 PM'
    WHEN 4 THEN '12:15 PM - 1:15 PM'
    WHEN 5 THEN '2:00 PM - 3:00 PM'
    WHEN 6 THEN '3:00 PM - 4:00 PM'
    WHEN 7 THEN '4:15 PM - 5:15 PM'
  END
FROM classes
WHERE code IN ('ECE-A', 'AIDS-A', 'ECE-B', 'EEE', 'AIDS-B', 'MECH', 'AIML')
ORDER BY code;