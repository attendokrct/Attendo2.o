import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email?: string;
  class?: {
    id: string;
    code: string;
    name: string;
  };
}

interface StudentAuthState {
  student: Student | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (rollNumber: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useStudentAuthStore = create<StudentAuthState>((set) => ({
  student: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (rollNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate input
      if (!rollNumber || !password) {
        throw new Error('Please enter both roll number and password');
      }

      // Find student by roll number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          classes!inner (
            id,
            code,
            name
          )
        `)
        .eq('roll_number', rollNumber)
        .single();

      if (studentError || !studentData) {
        if (studentError?.code === 'PGRST116') {
          throw new Error(`Student with roll number "${rollNumber}" not found. Please contact your administrator to add your record to the system.`);
        }
        throw new Error('Error finding student. Please try again.');
      }

      // Check if password matches the default password
      if (password !== 'Student@123') {
        throw new Error('Invalid password. Please use: Student@123');
      }

      const student: Student = {
        id: studentData.id,
        roll_number: studentData.roll_number,
        name: studentData.name,
        email: studentData.email,
        class: studentData.classes
      };

      set({
        student,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error('Student login error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false,
        isAuthenticated: false,
        student: null
      });
      return false;
    }
  },
  
  logout: async () => {
    set({
      student: null,
      isAuthenticated: false,
      error: null
    });
  },
  
  initAuth: async () => {
    // Initialize with clean state
    set({
      student: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }
}));