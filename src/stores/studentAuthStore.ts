import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  class_id: string;
  parent_phone?: string;
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
      // First, get student data by roll number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_number', rollNumber)
        .single();

      if (studentError) throw new Error('Student not found');

      // Use student email for authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: studentData.email,
        password
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Invalid roll number or password. Please check your credentials.');
        }
        throw authError;
      }

      if (authData.user) {
        set({
          student: studentData,
          isAuthenticated: true,
          isLoading: false
        });
        
        return true;
      }
      
      throw new Error('No user data returned');
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false
      });
      return false;
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({
        student: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
  
  initAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (studentError && studentError.code === 'PGRST116') {
          // No student record found for this email - this is normal for faculty users
          console.log('No student record found for authenticated user');
          return;
        }
        
        if (studentError) {
          console.error('Error fetching student data:', studentError);
          return;
        }

        if (studentData) {
          set({
            student: studentData,
            isAuthenticated: true
          });
        }
      }
    } catch (error) {
      console.error('Error initializing student auth:', error);
    }
  }
}));