'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  showLoginSuccessModal: boolean;
  setShowLoginSuccessModal: (show: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  showLoginSuccessModal: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // 브라우저에서만 실행
      if (typeof window === 'undefined') {
        set({ isLoading: false });
        return;
      }
      
      // 현재 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        set({
          user: session.user as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }

      // 인증 상태 변화 감지
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          set({
            user: session.user as User,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setShowLoginSuccessModal: (showLoginSuccessModal) => set({ showLoginSuccessModal }),
}));
