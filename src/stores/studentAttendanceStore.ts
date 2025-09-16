import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface StudentAttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'on_duty';
  period: {
    id: string;
    name: string;
    time_slot: string;
    faculty: {
      name: string;
      designation: string;
    };
  };
}

export interface SubjectAttendance {
  facultyName: string;
  facultyDesignation: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  onDutyCount: number;
  percentage: number;
}

export interface AttendanceAnalytics {
  overallPercentage: number;
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  totalOnDuty: number;
  subjectWise: SubjectAttendance[];
  recentRecords: StudentAttendanceRecord[];
  monthlyData: {
    month: string;
    present: number;
    absent: number;
    onDuty: number;
    percentage: number;
  }[];
}

interface StudentAttendanceState {
  analytics: AttendanceAnalytics | null;
  isLoading: boolean;
  error: string | null;
  fetchStudentAttendance: (studentId: string) => Promise<void>;
}

export const useStudentAttendanceStore = create<StudentAttendanceState>((set) => ({
  analytics: null,
  isLoading: false,
  error: null,

  fetchStudentAttendance: async (studentId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Fetch attendance records from both current and history tables
      const [currentRecords, historyRecords] = await Promise.all([
        supabase
          .from('attendance_records')
          .select(`
            id,
            date,
            status,
            periods!inner (
              id,
              name,
              time_slot,
              faculty!inner (
                name,
                designation
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
            periods!inner (
              id,
              name,
              time_slot,
              faculty!inner (
                name,
                designation
              )
            )
          `)
          .eq('student_id', studentId)
          .order('date', { ascending: false })
      ]);

      if (currentRecords.error) throw currentRecords.error;
      if (historyRecords.error) throw historyRecords.error;

      // Combine and deduplicate records
      const allRecords = [...(currentRecords.data || []), ...(historyRecords.data || [])];
      const uniqueRecords = allRecords.filter((record, index, self) => 
        index === self.findIndex(r => r.date === record.date && r.periods.id === record.periods.id)
      );

      // Transform data for analytics
      const records: StudentAttendanceRecord[] = uniqueRecords.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        period: {
          id: record.periods.id,
          name: record.periods.name,
          time_slot: record.periods.time_slot,
          faculty: {
            name: record.periods.faculty.name,
            designation: record.periods.faculty.designation
          }
        }
      }));

      // Calculate overall statistics
      const totalClasses = records.length;
      const totalPresent = records.filter(r => r.status === 'present').length;
      const totalAbsent = records.filter(r => r.status === 'absent').length;
      const totalOnDuty = records.filter(r => r.status === 'on_duty').length;
      const overallPercentage = totalClasses > 0 ? ((totalPresent + totalOnDuty) / totalClasses) * 100 : 0;

      // Calculate subject-wise attendance
      const facultyMap = new Map<string, StudentAttendanceRecord[]>();
      records.forEach(record => {
        const key = `${record.period.faculty.name}-${record.period.faculty.designation}`;
        if (!facultyMap.has(key)) {
          facultyMap.set(key, []);
        }
        facultyMap.get(key)!.push(record);
      });

      const subjectWise: SubjectAttendance[] = Array.from(facultyMap.entries()).map(([key, records]) => {
        const [facultyName, facultyDesignation] = key.split('-');
        const totalClasses = records.length;
        const presentCount = records.filter(r => r.status === 'present').length;
        const absentCount = records.filter(r => r.status === 'absent').length;
        const onDutyCount = records.filter(r => r.status === 'on_duty').length;
        const percentage = totalClasses > 0 ? ((presentCount + onDutyCount) / totalClasses) * 100 : 0;

        return {
          facultyName,
          facultyDesignation,
          totalClasses,
          presentCount,
          absentCount,
          onDutyCount,
          percentage
        };
      });

      // Calculate monthly data
      const monthlyMap = new Map<string, StudentAttendanceRecord[]>();
      records.forEach(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, []);
        }
        monthlyMap.get(monthKey)!.push(record);
      });

      const monthlyData = Array.from(monthlyMap.entries())
        .map(([monthKey, records]) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });
          
          const present = records.filter(r => r.status === 'present').length;
          const absent = records.filter(r => r.status === 'absent').length;
          const onDuty = records.filter(r => r.status === 'on_duty').length;
          const total = records.length;
          const percentage = total > 0 ? ((present + onDuty) / total) * 100 : 0;

          return {
            month: monthName,
            present,
            absent,
            onDuty,
            percentage
          };
        })
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6); // Last 6 months

      const analytics: AttendanceAnalytics = {
        overallPercentage,
        totalClasses,
        totalPresent,
        totalAbsent,
        totalOnDuty,
        subjectWise: subjectWise.sort((a, b) => b.percentage - a.percentage),
        recentRecords: records.slice(0, 10), // Last 10 records
        monthlyData
      };

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