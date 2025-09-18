/*
  # Add Sample Attendance Data for Testing

  1. New Data
    - Sample attendance records for students
    - Mix of present, absent, and on_duty statuses
    - Records for different dates and periods

  2. Purpose
    - Provide test data for student dashboard
    - Show realistic attendance patterns
*/

-- Insert sample attendance records for testing
DO $$
DECLARE
  student_record RECORD;
  period_record RECORD;
  attendance_date DATE;
  status_options TEXT[] := ARRAY['present', 'present', 'present', 'absent', 'on_duty']; -- More present than absent
  random_status TEXT;
BEGIN
  -- Generate attendance for the last 30 days
  FOR i IN 0..29 LOOP
    attendance_date := CURRENT_DATE - INTERVAL '1 day' * i;
    
    -- Skip weekends (assuming Saturday = 6, Sunday = 0)
    IF EXTRACT(DOW FROM attendance_date) NOT IN (0, 6) THEN
      
      -- For each student, create some attendance records
      FOR student_record IN 
        SELECT * FROM students 
        WHERE roll_number IN ('AM2442', '2I2442') -- Test students
        LIMIT 2
      LOOP
        
        -- For each period that could have this student
        FOR period_record IN 
          SELECT p.* FROM periods p
          JOIN classes c ON p.class_id = c.id
          WHERE c.id = student_record.class_id
          AND p.weekday = CASE EXTRACT(DOW FROM attendance_date)
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday' 
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END
          LIMIT 3 -- Limit to 3 periods per day
        LOOP
          
          -- Randomly select status (weighted towards present)
          random_status := status_options[1 + (RANDOM() * (array_length(status_options, 1) - 1))::INTEGER];
          
          -- Insert attendance record
          INSERT INTO attendance_records (
            period_id,
            student_id,
            date,
            status
          ) VALUES (
            period_record.id,
            student_record.id,
            attendance_date,
            random_status
          )
          ON CONFLICT (period_id, student_id, date) DO NOTHING;
          
        END LOOP;
      END LOOP;
    END IF;
  END LOOP;
  
  -- Also add some records to attendance_history for older data
  FOR i IN 30..60 LOOP
    attendance_date := CURRENT_DATE - INTERVAL '1 day' * i;
    
    -- Skip weekends
    IF EXTRACT(DOW FROM attendance_date) NOT IN (0, 6) THEN
      
      FOR student_record IN 
        SELECT * FROM students 
        WHERE roll_number IN ('AM2442', '2I2442')
        LIMIT 2
      LOOP
        
        FOR period_record IN 
          SELECT p.* FROM periods p
          JOIN classes c ON p.class_id = c.id
          WHERE c.id = student_record.class_id
          AND p.weekday = CASE EXTRACT(DOW FROM attendance_date)
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday' 
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END
          LIMIT 2 -- Fewer records for history
        LOOP
          
          random_status := status_options[1 + (RANDOM() * (array_length(status_options, 1) - 1))::INTEGER];
          
          INSERT INTO attendance_history (
            id,
            period_id,
            student_id,
            date,
            status
          ) VALUES (
            gen_random_uuid(),
            period_record.id,
            student_record.id,
            attendance_date,
            random_status
          )
          ON CONFLICT (period_id, student_id, date) DO NOTHING;
          
        END LOOP;
      END LOOP;
    END IF;
  END LOOP;
  
END $$;