import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
}

interface AuthState {
  faculty: Faculty | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  faculty: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (facultyError) throw facultyError;
        if (!facultyData) throw new Error('Faculty record not found');

        set({
          faculty: facultyData,
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
        faculty: null,
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
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (facultyData) {
          set({
            faculty: facultyData,
            isAuthenticated: true
          });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }
}));