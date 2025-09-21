@@ .. @@
   initializeAttendance: async (periodId: string, classId: string) => {
     set({ isLoading: true, error: null });
     try {
       const today = new Date().toISOString().split('T')[0];
       
-      // Check if attendance is already submitted for today only
+      // Check if attendance is already submitted for this specific date
       const isSubmitted = await get().checkDailySubmissionStatus(periodId);
 
       if (isSubmitted) {
         set({ isSubmitted: true });
+        // Load existing records for today only
         const { data: existingRecords } = await supabase
           .from('attendance_records')
           .select('*')
           .eq('period_id', periodId)
           .eq('date', today);
 
         if (existingRecords) {
           set({ records: existingRecords });
         }
         return;
       }
 
-      // Not submitted today, so we can take attendance
+      // Not submitted for today, initialize new attendance session
       set({ isSubmitted: false });
 
+      // Check if draft records exist for today
       const { data: existingRecords } = await supabase
         .from('attendance_records')
         .select('*')
         .eq('period_id', periodId)
         .eq('date', today);
 
       if (existingRecords && existingRecords.length > 0) {
-        // Records exist for today but not submitted yet (draft state)
+        // Draft records exist for today, load them
         set({ records: existingRecords, currentRecord: existingRecords[0] });
       } else {
-        // Create new draft records for today only
+        // Create new draft records for today
         const { data: students } = await supabase
           .from('students')
           .select('*')
           .eq('class_id', classId);
 
         if (students) {
           const newRecords = students.map(student => ({
             id: crypto.randomUUID(),
             period_id: periodId,
             student_id: student.id,
             date: today,
             status: 'present' as const
           }));
 
           set({ records: newRecords });
         }
       }
     } catch (error) {
+      console.error('Error initializing attendance:', error);
       set({ error: 'Failed to initialize attendance' });
     } finally {
       set({ isLoading: false });
     }
   },

@@ .. @@
   submitAttendance: async () => {
     const { records, isSubmitted } = get();
     if (isSubmitted) return false;
 
     set({ isLoading: true, error: null });
 
     try {
-      // Insert/update attendance records for today
+      // Insert attendance records for the specific date
+      // Use upsert to handle any existing draft records
       const { error } = await supabase
         .from('attendance_records')
         .upsert(records);
 
       if (error) throw error;
       
-      // Save to attendance history for permanent storage
+      // Also save to attendance history for permanent archival
       const { error: historyError } = await supabase
         .from('attendance_history')
         .upsert(records.map(record => ({
           ...record,
-          id: crypto.randomUUID()
+          id: crypto.randomUUID() // Generate new ID for history table
         })));
 
       if (historyError) {
         console.warn('Failed to save to attendance history:', historyError);
       }
       
       set({ isSubmitted: true });
       return true;
     } catch (error) {
+      console.error('Error submitting attendance:', error);
       set({ error: 'Failed to save attendance' });
       return false;
     } finally {
       set({ isLoading: false });
     }
   },

@@ .. @@
   getStudentStats: async (studentId: string, facultyId: string) => {
     try {
-      // Get all attendance records from both current and history tables
+      // Get all attendance records from both tables for complete history
       const [currentRecords, historyRecords] = await Promise.all([
         supabase
           .from('attendance_records')
           .select(`
             *,
             periods!inner(*)
           `)
           .eq('student_id', studentId)
           .eq('periods.faculty_id', facultyId),
         supabase
           .from('attendance_history')
           .select(`
             *,
             periods!inner(*)
           `)
           .eq('student_id', studentId)
           .eq('periods.faculty_id', facultyId)
       ]);
 
-      // Combine all records and remove duplicates by date and period
+      // Combine records and remove duplicates based on date + period combination
       const allRecords = [...(currentRecords.data || []), ...(historyRecords.data || [])];
       const uniqueRecords = allRecords.filter((record, index, self) => 
         index === self.findIndex(r => r.date === record.date && r.period_id === record.period_id)
       );
 
       if (!uniqueRecords.length) return { total_classes: 0, present_count: 0, percentage: 0 };
 
       const total_classes = uniqueRecords.length;
       const present_count = uniqueRecords.filter(r => r.status === 'present' || r.status === 'on_duty').length;
       const percentage = total_classes > 0 ? (present_count / total_classes) * 100 : 0;
 
       const stats = { total_classes, present_count, percentage };
+      
+      // Cache the stats
       set(state => ({
         stats: { ...state.stats, [studentId]: stats }
       }));
 
       return stats;
     } catch (error) {
       console.error('Error fetching stats:', error);
       return { total_classes: 0, present_count: 0, percentage: 0 };
     }
   },