import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
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
      // Check if password matches the default password
      if (password !== 'Student@123') {
        throw new Error('Invalid password. Use Student@123');
      }
      
      // Find student by roll number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          class:classes (
            id,
            code,
            name
          )
        `)
        .eq('roll_number', rollNumber)
        .single();

      if (studentError || !studentData) {
        throw new Error('Invalid roll number or student not found');
      }

      const student: Student = {
        id: studentData.id,
        roll_number: studentData.roll_number,
        name: studentData.name,
        class: studentData.class
      };

      set({
        student,
        isAuthenticated: true,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false
      });
      return false;
    }
  },
  
  logout: async () => {
    set({
      student: null,
      isAuthenticated: false
    });
  },
  
  initAuth: async () => {
    // For student auth, we don't persist sessions in this demo
    // In production, you'd want to implement proper session management
  }
}));