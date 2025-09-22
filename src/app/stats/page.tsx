'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useDiaryStats } from '@/features/diary/hooks/useDiaryQueries';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { subDays, subWeeks, subMonths } from 'date-fns';

// 감정 한글 매핑 (일기 작성 페이지와 동일)
const emotionLabels: Record<string, string> = {
  lonely: '외로울 때',
  tired: '지칠 때',
  angry: '화가 날 때',
  anxious: '불안할 때',
  unfocused: '집중이 안될 때',
  worried: '고민이 있을 때',
  stuck: '일이 안풀릴 때',
  financial: '자금이 부족할 때',
  giveup: '포기하고 싶을 때',
  confidence: '자신감이 없을 때',
  unmotivated: '아무것도 하기 싫을 때',
  no_revenue: '매출이 안 나올 때',
  too_much_work: '해야 할 게 너무 많을 때',
  low_passion: '열정이 떨어질 때',
};

const emotionColors = {
  '외로울 때': 'bg-blue-300',
  '지칠 때': 'bg-gray-300',
  '화가 날 때': 'bg-red-300',
  '불안할 때': 'bg-purple-300',
  '집중이 안될 때': 'bg-orange-300',
  '고민이 있을 때': 'bg-indigo-300',
  '일이 안풀릴 때': 'bg-yellow-300',
  '자금이 부족할 때': 'bg-rose-300',
  '포기하고 싶을 때': 'bg-slate-300',
  '자신감이 없을 때': 'bg-teal-300',
  '아무것도 하기 싫을 때': 'bg-neutral-300',
  '매출이 안 나올 때': 'bg-red-300',
  '해야 할 게 너무 많을 때': 'bg-amber-300',
  '열정이 떨어질 때': 'bg-orange-300',
};

export default function StatsPage() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // 인증 상태
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // 날짜 범위 계산
  const dateRange = useMemo(() => {
    const today = new Date();
    const startDate = period === 'week' ? subWeeks(today, 1) : subMonths(today, 1);
    return { startDate, endDate: today };
  }, [period]);
  
  // 실제 일기 데이터 가져오기
  const { data: diaryStats = [], isLoading: isStatsLoading } = useDiaryStats(
    dateRange.startDate,
    dateRange.endDate
  );

  // 감정 통계 계산
  const emotionStats = useMemo(() => {
    const emotionCounts: Record<string, number> = {};
    
    diaryStats.forEach(entry => {
      const emotion = entry.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // 상위 10개만

    const labels = sortedEmotions.map(([emotion]) => emotionLabels[emotion] || emotion);
    const data = sortedEmotions.map(([,count]) => count);
    const total = data.reduce((sum, count) => sum + count, 0);

    return { labels, data, total };
  }, [diaryStats]);

  const getMostFrequentEmotion = () => {
    if (emotionStats.data.length === 0) return null;
    const maxValue = Math.max(...emotionStats.data);
    const maxIndex = emotionStats.data.indexOf(maxValue);
    return emotionStats.labels[maxIndex];
  };

  const getEmotionInsight = () => {
    const mostFrequent = getMostFrequentEmotion();
    if (!mostFrequent) return null;
    
    const maxValue = Math.max(...emotionStats.data);
    const percentage = Math.round((maxValue / emotionStats.total) * 100);
    
    const insights = {
      '외로울 때': '외로움을 자주 느끼고 계시네요. 가까운 사람들과 시간을 보내거나 새로운 인연을 만들어보는 건 어떨까요?',
      '지칠 때': '피로감을 많이 느끼고 계시는군요. 충분한 휴식과 수면, 그리고 자신에게 조금 더 관대해지는 시간이 필요해 보여요.',
      '화가 날 때': '화나는 감정이 자주 나타나고 있네요. 운동이나 글쓰기 등 건강한 방법으로 감정을 표현해보세요.',
      '불안할 때': '불안감이 자주 나타나고 있네요. 깊게 숨을 쉬며 현재에 집중하고, 명상이나 산책을 시도해보세요.',
      '집중이 안될 때': '집중력 저하를 자주 경험하고 계시네요. 작업 환경을 정리하고 짧은 휴식을 자주 취해보세요.',
      '고민이 있을 때': '고민이 많으신 것 같네요. 신뢰할 수 있는 사람과 대화하거나 일기를 통해 생각을 정리해보세요.',
      '일이 안풀릴 때': '일이 잘 풀리지 않는 상황이 많으셨군요. 다른 관점에서 접근하거나 잠시 거리를 두는 것도 좋은 방법이에요.',
      '자금이 부족할 때': '경제적 부담을 자주 느끼고 계시네요. 가계부를 작성하거나 작은 절약부터 시작해보세요.',
      '포기하고 싶을 때': '포기하고 싶은 마음이 자주 드시는군요. 지금까지 버텨온 자신을 인정하고, 작은 성취부터 축하해보세요.',
      '자신감이 없을 때': '자신감 부족을 자주 느끼시는군요. 자신의 강점과 지금까지의 성취를 돌아보는 시간을 가져보세요.',
      '아무것도 하기 싫을 때': '무기력감을 자주 느끼고 계시네요. 아주 작은 일부터 시작하고, 자신에게 충분한 시간을 주세요.',
      '매출이 안 나올 때': '매출 부진을 자주 경험하고 계시는군요. 고객의 피드백을 들어보고, 작은 개선부터 시작해보세요.',
      '해야 할 게 너무 많을 때': '업무 과부하 상황이 자주 발생하는군요. 우선순위를 정하고, 위임하거나 일정을 조정해보세요.',
      '열정이 떨어질 때': '열정 저하를 자주 느끼시는군요. 처음 시작했던 이유를 떠올리고, 작은 성취감을 찾아보세요.',
    };
    
    return {
      emotion: mostFrequent,
      percentage,
      message: insights[mostFrequent as keyof typeof insights] || '감정 패턴을 지속적으로 관찰해보세요.',
    };
  };

  const insight = getEmotionInsight();

  // 로딩 중이거나 로그인하지 않은 경우
  if (isLoading || isStatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-300/50 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" asChild className="text-neutral-600 hover:text-neutral-800">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  홈으로
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-neutral-600 mb-8">감정 통계를 보려면 먼저 로그인해주세요.</p>
          <Button 
            className="bg-primary-700 hover:bg-primary-500 text-white"
            onClick={() => setIsAuthModalOpen(true)}
          >
            로그인하기
          </Button>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab="signin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <header className="border-b border-neutral-300/50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </Link>
              <h1 className="text-xl font-semibold text-neutral-900">
                감정 통계
              </h1>
            </div>
            <Button asChild variant="outline" className="border-primary-700 text-primary-700 hover:bg-primary-50">
              <Link href="/write">일기 쓰기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 기간 선택 및 요약 */}
          <Card className="p-6 bg-white border-neutral-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
                  감정 통계 분석
                </h2>
                <p className="text-neutral-600">
                  선택한 기간 동안의 감정 패턴을 분석해보세요
                </p>
              </div>
              <Select value={period} onValueChange={(value: 'week' | 'month') => setPeriod(value)}>
                <SelectTrigger className="w-[180px] border-neutral-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">최근 1주일</SelectItem>
                  <SelectItem value="month">최근 1개월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* 주요 인사이트 */}
          {insight ? (
            <Card className="p-6 bg-accent-500/10 border-accent-500/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    가장 많이 느낀 감정: {insight.emotion} ({insight.percentage}%)
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-neutral-50 border-neutral-200">
              <div className="text-center">
                <h3 className="text-lg font-medium text-neutral-600 mb-2">
                  아직 데이터가 없습니다
                </h3>
                <p className="text-neutral-500 mb-4">
                  일기를 작성하시면 감정 통계를 확인할 수 있어요
                </p>
                <Button asChild className="bg-primary-700 hover:bg-primary-500 text-white">
                  <Link href="/write">일기 작성하기</Link>
                </Button>
              </div>
            </Card>
          )}

          {/* 감정 빈도 차트 */}
          <Card className="p-6 bg-white border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900 mb-6">
              감정 빈도 차트
            </h3>
            
            <div className="space-y-4">
              {emotionStats.labels.length > 0 ? emotionStats.labels.map((label, index) => {
                const value = emotionStats.data[index];
                const maxValue = Math.max(...emotionStats.data);
                const percentage = (value / maxValue) * 100;
                const color = emotionColors[label as keyof typeof emotionColors] || 'bg-gray-300';
                
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-neutral-700">{label}</span>
                      <span className="text-sm text-neutral-600">{value}회</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500">선택한 기간에 일기 데이터가 없습니다.</p>
                  <Button asChild className="mt-4 bg-primary-700 hover:bg-primary-500 text-white">
                    <Link href="/write">일기 작성하기</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* 통계 요약 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-neutral-200 text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">
                {emotionStats.total}
              </div>
              <div className="text-sm text-neutral-600">
                총 감정 기록 수
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-neutral-200 text-center">
              <div className="text-3xl font-bold text-secondary-500 mb-2">
                {emotionStats.labels.length}
              </div>
              <div className="text-sm text-neutral-600">
                다양한 감정 종류
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-neutral-200 text-center">
              <div className="text-3xl font-bold text-accent-500 mb-2">
                {Math.round(emotionStats.total / (period === 'week' ? 7 : 30))}
              </div>
              <div className="text-sm text-neutral-600">
                일평균 기록 수
              </div>
            </Card>
          </div>

          {/* 다음 단계 안내 */}
          <Card className="p-6 bg-primary-50 border-primary-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-primary-900 mb-2">
                감정 패턴을 더 자세히 보고 싶다면?
              </h3>
              <p className="text-primary-700 mb-4">
                감정 캘린더에서 날짜별 상세 기록을 확인해보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" className="border-primary-700 text-primary-700 hover:bg-primary-100">
                  <Link href="/calendar">감정 캘린더 보기</Link>
                </Button>
                <Button asChild className="bg-primary-700 hover:bg-primary-500 text-white">
                  <Link href="/write">새 Mentalog 일기 작성</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
