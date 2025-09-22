'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useDiaryEntriesByMonth } from '@/features/diary/hooks/useDiaryQueries';
import { useSignOut } from '@/features/auth/hooks/useAuthQueries';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { DiaryDetailModal } from '@/features/diary/components/DiaryDetailModal';

// 감정별 색상 및 레이블 정의 (일기 작성 페이지와 매칭)
const emotionData = {
  lonely: { 
    color: 'bg-gradient-to-r from-sky-200 to-blue-300 text-blue-800', 
    borderColor: 'border-sky-200',
    shadowColor: 'shadow-sky-100/50',
    label: '외로울 때' 
  },
  tired: { 
    color: 'bg-gradient-to-r from-slate-200 to-gray-300 text-slate-700', 
    borderColor: 'border-slate-200',
    shadowColor: 'shadow-slate-100/50',
    label: '지칠 때' 
  },
  angry: { 
    color: 'bg-gradient-to-r from-red-200 to-rose-300 text-red-800', 
    borderColor: 'border-red-200',
    shadowColor: 'shadow-red-100/50',
    label: '화가 날 때' 
  },
  anxious: { 
    color: 'bg-gradient-to-r from-violet-200 to-purple-300 text-violet-800', 
    borderColor: 'border-violet-200',
    shadowColor: 'shadow-violet-100/50',
    label: '불안할 때' 
  },
  unfocused: { 
    color: 'bg-gradient-to-r from-amber-200 to-orange-300 text-amber-800', 
    borderColor: 'border-amber-200',
    shadowColor: 'shadow-amber-100/50',
    label: '집중이 안될 때' 
  },
  worried: { 
    color: 'bg-gradient-to-r from-indigo-200 to-blue-300 text-indigo-800', 
    borderColor: 'border-indigo-200',
    shadowColor: 'shadow-indigo-100/50',
    label: '고민이 있을 때' 
  },
  stuck: { 
    color: 'bg-gradient-to-r from-yellow-200 to-amber-300 text-yellow-800', 
    borderColor: 'border-yellow-200',
    shadowColor: 'shadow-yellow-100/50',
    label: '일이 안풀릴 때' 
  },
  financial: { 
    color: 'bg-gradient-to-r from-pink-200 to-rose-300 text-pink-800', 
    borderColor: 'border-pink-200',
    shadowColor: 'shadow-pink-100/50',
    label: '자금이 부족할 때' 
  },
  giveup: { 
    color: 'bg-gradient-to-r from-gray-200 to-slate-300 text-gray-700', 
    borderColor: 'border-gray-200',
    shadowColor: 'shadow-gray-100/50',
    label: '포기하고 싶을 때' 
  },
  confidence: { 
    color: 'bg-gradient-to-r from-teal-200 to-cyan-300 text-teal-800', 
    borderColor: 'border-teal-200',
    shadowColor: 'shadow-teal-100/50',
    label: '자신감이 없을 때' 
  },
  unmotivated: { 
    color: 'bg-gradient-to-r from-neutral-200 to-gray-300 text-neutral-700', 
    borderColor: 'border-neutral-200',
    shadowColor: 'shadow-neutral-100/50',
    label: '아무것도 하기 싫을 때' 
  },
  no_revenue: { 
    color: 'bg-gradient-to-r from-red-300 to-red-400 text-red-800', 
    borderColor: 'border-red-300',
    shadowColor: 'shadow-red-200/50',
    label: '매출이 안 나올 때' 
  },
  too_much_work: { 
    color: 'bg-gradient-to-r from-orange-200 to-red-300 text-orange-800', 
    borderColor: 'border-orange-200',
    shadowColor: 'shadow-orange-100/50',
    label: '해야 할 게 너무 많을 때' 
  },
  low_passion: { 
    color: 'bg-gradient-to-r from-orange-200 to-amber-300 text-orange-800', 
    borderColor: 'border-orange-200',
    shadowColor: 'shadow-orange-100/50',
    label: '열정이 떨어질 때' 
  },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  
  // 인증 상태
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const signOutMutation = useSignOut();
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // 실제 일기 데이터 가져오기
  const { data: diaryEntries = [], isLoading: isDiaryLoading } = useDiaryEntriesByMonth(
    year, 
    month + 1
  );
  
  // 달력 날짜 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  // 일기 데이터를 날짜별로 맵핑 (다중 일기 지원)
  const diaryByDate = diaryEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  // 날짜 클릭 핸들러
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const diaryEntries = diaryByDate[dateString];
    
    // 일기가 있는 경우에만 팝업 열기
    if (diaryEntries && diaryEntries.length > 0 && isAuthenticated) {
      setSelectedDate(clickedDate);
      setIsDiaryModalOpen(true);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // 빈 칸 추가 (이전 달 마지막 날들)
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const diaryEntries = diaryByDate[dateString] || [];
      const emotions = diaryEntries.map(entry => entry.emotion);
      const isToday = 
        today.getFullYear() === year && 
        today.getMonth() === month && 
        today.getDate() === day;
      
      days.push(
        <div
          key={day}
          className={`
            h-24 p-2 border border-neutral-200 transition-colors
            ${isToday ? 'bg-primary-50 border-primary-300' : 'bg-white'}
            ${diaryEntries.length > 0 ? 'hover:bg-primary-100 cursor-pointer' : 'hover:bg-neutral-50'}
          `}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary-700' : 'text-neutral-900'}`}>
            {day}
          </div>
          <div className="flex flex-wrap gap-1">
            {emotions.slice(0, 3).map((emotion, index) => {
              const emotionInfo = emotionData[emotion as keyof typeof emotionData];
              return (
                <div
                  key={index}
                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${emotionInfo?.color || 'bg-gray-300 text-gray-800'} shadow-md hover:scale-105 transition-transform`}
                  title={emotionInfo?.label || '알 수 없음'}
                >
                  {(emotionInfo?.label || '알 수 없음').slice(0, 4)}...
                </div>
              );
            })}
            {emotions.length > 3 && (
              <div className="text-xs text-neutral-500 px-1 font-medium">+{emotions.length - 3}</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-50">
      {/* Header */}
      <header className="border-b border-primary-200/20 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-primary-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary-600" />
              </Link>
              <h1 className="text-xl font-semibold text-primary-900 tracking-tight">
                감정 캘린더
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 사용자 정보 */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm text-neutral-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              )}
              
              {/* 일기 쓰기 버튼 */}
              {isAuthenticated ? (
                <Button asChild variant="outline" className="border-primary-700 text-primary-700 hover:bg-primary-50">
                  <Link href="/write">일기 쓰기</Link>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="border-primary-700 text-primary-700 hover:bg-primary-50"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  로그인
                </Button>
              )}
              
              {/* 로그아웃 버튼 */}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                >
                  {signOutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* 달력 헤더 */}
          <Card className="p-8 bg-white border-primary-100 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-primary-900 tracking-tight">
                {year}년 {month + 1}월
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-0 mb-2 rounded-xl overflow-hidden">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-primary-700 bg-primary-50">
                  {day}
                </div>
              ))}
            </div>

            {/* 달력 날짜 */}
            <div className="grid grid-cols-7 gap-0 border border-primary-200 rounded-xl overflow-hidden">
              {renderCalendarDays()}
            </div>
          </Card>

          {/* 감정 범례 */}
          <Card className="p-6 bg-white border-primary-100 rounded-3xl shadow-lg">
            <h3 className="text-xl font-semibold text-primary-900 mb-6 tracking-tight">감정 색상 가이드</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.entries(emotionData).map(([emotion, data]) => (
                <div 
                  key={emotion} 
                  className="group"
                >
                  <div className={`
                    relative px-3 py-2 rounded-xl text-xs font-medium
                    ${data.color} ${data.shadowColor} 
                    shadow-sm hover:shadow-md 
                    transform hover:scale-102 
                    transition-all duration-200 ease-out
                    border ${data.borderColor}
                    w-full text-center
                    overflow-hidden
                  `}>
                    <span className="relative z-10 leading-tight">
                      {data.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 안내 메시지 */}
          {isAuthenticated ? (
            <Card className="p-8 bg-primary-50 border-primary-200 rounded-3xl shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-primary-900 mb-4 tracking-tight">
                  감정 패턴을 확인해보세요
                </h3>
                <p className="text-primary-700 mb-6 text-lg font-light">
                  일기가 있는 날짜를 클릭하면 해당 날의 상세한 일기 내용을 볼 수 있어요
                </p>
                <Button asChild>
                  <Link href="/stats">감정 통계 보기</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-secondary-50 border-secondary-200 rounded-3xl shadow-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-primary-900 mb-4 tracking-tight">
                  로그인이 필요합니다
                </h3>
                <p className="text-primary-700 mb-6 text-lg font-light">
                  일기를 작성하고 감정 변화를 추적하려면 로그인해주세요
                </p>
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  로그인하기
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signin"
      />

      {/* 일기 상세 모달 */}
      <DiaryDetailModal
        isOpen={isDiaryModalOpen}
        onClose={() => {
          setIsDiaryModalOpen(false);
          setSelectedDate(null);
        }}
        date={selectedDate}
      />
    </div>
  );
}
