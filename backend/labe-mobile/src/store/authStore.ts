import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        set({ 
          session, 
          user: { 
            id: session.user.id, 
            name: session.user.user_metadata?.full_name || 'User', 
            email: session.user.email || '',
            phone: session.user.phone
          }, 
          isLoading: false 
        });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ 
          session, 
          user: { 
            id: session.user.id, 
            name: session.user.user_metadata?.full_name || 'User', 
            email: session.user.email || '',
            phone: session.user.phone
          },
          isLoading: false 
        });
      } else {
        set({ session: null, user: null, isLoading: false });
      }
    });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, isLoading: false });
  },
}));
