'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, PenTool, Calendar, BarChart3, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useSignOut } from '@/features/auth/hooks/useAuthQueries';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { LoginSuccessModal } from '@/features/auth/components/LoginSuccessModal';
import { LogoutTimer } from '@/features/auth/components/LogoutTimer';

// 일기 + 멘탈(하트) 조합 아이콘 컴포넌트
const DiaryHeartIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <PenTool className="w-6 h-6 text-primary-700" />
    <Heart className="w-3 h-3 text-red-500 absolute -top-1 -right-1 fill-current" />
  </div>
);

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // 인증 상태
  const { user, isAuthenticated, isLoading, showLoginSuccessModal, setShowLoginSuccessModal } = useAuthStore();
  const signOutMutation = useSignOut();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-50">
      {/* Header */}
      <header className="border-b border-primary-200/20 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center space-x-3">
              <DiaryHeartIcon />
              <span className="text-xl font-semibold text-primary-800 tracking-tight">Mentalog 멘탈로그</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/write" className="text-primary-600 hover:text-primary-800 transition-colors font-medium text-sm tracking-tight">
                  일기 쓰기
                </Link>
                <Link href="/calendar" className="text-primary-600 hover:text-primary-800 transition-colors font-medium text-sm tracking-tight">
                  감정 캘린더
                </Link>
                <Link href="/stats" className="text-primary-600 hover:text-primary-800 transition-colors font-medium text-sm tracking-tight">
                  통계
                </Link>
              </nav>
              
              {/* 인증 관련 UI */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-neutral-600" />
                      <span className="text-sm text-neutral-700">
                        {user.user_metadata?.full_name || user.email}
                      </span>
                    </div>
                    <LogoutTimer />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOutMutation.mutate()}
                    disabled={signOutMutation.isPending}
                  >
                    {signOutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={isLoading}
                >
                  {isLoading ? '로딩 중...' : '로그인'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-primary-900 leading-tight tracking-tight">
              혼자 일하는 당신,<br />
              <span className="text-primary-700">스트레스도 혼자 삭히고 있나요?</span>
            </h1>
            
            <p className="text-xl text-primary-600 leading-relaxed font-light">
              지금 내 감정을 기록하며 멘탈을 케어하는,<br />
              <span className="font-medium text-primary-700">1인 사업가 멘탈 케어 서비스 Mentalog.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Button 
                asChild 
                size="lg" 
                className="px-8 py-4 text-base font-medium"
              >
                <Link href="/write">
                  <PenTool className="w-5 h-5 mr-2" />
                  멘탈이 힘들다면 눌러보세요
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-base font-medium"
              >
                <Link href="/calendar">
                  <Calendar className="w-5 h-5 mr-2" />
                  감정 캘린더 보기
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <div className="relative">
              <Image
                src="/diary1.png"
                alt="스트레스 받는 모습을 표현한 이미지"
                width={480}
                height={320}
                className="rounded-3xl shadow-xl object-cover"
                priority
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-primary-600/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-6 tracking-tight">
              감정을 기록하는 새로운 방법
            </h2>
            <p className="text-xl text-primary-600 font-light max-w-2xl mx-auto">
              간단하지만 효과적인 감정 관리로 더 건강한 마음을 만들어보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Card className="p-10 border border-primary-100 hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl group">
              <div className="w-18 h-18 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                <PenTool className="w-8 h-8 text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-5 tracking-tight">
                감정 선택 후 일기 작성
              </h3>
              <p className="text-primary-600 leading-relaxed font-light">
                오늘 느낀 감정을 선택하고 자유롭게 일기를 작성해보세요. 
                마지막에 한 줄 다짐까지 함께 적을 수 있어요.
              </p>
            </Card>

            <Card className="p-10 border border-primary-100 hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl group">
              <div className="w-18 h-18 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-secondary-700" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-5 tracking-tight">
                감정 캘린더로 시각화
              </h3>
              <p className="text-primary-600 leading-relaxed font-light">
                매일의 감정이 컬러로 표시되는 캘린더로 
                감정의 흐름과 패턴을 한눈에 파악할 수 있어요.
              </p>
            </Card>

            <Card className="p-10 border border-primary-100 hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl group">
              <div className="w-18 h-18 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-accent-700" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-5 tracking-tight">
                반복 감정 감지 및 피드백
              </h3>
              <p className="text-primary-600 leading-relaxed font-light">
                비슷한 감정이 반복될 때 자동으로 알려드려 
                스스로를 돌아볼 수 있는 기회를 제공해요.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 md:p-8 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            오늘부터 Mentalog를 시작해보세요
          </h2>
          <p className="text-primary-50 text-xl mb-10 max-w-2xl mx-auto font-light">
            복잡한 가입 절차 없이 바로 시작할 수 있어요.<br />
            감정을 기록해 더 건강한 마음으로 하루를 보내세요.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-primary-700 hover:bg-primary-50 px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Link href="/write">
              지금 바로 시작하기
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-200/30 bg-white/90 backdrop-blur-sm mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <DiaryHeartIcon className="scale-75" />
              <span className="font-semibold text-primary-800 text-lg tracking-tight">Mentalog 멘탈로그</span>
            </div>
            <p className="text-sm text-primary-600 font-light">
              © 2024 Mentalog 멘탈로그. 당신의 마음을 위한 따뜻한 공간.
            </p>
          </div>
        </div>
      </footer>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signin"
      />

      {/* 로그인 성공 모달 */}
      <LoginSuccessModal
        isOpen={showLoginSuccessModal}
        onClose={() => setShowLoginSuccessModal(false)}
        userName={user?.user_metadata?.full_name}
      />
    </div>
  );
}
