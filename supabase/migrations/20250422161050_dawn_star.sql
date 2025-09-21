/*
  # Add Faculty Authentication Data

  1. New Data
    - Add 5 faculty members to auth.users
    - Link auth users to faculty table
*/

-- Create 5 faculty members in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES
  -- Faculty 1: Dr. Rajesh Kumar
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'faculty@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Rajesh Kumar"}',
    'authenticated',
    'authenticated'
  ),
  -- Faculty 2: Dr. Priya Sharma
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'priya@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Priya Sharma"}',
    'authenticated',
    'authenticated'
  ),
  -- Faculty 3: Prof. Anil Gupta
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'anil@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Prof. Anil Gupta"}',
    'authenticated',
    'authenticated'
  ),
  -- Faculty 4: Dr. Meera Patel
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'meera@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Meera Patel"}',
    'authenticated',
    'authenticated'
  ),
  -- Faculty 5: Prof. Suresh Reddy
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'suresh@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Prof. Suresh Reddy"}',
    'authenticated',
    'authenticated'
  );

-- Add new faculty members to faculty table
INSERT INTO faculty (id, name, email, designation, department) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Dr. Meera Patel', 'meera@example.com', 'Associate Professor', 'Department of Mathematics'),
  ('00000000-0000-0000-0000-000000000005', 'Prof. Suresh Reddy', 'suresh@example.com', 'Professor', 'Department of Chemistry');

-- Add periods for new faculty members
-- For faculty4 (Dr. Meera Patel)
INSERT INTO periods (faculty_id, class_id, name, time_slot)
SELECT 
  '00000000-0000-0000-0000-000000000004',
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
WHERE code IN ('CSE-A', 'CSE-B', 'ECE-A', 'ECE-B', 'MECH', 'CIVIL', 'IT')
ORDER BY code;

-- For faculty5 (Prof. Suresh Reddy)
INSERT INTO periods (faculty_id, class_id, name, time_slot)
SELECT 
  '00000000-0000-0000-0000-000000000005',
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
WHERE code IN ('AIDS-A', 'AIDS-B', 'AIML', 'CSE-C', 'IT', 'EEE', 'MECH')
ORDER BY code;