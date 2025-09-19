import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'on_duty';
  period: {
    id: string;
    name: string;
    time_slot: string;
    weekday: string;
    faculty: {
      id: string;
      name: string;
      designation: string;
      department: string;
    };
  };
}

export interface SubjectAttendance {
  facultyId: string;
  facultyName: string;
  facultyDesignation: string;
  facultyDepartment: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  onDutyCount: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface AttendanceAnalytics {
  overallPercentage: number;
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  totalOnDuty: number;
  subjectWise: SubjectAttendance[];
  recentRecords: AttendanceRecord[];
}

interface StudentAttendanceState {
  analytics: AttendanceAnalytics | null;
  isLoading: boolean;
  error: string | null;
  fetchStudentAttendance: (studentId: string) => Promise<void>;
  clearData: () => void;
}

export const useStudentAttendanceStore = create<StudentAttendanceState>((set, get) => ({
  analytics: null,
  isLoading: false,
  error: null,

  clearData: () => {
    set({ analytics: null, error: null });
  },

  fetchStudentAttendance: async (studentId: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('Fetching attendance for student ID:', studentId);
      
      // First, let's check if the student exists
      const { data: studentCheck, error: studentError } = await supabase
        .from('students')
        .select('id, roll_number, name')
        .eq('id', studentId)
        .single();

      console.log('Student check:', { studentCheck, studentError });

      if (studentError || !studentCheck) {
        throw new Error('Student not found');
      }

      // Fetch attendance records from both tables with proper joins
      console.log('Fetching attendance records...');
      
      const { data: currentRecords, error: currentError } = await supabase
        .from('attendance_records')
        .select(`
          id,
          date,
          status,
          period_id,
          periods!inner (
            id,
            name,
            time_slot,
            weekday,
            faculty_id,
            faculty!inner (
              id,
              name,
              designation,
              department
            )
          )
        `)
        .eq('student_id', studentId);

      console.log('Current records query result:', { 
        data: currentRecords?.length || 0, 
        error: currentError 
      });

      const { data: historyRecords, error: historyError } = await supabase
        .from('attendance_history')
        .select(`
          id,
          date,
          status,
          period_id,
          periods!inner (
            id,
            name,
            time_slot,
            weekday,
            faculty_id,
            faculty!inner (
              id,
              name,
              designation,
              department
            )
          )
        `)
        .eq('student_id', studentId);

      console.log('History records query result:', { 
        data: historyRecords?.length || 0, 
        error: historyError 
      });

      if (currentError) {
        console.error('Current records error:', currentError);
      }
      if (historyError) {
        console.error('History records error:', historyError);
      }

      // Combine records (handle potential null values)
      const allRecords = [
        ...(currentRecords || []),
        ...(historyRecords || [])
      ];

      console.log('Combined records count:', allRecords.length);

      if (allRecords.length === 0) {
        console.log('No attendance records found for student');
        set({ 
          analytics: {
            overallPercentage: 0,
            totalClasses: 0,
            totalPresent: 0,
            totalAbsent: 0,
            totalOnDuty: 0,
            subjectWise: [],
            recentRecords: []
          },
          isLoading: false 
        });
        return;
      }

      // Transform and validate records
      const validRecords = allRecords.filter(record => {
        const isValid = record && 
                       record.periods && 
                       record.periods.faculty && 
                       record.date && 
                       record.status;
        if (!isValid) {
          console.warn('Invalid record found:', record);
        }
        return isValid;
      });

      console.log('Valid records after filtering:', validRecords.length);

      // Remove duplicates based on date and period_id
      const uniqueRecords = validRecords.filter((record, index, self) => 
        index === self.findIndex(r => 
          r.date === record.date && 
          r.period_id === record.period_id
        )
      );

      console.log('Unique records after deduplication:', uniqueRecords.length);

      // Transform data structure
      const records: AttendanceRecord[] = uniqueRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        period: {
          id: record.periods.id,
          name: record.periods.name,
          time_slot: record.periods.time_slot,
          weekday: record.periods.weekday,
          faculty: {
            id: record.periods.faculty.id,
            name: record.periods.faculty.name,
            designation: record.periods.faculty.designation,
            department: record.periods.faculty.department
          }
        }
      }));

      console.log('Transformed records:', records.length);

      // Calculate overall statistics
      const totalClasses = records.length;
      const totalPresent = records.filter(r => r.status === 'present').length;
      const totalAbsent = records.filter(r => r.status === 'absent').length;
      const totalOnDuty = records.filter(r => r.status === 'on_duty').length;
      const overallPercentage = totalClasses > 0 ? ((totalPresent + totalOnDuty) / totalClasses) * 100 : 0;

      console.log('Overall statistics:', {
        totalClasses,
        totalPresent,
        totalAbsent,
        totalOnDuty,
        overallPercentage: overallPercentage.toFixed(1) + '%'
      });

      // Group by faculty for subject-wise analysis
      const facultyGroups = new Map<string, AttendanceRecord[]>();
      records.forEach(record => {
        const facultyId = record.period.faculty.id;
        if (!facultyGroups.has(facultyId)) {
          facultyGroups.set(facultyId, []);
        }
        facultyGroups.get(facultyId)!.push(record);
      });

      console.log('Faculty groups:', facultyGroups.size);

      // Calculate subject-wise attendance
      const subjectWise: SubjectAttendance[] = Array.from(facultyGroups.entries()).map(([facultyId, facultyRecords]) => {
        const faculty = facultyRecords[0].period.faculty;
        const totalClasses = facultyRecords.length;
        const presentCount = facultyRecords.filter(r => r.status === 'present').length;
        const absentCount = facultyRecords.filter(r => r.status === 'absent').length;
        const onDutyCount = facultyRecords.filter(r => r.status === 'on_duty').length;
        const percentage = totalClasses > 0 ? ((presentCount + onDutyCount) / totalClasses) * 100 : 0;

        return {
          facultyId,
          facultyName: faculty.name,
          facultyDesignation: faculty.designation,
          facultyDepartment: faculty.department,
          totalClasses,
          presentCount,
          absentCount,
          onDutyCount,
          percentage,
          records: facultyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      }).sort((a, b) => b.percentage - a.percentage);

      console.log('Subject-wise attendance:', subjectWise.map(s => ({
        faculty: s.facultyName,
        percentage: s.percentage.toFixed(1) + '%',
        classes: `${s.presentCount + s.onDutyCount}/${s.totalClasses}`
      })));

      // Prepare final analytics
      const analytics: AttendanceAnalytics = {
        overallPercentage,
        totalClasses,
        totalPresent,
        totalAbsent,
        totalOnDuty,
        subjectWise,
        recentRecords: records
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
      }

      // Combine and deduplicate records
      const allRecords = [...(currentRecords.data || []), ...(historyRecords.data || [])];
      console.log('Combined records:', allRecords.length);
      
      // Remove duplicates based on date and period_id
      const uniqueRecords = allRecords.filter((record, index, self) => 
        index === self.findIndex(r => 
          r.date === record.date && 
          r.period?.id === record.period?.id
        )
      );

      console.log('Unique records after deduplication:', uniqueRecords.length);

      // Transform data
      const records: AttendanceRecord[] = uniqueRecords
        .filter(record => record.period && record.period.faculty) // Filter out invalid records
        .map(record => ({
          id: record.id,
          date: record.date,
          status: record.status,
          period: {
            id: record.period.id,
            name: record.period.name,
            time_slot: record.period.time_slot,
            weekday: record.period.weekday,
            faculty: {
              id: record.period.faculty.id,
              name: record.period.faculty.name,
              designation: record.period.faculty.designation,
              department: record.period.faculty.department
            }
          }
        }));

      console.log('Transformed records:', records.length);

      // Calculate overall statistics
      const totalClasses = records.length;
      const totalPresent = records.filter(r => r.status === 'present').length;
      const totalAbsent = records.filter(r => r.status === 'absent').length;
      const totalOnDuty = records.filter(r => r.status === 'on_duty').length;
      const overallPercentage = totalClasses > 0 ? ((totalPresent + totalOnDuty) / totalClasses) * 100 : 0;

      console.log('Overall stats:', { totalClasses, totalPresent, totalAbsent, totalOnDuty, overallPercentage });

      // Calculate subject-wise attendance
      const facultyMap = new Map<string, AttendanceRecord[]>();
      records.forEach(record => {
        const facultyId = record.period.faculty.id;
        if (!facultyMap.has(facultyId)) {
          facultyMap.set(facultyId, []);
        }
        facultyMap.get(facultyId)!.push(record);
      });

      const subjectWise: SubjectAttendance[] = Array.from(facultyMap.entries()).map(([facultyId, facultyRecords]) => {
        const faculty = facultyRecords[0].period.faculty;
        const totalClasses = facultyRecords.length;
        const presentCount = facultyRecords.filter(r => r.status === 'present').length;
        const absentCount = facultyRecords.filter(r => r.status === 'absent').length;
        const onDutyCount = facultyRecords.filter(r => r.status === 'on_duty').length;
        const percentage = totalClasses > 0 ? ((presentCount + onDutyCount) / totalClasses) * 100 : 0;

        return {
          facultyId,
          facultyName: faculty.name,
          facultyDesignation: faculty.designation,
          facultyDepartment: faculty.department,
          totalClasses,
          presentCount,
          absentCount,
          onDutyCount,
          percentage,
          records: facultyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        };
      }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

      console.log('Subject-wise attendance:', subjectWise);

      const analytics: AttendanceAnalytics = {
        overallPercentage,
        totalClasses,
        totalPresent,
        totalAbsent,
        totalOnDuty,
        subjectWise,
        recentRecords: records.slice(0, 10) // Last 10 records
      };

      console.log('Final analytics:', analytics);
      set({ analytics, isLoading: false });

    } catch (error) {
      console.error('Error fetching student attendance:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch attendance data',
        isLoading: false 
      });
    }
  }
}));