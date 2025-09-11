   const handleSave = async () => {
     if (!faculty) return;
     setIsSaving(true);
 
     try {
      // Only delete and update timetable data - DO NOT touch attendance records
+      // Only delete and update timetable data - DO NOT touch attendance records
       await supabase
         .from('periods')
         .delete()
         .eq('faculty_id', faculty.id);
 
      // Insert new timetable periods
+      // Insert new timetable periods
       const allPeriods = Object.entries(timetable).flatMap(([weekday, periods]) =>
         periods.map(period => ({
           ...period,
           faculty_id: faculty.id,
           weekday
         }))
       );
 
       if (allPeriods.length === 0) {
         navigate('/dashboard');
         return;
       }
 
      // Insert new timetable data only
       const { error } = await supabase
         .from('periods')
         .insert(allPeriods);
 
       if (error) throw error;
+      
      // Navigate back to dashboard - attendance records remain untouched
       navigate('/dashboard');
     } catch (error) {
       console.error('Error saving timetable:', error);
     } finally {
       setIsSaving(false);
     }
   };