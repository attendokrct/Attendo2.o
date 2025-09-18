import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email?: string;
  class_id: string;
  class: {
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
  logout: () => void;
  initAuth: () => void;
}

export const useStudentAuthStore = create<StudentAuthState>((set, get) => ({
  student: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (rollNumber: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Attempting student login with roll number:', rollNumber);
      
      // Validate input
      if (!rollNumber || !password) {
        throw new Error('Please enter both roll number and password');
      }

      // Check password (simple validation for demo)
      if (password !== 'Student@123') {
        throw new Error('Invalid password. Use: Student@123');
      }

      // Find student by roll number with class information
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          roll_number,
          name,
          email,
          class_id,
          class:classes (
            id,
            code,
            name
          )
        `)
        .eq('roll_number', rollNumber.toUpperCase())
        .single();

      console.log('Student query result:', { studentData, studentError });

      if (studentError) {
        if (studentError.code === 'PGRST116') {
          throw new Error(`Student with roll number "${rollNumber}" not found. Please contact your administrator.`);
        }
        throw new Error('Error finding student record. Please try again.');
      }

      if (!studentData) {
        throw new Error(`No student found with roll number "${rollNumber}"`);
      }

      const student: Student = {
        id: studentData.id,
        roll_number: studentData.roll_number,
        name: studentData.name,
        email: studentData.email,
        class_id: studentData.class_id,
        class: studentData.class
      };

      console.log('Student login successful:', student);
      
      // Store in localStorage for persistence
      localStorage.setItem('student_auth', JSON.stringify(student));
      
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
  
  logout: () => {
    localStorage.removeItem('student_auth');
    set({
      student: null,
      isAuthenticated: false,
      error: null
    });
  },
  
  initAuth: () => {
    try {
      const storedAuth = localStorage.getItem('student_auth');
      if (storedAuth) {
        const student = JSON.parse(storedAuth);
        set({
          student,
          isAuthenticated: true
        });
      }
    } catch (error) {
      console.error('Error initializing student auth:', error);
      localStorage.removeItem('student_auth');
    }
  }
}));