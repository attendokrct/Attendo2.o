/*
  # Add weekday support and sample students

  1. Changes
    - Add weekday column to periods table
    - Add sample students for each class
    - Update period data with weekday information

  2. New Data
    - Sample students for each class
    - Updated period schedules for faculty
*/

-- Add weekday column to periods table
ALTER TABLE periods ADD COLUMN weekday text NOT NULL DEFAULT 'Monday' CHECK (
  weekday IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
);

-- Insert sample students for each class
DO $$
DECLARE
  class_record RECORD;
  student_count INTEGER;
  i INTEGER;
  roll_number TEXT;
  student_name TEXT;
  class_prefix TEXT;
BEGIN
  FOR class_record IN SELECT * FROM classes LOOP
    student_count := class_record.student_count;
    class_prefix := class_record.code;
    
    FOR i IN 1..student_count LOOP
      -- Generate roll number (e.g., CSE-A-001)
      roll_number := class_prefix || '-' || LPAD(i::text, 3, '0');
      
      -- Generate name from common Indian names
      student_name := (
        CASE (i % 20)
          WHEN 0 THEN 'Aarav'
          WHEN 1 THEN 'Aditi'
          WHEN 2 THEN 'Arjun'
          WHEN 3 THEN 'Diya'
          WHEN 4 THEN 'Ishaan'
          WHEN 5 THEN 'Kavya'
          WHEN 6 THEN 'Krishna'
          WHEN 7 THEN 'Neha'
          WHEN 8 THEN 'Pranav'
          WHEN 9 THEN 'Riya'
          WHEN 10 THEN 'Rohan'
          WHEN 11 THEN 'Sanya'
          WHEN 12 THEN 'Vihaan'
          WHEN 13 THEN 'Zara'
          WHEN 14 THEN 'Advait'
          WHEN 15 THEN 'Ananya'
          WHEN 16 THEN 'Dev'
          WHEN 17 THEN 'Ishita'
          WHEN 18 THEN 'Kabir'
          WHEN 19 THEN 'Myra'
        END
      ) || ' ' || (
        CASE (i % 10)
          WHEN 0 THEN 'Sharma'
          WHEN 1 THEN 'Patel'
          WHEN 2 THEN 'Kumar'
          WHEN 3 THEN 'Singh'
          WHEN 4 THEN 'Reddy'
          WHEN 5 THEN 'Gupta'
          WHEN 6 THEN 'Iyer'
          WHEN 7 THEN 'Shah'
          WHEN 8 THEN 'Mehta'
          WHEN 9 THEN 'Verma'
        END
      );
      
      -- Insert student
      INSERT INTO students (roll_number, name, class_id)
      VALUES (roll_number, student_name, class_record.id);
    END LOOP;
  END LOOP;
END $$;

-- Clear existing periods
DELETE FROM periods;

-- Insert updated periods with weekdays for faculty
DO $$
DECLARE
  faculty_record RECORD;
  class_record RECORD;
  weekdays text[] := ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  time_slots text[] := ARRAY[
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '1:30 PM - 2:30 PM',
    '2:30 PM - 3:30 PM',
    '3:45 PM - 4:45 PM'
  ];
  current_weekday text;
  current_slot text;
  slot_index integer;
BEGIN
  FOR faculty_record IN SELECT * FROM faculty LOOP
    -- For each weekday
    FOR weekday_index IN 1..array_length(weekdays, 1) LOOP
      current_weekday := weekdays[weekday_index];
      slot_index := 1;
      
      -- Assign 6 periods per day
      FOR class_record IN 
        SELECT * FROM classes 
        ORDER BY random() 
        LIMIT 6
      LOOP
        current_slot := time_slots[slot_index];
        
        INSERT INTO periods (
          faculty_id,
          class_id,
          name,
          time_slot,
          weekday
        ) VALUES (
          faculty_record.id,
          class_record.id,
          'Period ' || slot_index,
          current_slot,
          current_weekday
        );
        
        slot_index := slot_index + 1;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;