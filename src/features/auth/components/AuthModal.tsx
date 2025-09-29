'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User } from 'lucide-react';
import { useSignIn, useSignUp } from '../hooks/useAuthQueries';

// 스키마 정의
const signInSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type SignInForm = z.infer<typeof signInSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  // 로그인 폼 상태 (기존 유지)
  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 회원가입 폼 useState 상태 관리
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 회원가입 폼 에러 메시지 상태
  const [signUpErrors, setSignUpErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const onSignIn = (data: SignInForm) => {
    signInMutation.mutate({
      email: data.email,
      password: data.password,
    }, {
      onSuccess: () => {
        onClose();
        signInForm.reset();
      },
    });
  };

  // 유효성 검사 함수들
  const validateFullName = (value: string): string => {
    if (value.length < 2) {
      return '이름은 최소 2자 이상이어야 합니다.';
    }
    return '';
  };

  const validateEmail = (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '유효한 이메일을 입력해주세요.';
    }
    return '';
  };

  const validatePassword = (value: string): string => {
    if (value.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (confirmPassword !== password) {
      return '비밀번호 확인이 일치하지 않습니다.';
    }
    return '';
  };

  // 실시간 유효성 검사를 위한 핸들러
  const handleSignUpChange = (field: keyof typeof signUpForm, value: string) => {
    // 폼 값 업데이트
    setSignUpForm(prev => ({ ...prev, [field]: value }));

    // 에러 메시지 업데이트
    let errorMessage = '';
    switch (field) {
      case 'fullName':
        errorMessage = validateFullName(value);
        break;
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'password':
        errorMessage = validatePassword(value);
        // 비밀번호가 변경되면 비밀번호 확인도 다시 검사
        if (signUpForm.confirmPassword) {
          setSignUpErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(value, signUpForm.confirmPassword)
          }));
        }
        break;
      case 'confirmPassword':
        errorMessage = validateConfirmPassword(signUpForm.password, value);
        break;
    }

    setSignUpErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  // 폼 제출 시 전체 유효성 검사
  const validateSignUpForm = (): boolean => {
    const errors = {
      fullName: validateFullName(signUpForm.fullName),
      email: validateEmail(signUpForm.email),
      password: validatePassword(signUpForm.password),
      confirmPassword: validateConfirmPassword(signUpForm.password, signUpForm.confirmPassword),
    };

    setSignUpErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const onSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 전체 유효성 검사
    if (!validateSignUpForm()) {
      return;
    }

    // 유효성 검사 통과 시 회원가입 실행
    signUpMutation.mutate({
      email: signUpForm.email,
      password: signUpForm.password,
      fullName: signUpForm.fullName,
    }, {
      onSuccess: () => {
        onClose();
        // 폼 초기화
        setSignUpForm({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setSignUpErrors({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      },
    });
  };

  const handleClose = () => {
    onClose();
    signInForm.reset();
    // 회원가입 폼 초기화
    setSignUpForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setSignUpErrors({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-8 rounded-3xl border-primary-200 shadow-2xl">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-2xl font-semibold text-primary-900 tracking-tight">
            Mentalog에 오신 것을 환영합니다
          </DialogTitle>
          <DialogDescription className="text-center text-primary-600 text-base font-light">
            감정을 기록하고 마음의 변화를 추적해보세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-primary-50 p-1 rounded-xl">
            <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm">로그인</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-sm">회원가입</TabsTrigger>
          </TabsList>

          {/* 로그인 탭 */}
          <TabsContent value="signin" className="space-y-6 mt-6">
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-5">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-700 font-medium">이메일</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="이메일을 입력하세요"
                            className="pl-10 h-12 rounded-xl border-primary-200 focus:border-primary-400 focus:ring-primary-400"
                            disabled={signInMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            className="pl-10"
                            disabled={signInMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary-700 hover:bg-primary-500"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* 회원가입 탭 */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={onSignUp} className="space-y-4">
              {/* 이름 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    value={signUpForm.fullName}
                    onChange={(e) => handleSignUpChange('fullName', e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="pl-10"
                    disabled={signUpMutation.isPending}
                  />
                </div>
                {signUpErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.fullName}</p>
                )}
              </div>

              {/* 이메일 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    type="email"
                    value={signUpForm.email}
                    onChange={(e) => handleSignUpChange('email', e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="pl-10"
                    disabled={signUpMutation.isPending}
                  />
                </div>
                {signUpErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.email}</p>
                )}
              </div>

              {/* 비밀번호 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    type="password"
                    value={signUpForm.password}
                    onChange={(e) => handleSignUpChange('password', e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="pl-10"
                    disabled={signUpMutation.isPending}
                  />
                </div>
                {signUpErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 필드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    type="password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) => handleSignUpChange('confirmPassword', e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="pl-10"
                    disabled={signUpMutation.isPending}
                  />
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{signUpErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-700 hover:bg-primary-500"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? '회원가입 중...' : '회원가입'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />

        <div className="text-center text-sm text-neutral-500">
          계정을 만들면{' '}
          <a href="#" className="text-primary-700 hover:underline">
            서비스 약관
          </a>
          {' '}및{' '}
          <a href="#" className="text-primary-700 hover:underline">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </div>
      </DialogContent>
    </Dialog>
  );
}
