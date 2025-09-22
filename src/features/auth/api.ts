'use client';

import { supabase } from '@/lib/supabase/client';
import { SignUpData, SignInData, AuthError } from './types';

// 회원가입
export async function signUp({ email, password, fullName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }

  return data;
}

// 로그인
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }

  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }
  
  return user;
}

// 비밀번호 재설정 요청
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }
}

// 비밀번호 업데이트
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }

  return data;
}

// 사용자 프로필 조회
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // 사용자 프로필이 없는 경우는 에러가 아님
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }

  return data;
}

// 사용자 프로필 업데이트
export async function updateUserProfile(userId: string, updates: { full_name?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AuthError({
      message: error.message,
      status: error.status,
    });
  }

  return data;
}
