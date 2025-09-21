/*
  # Populate initial data for classes and students

  1. New Data
    - Insert sample classes (CSE-A, CSE-B, IT-A, IT-B, ECE-A)
    - Insert sample students with roll numbers and class assignments
  
  2. Security
    - Data is inserted with proper foreign key relationships
    - Students are linked to their respective classes
*/

-- Insert sample classes
INSERT INTO classes (code, name, student_count) VALUES
('CSE-A', 'Computer Science Engineering - Section A', 40),
('CSE-B', 'Computer Science Engineering - Section B', 40),
('IT-A', 'Information Technology - Section A', 40),
('IT-B', 'Information Technology - Section B', 40),
('ECE-A', 'Electronics and Communication Engineering - Section A', 40)
ON CONFLICT (code) DO NOTHING;

-- Insert sample students for CSE-A
INSERT INTO students (roll_number, name, class_id, email, parent_phone) 
SELECT 
  'CSE-A-' || LPAD(generate_series::text, 3, '0'),
  'Student ' || generate_series,
  (SELECT id FROM classes WHERE code = 'CSE-A'),
  'student' || generate_series || '@college.edu',
  '+91' || (9000000000 + generate_series)::text
FROM generate_series(1, 40)
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample students for CSE-B
INSERT INTO students (roll_number, name, class_id, email, parent_phone) 
SELECT 
  'CSE-B-' || LPAD(generate_series::text, 3, '0'),
  'Student ' || (generate_series + 40),
  (SELECT id FROM classes WHERE code = 'CSE-B'),
  'student' || (generate_series + 40) || '@college.edu',
  '+91' || (9000000040 + generate_series)::text
FROM generate_series(1, 40)
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample students for IT-A
INSERT INTO students (roll_number, name, class_id, email, parent_phone) 
SELECT 
  'IT-A-' || LPAD(generate_series::text, 3, '0'),
  'Student ' || (generate_series + 80),
  (SELECT id FROM classes WHERE code = 'IT-A'),
  'student' || (generate_series + 80) || '@college.edu',
  '+91' || (9000000080 + generate_series)::text
FROM generate_series(1, 40)
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample students for IT-B
INSERT INTO students (roll_number, name, class_id, email, parent_phone) 
SELECT 
  'IT-B-' || LPAD(generate_series::text, 3, '0'),
  'Student ' || (generate_series + 120),
  (SELECT id FROM classes WHERE code = 'IT-B'),
  'student' || (generate_series + 120) || '@college.edu',
  '+91' || (9000000120 + generate_series)::text
FROM generate_series(1, 40)
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample students for ECE-A
INSERT INTO students (roll_number, name, class_id, email, parent_phone) 
SELECT 
  'ECE-A-' || LPAD(generate_series::text, 3, '0'),
  'Student ' || (generate_series + 160),
  (SELECT id FROM classes WHERE code = 'ECE-A'),
  'student' || (generate_series + 160) || '@college.edu',
  '+91' || (9000000160 + generate_series)::text
FROM generate_series(1, 40)
ON CONFLICT (roll_number) DO NOTHING;

-- Insert some specific test students with known roll numbers
INSERT INTO students (roll_number, name, class_id, email, parent_phone) VALUES
('AM2442', 'Test Student AM', (SELECT id FROM classes WHERE code = 'CSE-A'), 'am2442@college.edu', '+919876543210'),
('2I2442', 'Test Student 2I', (SELECT id FROM classes WHERE code = 'IT-A'), '2i2442@college.edu', '+919876543211')
ON CONFLICT (roll_number) DO NOTHING;