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

const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  confirmPassword: z.string().min(6, '비밀번호 확인을 입력해주세요'),
  fullName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
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

  const onSignUp = (data: SignUpForm) => {
    const { confirmPassword, ...submitData } = data;
    signUpMutation.mutate({
      email: submitData.email,
      password: submitData.password,
      fullName: submitData.fullName,
    }, {
      onSuccess: () => {
        onClose();
        signUpForm.reset();
      },
    });
  };

  const handleClose = () => {
    onClose();
    signInForm.reset();
    signUpForm.reset();
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
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            {...field}
                            placeholder="이름을 입력하세요"
                            className="pl-10"
                            disabled={signUpMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="이메일을 입력하세요"
                            className="pl-10"
                            disabled={signUpMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
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
                            disabled={signUpMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 확인</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            className="pl-10"
                            disabled={signUpMutation.isPending}
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
                  disabled={signUpMutation.isPending}
                >
                  {signUpMutation.isPending ? '회원가입 중...' : '회원가입'}
                </Button>
              </form>
            </Form>
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
