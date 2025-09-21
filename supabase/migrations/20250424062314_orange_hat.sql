/*
  # Add Sample Students Data

  1. Changes
    - Add sample students for each class
    - Each student will have:
      - Unique roll number based on class code
      - Name generated from common Indian names
      - Link to their respective class

  2. Data Structure
    - Roll number format: [CLASS-CODE]-[3-DIGIT-NUMBER]
    - Names: Combination of common Indian first and last names
*/

-- Insert sample students for each class
DO $$
DECLARE
  class_record RECORD;
  student_count INTEGER;
  i INTEGER;
  roll_number TEXT;
  student_name TEXT;
  first_names TEXT[] := ARRAY[
    'Aarav', 'Aditi', 'Arjun', 'Diya', 'Ishaan',
    'Kavya', 'Krishna', 'Neha', 'Pranav', 'Riya',
    'Rohan', 'Sanya', 'Vihaan', 'Zara', 'Advait',
    'Ananya', 'Dev', 'Ishita', 'Kabir', 'Myra',
    'Aditya', 'Avni', 'Dhruv', 'Isha', 'Karthik',
    'Lakshya', 'Mira', 'Neel', 'Prisha', 'Reyansh'
  ];
  last_names TEXT[] := ARRAY[
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy',
    'Gupta', 'Iyer', 'Shah', 'Mehta', 'Verma',
    'Rao', 'Malhotra', 'Joshi', 'Kapoor', 'Chopra'
  ];
BEGIN
  -- First, clear existing students
  DELETE FROM students;
  
  -- For each class
  FOR class_record IN SELECT * FROM classes LOOP
    student_count := class_record.student_count;
    
    -- Generate students for this class
    FOR i IN 1..student_count LOOP
      -- Generate roll number (e.g., CSE-A-001)
      roll_number := class_record.code || '-' || LPAD(i::text, 3, '0');
      
      -- Generate random name
      student_name := first_names[1 + (i % array_length(first_names, 1))] || ' ' ||
                     last_names[1 + (i % array_length(last_names, 1))];
      
      -- Insert student
      INSERT INTO students (roll_number, name, class_id)
      VALUES (roll_number, student_name, class_record.id);
    END LOOP;
  END LOOP;
END $$;