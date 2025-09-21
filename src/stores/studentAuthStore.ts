import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string;
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useStudentAuthStore = create<StudentAuthState>((set) => ({
  student: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // For demo purposes, we'll use a simple email/password check
      // In production, you'd want proper authentication
      
      // Extract roll number from email (assuming format: rollnumber@student.krct.ac.in)
      const rollNumber = email.split('@')[0].toUpperCase();
      
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
        throw new Error('Invalid email or student not found');
      }

      // For demo, accept any password that's at least 6 characters
      if (password.length < 6) {
        throw new Error('Invalid password');
      }

      const student: Student = {
        id: studentData.id,
        roll_number: studentData.roll_number,
        name: studentData.name,
        email: email,
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