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
      
      // Fetch attendance records from both current and history tables
      const [currentRecords, historyRecords] = await Promise.all([
        supabase
          .from('attendance_records')
          .select(`
            id,
            date,
            status,
            period:periods (
              id,
              name,
              time_slot,
              weekday,
              faculty (
                id,
                name,
                designation,
                department
              )
            )
          `)
          .eq('student_id', studentId)
          .order('date', { ascending: false }),
        
        supabase
          .from('attendance_history')
          .select(`
            id,
            date,
            status,
            period:periods (
              id,
              name,
              time_slot,
              weekday,
              faculty (
                id,
                name,
                designation,
                department
              )
            )
          `)
          .eq('student_id', studentId)
          .order('date', { ascending: false })
      ]);

      console.log('Raw attendance data:', { 
        current: currentRecords.data?.length || 0, 
        history: historyRecords.data?.length || 0,
        currentError: currentRecords.error,
        historyError: historyRecords.error
      });

      if (currentRecords.error) {
        console.error('Current records error:', currentRecords.error);
        throw currentRecords.error;
      }
      if (historyRecords.error) {
        console.error('History records error:', historyRecords.error);
        throw historyRecords.error;
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