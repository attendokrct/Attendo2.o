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

      // Demo student data (for demo purposes without backend)
      const demoStudents: Record<string, Student> = {
        'AM2442': {
          id: 'demo-student-1',
          roll_number: 'AM2442',
          name: 'Amudeshwar H',
          email: 'am2442@student.krct.ac.in',
          class_id: 'demo-class-1',
          class: {
            id: 'demo-class-1',
            code: 'IT',
            name: 'Information Technology'
          }
        },
        '2I2442': {
          id: 'demo-student-2',
          roll_number: '2I2442',
          name: 'Test Student 2I',
          email: '2i2442@student.krct.ac.in',
          class_id: 'demo-class-2',
          class: {
            id: 'demo-class-2',
            code: 'CSE-A',
            name: 'Computer Science Engineering - Section A'
          }
        }
      };

      const student = demoStudents[rollNumber.toUpperCase()];
      
      if (!student) {
        throw new Error(`Student with roll number "${rollNumber}" not found. Available demo accounts: AM2442, 2I2442`);
      }

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