import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Student {
  id: string;
  roll_number: string;
  name: string;
  class_id: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  period_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'on_duty';
}

export interface AttendanceStats {
  total_classes: number;
  present_count: number;
  percentage: number;
}

interface AttendanceState {
  records: AttendanceRecord[];
  currentRecord: AttendanceRecord | null;
  isLoading: boolean;
  error: string | null;
  stats: Record<string, AttendanceStats>;
  isSubmitted: boolean;
  initializeAttendance: (periodId: string, classId: string) => Promise<void>;
  markAttendance: (studentId: string, status: 'present' | 'absent' | 'on_duty') => Promise<void>;
  submitAttendance: () => Promise<boolean>;
  getStudentStats: (studentId: string, facultyId: string) => Promise<AttendanceStats>;
  fetchStudentsByClass: (classCode: string) => Promise<Student[]>;
  getClassId: (classCode: string) => Promise<string | null>;
  checkSubmissionStatus: (periodId: string) => Promise<boolean>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  currentRecord: null,
  isLoading: false,
  error: null,
  stats: {},
  isSubmitted: false,

  getClassId: async (classCode: string) => {
    try {
      const { data: classData } = await supabase
        .from('classes')
        .select('id')
        .eq('code', classCode)
        .single();

      return classData?.id || null;
    } catch (error) {
      console.error('Error fetching class ID:', error);
      return null;
    }
  },

  checkSubmissionStatus: async (periodId: string) => {
    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const { data } = await supabase
        .from('attendance_records')
        .select('date')
        .eq('period_id', periodId)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', today.toISOString().split('T')[0])
        .limit(1);

      const isSubmitted = data && data.length > 0;
      set({ isSubmitted });
      return isSubmitted;
    } catch (error) {
      console.error('Error checking submission status:', error);
      return false;
    }
  },

  initializeAttendance: async (periodId: string, classId: string) => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if attendance was already submitted this week
      const isSubmitted = await get().checkSubmissionStatus(periodId);
      set({ isSubmitted });

      // Check existing records
      const { data: existingRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('period_id', periodId)
        .eq('date', today);

      if (existingRecords && existingRecords.length > 0) {
        set({ records: existingRecords, currentRecord: existingRecords[0] });
      } else {
        // Get students for this class
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId);

        if (students) {
          const newRecords = students.map(student => ({
            period_id: periodId,
            student_id: student.id,
            date: today,
            status: 'present' as const
          }));

          set({ records: newRecords });
        }
      }
    } catch (error) {
      set({ error: 'Failed to initialize attendance' });
    } finally {
      set({ isLoading: false });
    }
  },

  markAttendance: async (studentId: string, status: 'present' | 'absent' | 'on_duty') => {
    const { records, isSubmitted } = get();
    if (isSubmitted) return;

    const updatedRecords = records.map(record =>
      record.student_id === studentId ? { ...record, status } : record
    );
    set({ records: updatedRecords });
  },

  submitAttendance: async () => {
    const { records, isSubmitted } = get();
    if (isSubmitted) return false;

    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert(records);

      if (error) throw error;
      set({ isSubmitted: true });
      return true;
    } catch (error) {
      set({ error: 'Failed to save attendance' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  getStudentStats: async (studentId: string, facultyId: string) => {
    try {
      const { data: records } = await supabase
        .from('attendance_records')
        .select(`
          *,
          periods!inner(*)
        `)
        .eq('student_id', studentId)
        .eq('periods.faculty_id', facultyId);

      if (!records) return { total_classes: 0, present_count: 0, percentage: 0 };

      const total_classes = records.length;
      const present_count = records.filter(r => r.status === 'present' || r.status === 'on_duty').length;
      const percentage = total_classes > 0 ? (present_count / total_classes) * 100 : 0;

      const stats = { total_classes, present_count, percentage };
      set(state => ({
        stats: { ...state.stats, [studentId]: stats }
      }));

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total_classes: 0, present_count: 0, percentage: 0 };
    }
  },

  fetchStudentsByClass: async (classCode: string) => {
    try {
      const classId = await get().getClassId(classCode);
      if (!classId) {
        throw new Error('Class not found');
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('roll_number');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }
}));