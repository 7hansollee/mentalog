'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NetworkErrorState {
  isOnline: boolean;
  hasNetworkError: boolean;
  retryAttempts: number;
}

export function useNetworkError() {
  const { toast } = useToast();
  const [state, setState] = useState<NetworkErrorState>({
    isOnline: true,
    hasNetworkError: false,
    retryAttempts: 0,
  });

  useEffect(() => {
    // 네트워크 상태 감지
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true, hasNetworkError: false }));
      if (!state.isOnline) {
        toast({
          title: '인터넷 연결 복구',
          description: '인터넷 연결이 복구되었습니다.',
          duration: 3000,
        });
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: '인터넷 연결 끊김',
        description: '인터넷 연결을 확인해주세요.',
        variant: 'destructive',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 초기 네트워크 상태 설정
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, state.isOnline]);

  const handleNetworkError = (error: Error) => {
    const isNetworkError = 
      error.message?.includes('fetch') || 
      error.message?.includes('network') || 
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine;

    if (isNetworkError) {
      setState(prev => ({ 
        ...prev, 
        hasNetworkError: true,
        retryAttempts: prev.retryAttempts + 1
      }));

      if (state.retryAttempts < 3) {
        toast({
          title: '연결 오류',
          description: `서버 연결에 실패했습니다. (재시도 ${state.retryAttempts + 1}/3)`,
          variant: 'destructive',
          duration: 4000,
        });
      } else {
        toast({
          title: '연결 실패',
          description: '서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 페이지를 새로고침해주세요.',
          variant: 'destructive',
          duration: 8000,
        });
      }
    }

    return isNetworkError;
  };

  const resetError = () => {
    setState(prev => ({ 
      ...prev, 
      hasNetworkError: false,
      retryAttempts: 0
    }));
  };

  return {
    ...state,
    handleNetworkError,
    resetError,
  };
}
