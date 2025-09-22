'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from './useAuthStore';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getUserProfile,
  updateUserProfile,
} from '../api';
import { SignUpData, SignInData } from '../types';



// 로그인 뮤테이션
export function useSignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setShowLoginSuccessModal = useAuthStore((state) => state.setShowLoginSuccessModal);

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user as any);
        setShowLoginSuccessModal(true);
        router.push('/');
      }
    },
    onError: (error: any) => {
      toast({
        title: '로그인 실패',
        description: error.message || '로그인 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

// 로그아웃 뮤테이션
export function useSignOut() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      setUser(null);
      queryClient.clear(); // 모든 쿼리 캐시 클리어
      toast({
        title: '로그아웃 완료',
        description: '안전하게 로그아웃되었습니다.',
        duration: 3000, // 3초 후 자동으로 사라짐
      });
      router.push('/');
    },
    onError: (error: any) => {
      toast({
        title: '로그아웃 실패',
        description: error.message || '로그아웃 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

// 비밀번호 재설정 뮤테이션
export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast({
        title: '비밀번호 재설정 이메일 발송',
        description: '이메일을 확인하여 비밀번호를 재설정해주세요.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '이메일 발송 실패',
        description: error.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

// 비밀번호 업데이트 뮤테이션
export function useUpdatePassword() {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      toast({
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.',
      });
      router.push('/');
    },
    onError: (error: any) => {
      toast({
        title: '비밀번호 변경 실패',
        description: error.message || '비밀번호 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

// 사용자 프로필 업데이트 뮤테이션
export function useUpdateUserProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: { full_name?: string; avatar_url?: string } }) =>
      updateUserProfile(userId, updates),
    onSuccess: () => {
      toast({
        title: '프로필 업데이트 완료',
        description: '프로필이 성공적으로 업데이트되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: any) => {
      toast({
        title: '프로필 업데이트 실패',
        description: error.message || '프로필 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}

// 회원가입 뮤테이션
export function useSignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setShowLoginSuccessModal = useAuthStore((state) => state.setShowLoginSuccessModal);

  return useMutation({
    mutationFn: signUp,
    onSuccess: async (data) => {
      if (data.user) {
        // 1. 스토어에 저장
        setUser(data.user as any);

        // 2. 성공 모달 표시
        setShowLoginSuccessModal(true);

        // 3. 홈페이지로 이동
        router.push('/');

        // 4. 프로필 생성 확인 (트리거가 자동으로 처리, 로그용)
        setTimeout(async () => {
          try {
            const profile = await getUserProfile(data.user.id);
            if (profile) {
              console.log('✅ User profile created successfully via trigger:', profile);
            } else {
              console.warn('⚠️ User profile not found, trigger might be delayed');
            }
          } catch (error) {
            console.warn('⚠️ Profile verification failed:', error);
          }
        }, 2000); // 2초 후 확인 (트리거 처리 시간 고려)
      } else {
        toast({
          title: '이메일 확인 필요',
          description: '이메일을 확인하여 계정을 활성화해주세요.',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
}