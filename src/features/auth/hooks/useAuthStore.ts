'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { User, AuthState } from '../types';

// 비활성 타이머 관련 상수
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10분 (밀리초)

// 전역 변수로 타이머와 이벤트 리스너 관리
let inactivityTimer: NodeJS.Timeout | null = null;
let countdownTimer: NodeJS.Timeout | null = null;
let activityListeners: Array<() => void> = [];
let lastResetTime: number = 0;
let pausedTime: number = 0; // 일시정지된 시간을 누적으로 저장
let isPaused: boolean = false; // 타이머가 일시정지 상태인지 확인

// 타이머 일시정지 함수
const pauseTimer = () => {
  if (isPaused) return;
  
  isPaused = true;
  
  // 현재까지 경과된 시간을 저장
  const currentTime = Date.now();
  const elapsed = currentTime - lastResetTime;
  pausedTime += elapsed;
  
  // 타이머들 정리
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  console.log('타이머 일시정지됨');
};

// 타이머 재개 함수
const resumeTimer = () => {
  if (!isPaused) return;
  
  isPaused = false;
  
  // 일시정지 시점부터 다시 시작
  lastResetTime = Date.now();
  
  const store = useAuthStore.getState();
  if (store.isAuthenticated) {
    // 남은 시간 계산
    const totalElapsed = pausedTime;
    const remaining = Math.max(0, INACTIVITY_TIMEOUT - totalElapsed);
    
    if (remaining > 0) {
      // 남은 시간이 있으면 타이머 재시작
      startTimers(remaining);
    } else {
      // 시간이 모두 경과했으면 로그아웃
      handleLogout();
    }
  }
  
  console.log('타이머 재개됨');
};

// 타이머 시작 함수
const startTimers = (timeout: number) => {
  const store = useAuthStore.getState();
  
  // 카운트다운 타이머 설정
  const updateCountdown = () => {
    const elapsed = Date.now() - lastResetTime + pausedTime;
    const remaining = Math.max(0, Math.floor((INACTIVITY_TIMEOUT - elapsed) / 1000));
    
    store.setTimeUntilLogout(remaining);
    
    if (remaining <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  };
  
  // 즉시 한 번 업데이트
  updateCountdown();
  
  // 1초마다 업데이트
  countdownTimer = setInterval(updateCountdown, 1000);
  
  // 비활성 타이머 설정
  inactivityTimer = setTimeout(handleLogout, timeout);
};

// 로그아웃 처리 함수
const handleLogout = async () => {
  console.log('비활성 타이머 만료 - 자동 로그아웃');
  try {
    const store = useAuthStore.getState();
    
    // 타이머들 정리
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    
    store.setTimeUntilLogout(0);
    await supabase.auth.signOut();
  } catch (error) {
    console.error('자동 로그아웃 실패:', error);
  }
};

// 사용자 활동 감지 이벤트 리스너 설정 함수
const setupActivityListeners = () => {
  if (typeof window === 'undefined') return;

  // 기존 리스너들 정리
  activityListeners.forEach((removeListener) => {
    removeListener();
  });
  activityListeners = [];

  // 감지할 활동 이벤트들 (해당 웹사이트 내에서만)
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  // 스토어에서 resetInactivityTimer 함수를 가져와서 사용
  const resetTimer = () => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated && !isPaused) {
      store.resetInactivityTimer();
    }
  };

  // 각 이벤트에 대해 리스너 등록
  events.forEach((eventName) => {
    const handleActivity = () => {
      resetTimer();
    };

    document.addEventListener(eventName, handleActivity, { passive: true });
    
    // 정리 함수를 배열에 저장
    activityListeners.push(() => {
      document.removeEventListener(eventName, handleActivity);
    });
  });

  // 페이지 visibility 이벤트 처리
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 페이지가 숨겨지면 타이머 일시정지
      pauseTimer();
    } else {
      // 페이지가 다시 보이면 타이머 재개
      resumeTimer();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  activityListeners.push(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  // 윈도우 포커스/블러 이벤트 처리 (추가 보안)
  const handleFocus = () => {
    if (isPaused) {
      resumeTimer();
    }
  };

  const handleBlur = () => {
    if (!isPaused) {
      pauseTimer();
    }
  };

  window.addEventListener('focus', handleFocus);
  window.addEventListener('blur', handleBlur);
  
  activityListeners.push(() => {
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
  });

  console.log('사용자 활동 감지 및 페이지 visibility 이벤트 리스너 설정 완료');
};

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  resetInactivityTimer: () => void;
  cleanup: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  showLoginSuccessModal: boolean;
  setShowLoginSuccessModal: (show: boolean) => void;
  // 로그아웃까지 남은 시간 (초 단위)
  timeUntilLogout: number;
  setTimeUntilLogout: (time: number) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  showLoginSuccessModal: false,
  timeUntilLogout: 0,

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
          // 로그인 성공 시 비활성 타이머 시작 및 활동 감지 설정
          get().resetInactivityTimer();
          setupActivityListeners();
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          // 로그아웃 시 타이머 정리
          get().cleanup();
        }
      });

      // 초기 로그인 상태인 경우 비활성 타이머 시작
      if (session?.user) {
        get().resetInactivityTimer();
        // 사용자 활동 감지 이벤트 리스너 설정
        setupActivityListeners();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  resetInactivityTimer: () => {
    const { isAuthenticated } = get();
    
    // 브라우저 환경이 아니거나 로그인되지 않은 경우 타이머 설정하지 않음
    if (typeof window === 'undefined' || !isAuthenticated) {
      return;
    }

    // 페이지가 숨겨진 상태라면 타이머 리셋하지 않음
    if (document.hidden) {
      return;
    }

    // 기존 타이머들 정리
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    // 타이머 상태 초기화
    lastResetTime = Date.now();
    pausedTime = 0;
    isPaused = false;
    
    // 새로운 타이머 시작
    startTimers(INACTIVITY_TIMEOUT);

    console.log('비활성 타이머 재설정됨 (10분)');
  },

  cleanup: () => {
    // 타이머들 정리
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
      console.log('비활성 타이머 정리됨');
    }
    
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      console.log('카운트다운 타이머 정리됨');
    }

    // 타이머 상태 초기화
    lastResetTime = 0;
    pausedTime = 0;
    isPaused = false;

    // 남은 시간 초기화
    set({ timeUntilLogout: 0 });

    // 활동 감지 이벤트 리스너 제거
    if (typeof window !== 'undefined') {
      activityListeners.forEach((removeListener) => {
        removeListener();
      });
      activityListeners = [];
      console.log('사용자 활동 감지 이벤트 리스너 정리됨');
    }
  },

  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setShowLoginSuccessModal: (showLoginSuccessModal) => set({ showLoginSuccessModal }),

  setTimeUntilLogout: (timeUntilLogout) => set({ timeUntilLogout }),
}));
