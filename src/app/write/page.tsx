'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, User, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { useCreateDiaryEntry } from '@/features/diary/hooks/useDiaryQueries';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { DiaryCompletionModal } from '@/features/diary/components/DiaryCompletionModal';
import { useSignOut } from '@/features/auth/hooks/useAuthQueries';
import { format, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

// 감정 키워드 데이터
const emotionKeywords = [
  { 
    id: 'lonely', 
    label: '외로울 때 😔', 
    color: 'bg-gradient-to-r from-sky-200 to-blue-300 text-blue-800 border-sky-200',
    hoverColor: 'hover:from-sky-300 hover:to-blue-400 hover:text-blue-900'
  },
  { 
    id: 'tired', 
    label: '지칠 때 😴', 
    color: 'bg-gradient-to-r from-slate-200 to-gray-300 text-slate-700 border-slate-200',
    hoverColor: 'hover:from-slate-300 hover:to-gray-400 hover:text-slate-800'
  },
  { 
    id: 'angry', 
    label: '화가 날 때 😠', 
    color: 'bg-gradient-to-r from-red-200 to-rose-300 text-red-800 border-red-200',
    hoverColor: 'hover:from-red-300 hover:to-rose-400 hover:text-red-900'
  },
  { 
    id: 'anxious', 
    label: '불안할 때 😰', 
    color: 'bg-gradient-to-r from-violet-200 to-purple-300 text-violet-800 border-violet-200',
    hoverColor: 'hover:from-violet-300 hover:to-purple-400 hover:text-violet-900'
  },
  { 
    id: 'unfocused', 
    label: '집중이 안될 때 😵‍💫', 
    color: 'bg-gradient-to-r from-amber-200 to-orange-300 text-amber-800 border-amber-200',
    hoverColor: 'hover:from-amber-300 hover:to-orange-400 hover:text-amber-900'
  },
  { 
    id: 'worried', 
    label: '고민이 있을 때 🤔', 
    color: 'bg-gradient-to-r from-indigo-200 to-blue-300 text-indigo-800 border-indigo-200',
    hoverColor: 'hover:from-indigo-300 hover:to-blue-400 hover:text-indigo-900'
  },
  { 
    id: 'stuck', 
    label: '일이 안풀릴 때 😤', 
    color: 'bg-gradient-to-r from-yellow-200 to-amber-300 text-yellow-800 border-yellow-200',
    hoverColor: 'hover:from-yellow-300 hover:to-amber-400 hover:text-yellow-900'
  },
  { 
    id: 'financial', 
    label: '자금이 부족할 때 💸', 
    color: 'bg-gradient-to-r from-pink-200 to-rose-300 text-pink-800 border-pink-200',
    hoverColor: 'hover:from-pink-300 hover:to-rose-400 hover:text-pink-900'
  },
  { 
    id: 'giveup', 
    label: '포기하고 싶을 때 😞', 
    color: 'bg-gradient-to-r from-gray-200 to-slate-300 text-gray-700 border-gray-200',
    hoverColor: 'hover:from-gray-300 hover:to-slate-400 hover:text-gray-800'
  },
  { 
    id: 'confidence', 
    label: '자신감이 없을 때 😟', 
    color: 'bg-gradient-to-r from-teal-200 to-cyan-300 text-teal-800 border-teal-200',
    hoverColor: 'hover:from-teal-300 hover:to-cyan-400 hover:text-teal-900'
  },
  { 
    id: 'unmotivated', 
    label: '아무것도 하기 싫을 때 😑', 
    color: 'bg-gradient-to-r from-neutral-200 to-gray-300 text-neutral-700 border-neutral-200',
    hoverColor: 'hover:from-neutral-300 hover:to-gray-400 hover:text-neutral-800'
  },
  { 
    id: 'no_revenue', 
    label: '매출이 안 나올 때 📉', 
    color: 'bg-gradient-to-r from-red-300 to-red-400 text-red-800 border-red-300',
    hoverColor: 'hover:from-red-400 hover:to-red-500 hover:text-red-900'
  },
  { 
    id: 'too_much_work', 
    label: '해야 할 게 너무 많을 때 📋', 
    color: 'bg-gradient-to-r from-orange-200 to-red-300 text-orange-800 border-orange-200',
    hoverColor: 'hover:from-orange-300 hover:to-red-400 hover:text-orange-900'
  },
  { 
    id: 'low_passion', 
    label: '열정이 떨어질 때 🔥', 
    color: 'bg-gradient-to-r from-orange-200 to-amber-300 text-orange-800 border-orange-200',
    hoverColor: 'hover:from-orange-300 hover:to-amber-400 hover:text-orange-900'
  },
];

// 감정별 질문 데이터
const emotionQuestions = {
  lonely: [
    { key: 'moment', question: '오늘 어떤 순간에 외롭다고 느꼈나요?', placeholder: '외로움을 느낀 구체적인 순간을 적어보세요...' },
    { key: 'desire', question: '그 순간 당신에게 가장 필요한 건 무엇이었나요?', placeholder: '그 순간 가장 간절했던 마음을 적어보세요...' },
    { key: 'connection', question: '이 외로움을 달래줄 수 있는 방법이나 사람이 있을까요?', placeholder: '외로움을 달랠 수 있는 사람이나 방법을 적어보세요...' }
  ],
  tired: [
    { key: 'moment', question: '오늘 어떤 순간에 가장 지쳤다고 느꼈나요?', placeholder: '가장 지쳤던 구체적인 순간을 적어보세요...' },
    { key: 'source', question: '그 상황의 어떤 부분이 당신을 지치게 만들었는지 구체적으로 말해주세요.', placeholder: '몸의 피로인지, 마음의 피로인지, 환경적 요인인지 적어보세요...' },
    { key: 'recovery', question: '지친 당신이 지금 당장 취할 수 있는 휴식은 어떤 게 있을까요?', placeholder: '진정한 휴식을 위해 필요한 것을 적어보세요...' }
  ],
  angry: [
    { key: 'moment', question: '오늘 어떤 순간에 가장 화났나요?', placeholder: '가장 화났던 구체적인 순간을 적어보세요...' },
    { key: 'trigger', question: '그 상황에서 나를 화나게 한 정확한 포인트는 무엇이었나요?', placeholder: '정확히 어떤 부분에서 화가 났는지 적어보세요...' },
    { key: 'release', question: '이 화를 건강하게 표출하고 해소할 수 있는 방법은?', placeholder: '건강한 분노 해소 방법을 적어보세요...' }
  ],
  anxious: [
    { key: 'moment', question: '오늘 어떤 순간에 불안함을 느꼈나요?', placeholder: '불안함을 느낀 구체적인 순간을 적어보세요...' },
    { key: 'worry', question: '그 불안의 핵심에는 무엇이 있었나요?', placeholder: '불안의 근본적인 원인이나 걱정을 적어보세요...' },
    { key: 'calm', question: '이 불안을 진정시키기 위해 할 수 있는 작은 행동은?', placeholder: '불안을 줄일 수 있는 구체적인 방법을 적어보세요...' }
  ],
  unfocused: [
    { key: 'moment', question: '오늘 언제 집중이 안 됐나요?', placeholder: '집중력이 흐트러진 구체적인 순간을 적어보세요...' },
    { key: 'distraction', question: '무엇이 나의 주의를 가장 많이 분산시켰나요?', placeholder: '집중을 방해한 요인들을 적어보세요...' },
    { key: 'focus', question: '집중력을 되찾기 위해 시도해볼 수 있는 방법은?', placeholder: '집중력 향상을 위한 구체적인 방법을 적어보세요...' }
  ],
  worried: [
    { key: 'concern', question: '오늘 당신의 마음을 무겁게 한 고민은 무엇인가요?', placeholder: '가장 신경 쓰이는 고민을 구체적으로 적어보세요...' },
    { key: 'impact', question: '그 고민이 최근 반복되고 있나요?', placeholder: '고민의 반복 패턴이나 빈도를 적어보세요...' },
    { key: 'approach', question: '친구가 같은 고민을 한다면, 뭐라고 말해주고 싶으신가요?', placeholder: '친구에게 해주고 싶은 조언이나 위로의 말을 적어보세요...' }
  ],
  stuck: [
    { key: 'situation', question: '오늘 어떤 일이 뜻대로 되지 않았나요?', placeholder: '막혔거나 잘 풀리지 않은 일을 구체적으로 적어보세요...' },
    { key: 'obstacle', question: '혹시 원인은 뭐라고 생각하세요?', placeholder: '문제의 핵심이나 장애요소를 적어보세요...' },
    { key: 'alternative', question: '다른 관점에서 접근할 수 있는 방법이 있을까요?', placeholder: '새로운 시각이나 대안적 접근법을 적어보세요...' }
  ],
  financial: [
    { key: 'situation', question: '오늘 어떤 상황에서 경제적 부담을 느꼈나요?', placeholder: '경제적 어려움을 느낀 구체적인 상황을 적어보세요...' },
    { key: 'impact', question: '이 경제적 부담이 나에게 어떤 감정을 가져다주나요?', placeholder: '경제적 스트레스로 인한 감정을 솔직하게 적어보세요...' },
    { key: 'plan', question: '이 상황을 개선하기 위한 작은 계획이나 아이디어가 있나요?', placeholder: '경제적 상황 개선을 위한 작은 아이디어를 적어보세요...' }
  ],
  giveup: [
    { key: 'moment', question: '오늘 어떤 순간에 포기하고 싶다는 생각이 들었나요?', placeholder: '포기하고 싶었던 구체적인 순간을 적어보세요...' },
    { key: 'reason', question: '다시 생각해도 개선이 불가능한 일인가요?', placeholder: '상황 개선의 가능성에 대한 솔직한 생각을 적어보세요...' },
    { key: 'strength', question: '진짜 포기해버리면 어떨 거 같은가요?', placeholder: '포기했을 때의 결과나 감정을 상상해서 적어보세요...' }
  ],
  confidence: [
    { key: 'situation', question: '오늘 어떤 상황에서 자신감이 떨어졌나요?', placeholder: '자신감을 잃게 된 구체적인 상황을 적어보세요...' },
    { key: 'doubt', question: '그때 나 자신에 대해 어떤 의심이 들었나요?', placeholder: '자신에 대한 의심이나 부정적 생각을 적어보세요...' },
    { key: 'strength', question: '내가 잘할 수 있는 것들을 떠올려본다면?', placeholder: '자신의 강점이나 잘하는 것들을 적어보세요...' }
  ],
  unmotivated: [
    { key: 'feeling', question: '오늘 언제부터 아무것도 하기 싫어졌나요?', placeholder: '무기력함을 느끼기 시작한 순간을 적어보세요...' },
    { key: 'cause', question: '이런 기분의 원인이 무엇이라고 생각하시나요?', placeholder: '무기력함의 원인을 스스로 분석해보세요...' },
    { key: 'small_step', question: '당신의 활력을 끌어올릴 수 있는 가장 작고 간단한 일은 무엇일까요?', placeholder: '활력을 되찾을 수 있는 작은 행동을 적어보세요...' }
  ],
  no_revenue: [
    { key: 'emotion', question: '매출이 없을 때 가장 먼저 어떤 감정이 드셨나요?', placeholder: '매출 부진을 마주했을 때의 솔직한 감정을 적어보세요...' },
    { key: 'analysis', question: '실력 때문일까요, 아니면 다른 문제일까요?', placeholder: '매출 부진의 원인에 대한 자신의 분석을 적어보세요...' },
    { key: 'improvement', question: '지금 당장 실행해 볼 수 있는 가장 작은 개선방안은 뭐가 있을까요?', placeholder: '당장 시작할 수 있는 작은 개선점을 적어보세요...' }
  ],
  too_much_work: [
    { key: 'burden', question: '지금 가장 부담스럽게 느껴지는 일은 무엇인가요?', placeholder: '가장 스트레스를 주는 업무나 일을 적어보세요...' },
    { key: 'reduce', question: '그 일의 어떤 부분이 부담스럽나요?', placeholder: '위임하거나 미룰 수 있는 일들을 생각해보세요...' },
    { key: 'priority', question: '그래도 그 일을 해야 한다면, 지금 당장 시도할 부분은 무엇인가요?', placeholder: '우선순위가 가장 높은 일을 적어보세요...' }
  ],
  low_passion: [
    { key: 'doubt', question: '최근에 "이걸 왜 하고 있지?"라는 생각이 드셨나요?', placeholder: '일이나 목표에 대한 의문이 든 순간을 적어보세요...' },
    { key: 'initial_reason', question: '처음 이 일을 시작하셨던 이유가 무엇인가요?', placeholder: '시작할 때의 동기나 목표를 떠올려보세요...' },
    { key: 'direction', question: '내가 원하는 방향은 바뀌었나요, 아니면 잠시 흔들린 걸까요?', placeholder: '자신의 진심과 현재 상황을 솔직하게 적어보세요...' }
  ]
};

export default function WritePage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [personalMessage, setPersonalMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // 인증 상태
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const createDiaryMutation = useCreateDiaryEntry();
  const signOutMutation = useSignOut();

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setAnswers({}); // 감정이 변경되면 기존 답변들을 초기화
    setPersonalMessage(''); // 개인 메시지도 초기화
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const handleTodayReset = () => {
    setSelectedDate(new Date());
    setIsCalendarOpen(false);
  };

  const formatDateKorean = (date: Date) => {
    return format(date, 'yyyy년 MM월 dd일', { locale: ko });
  };

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value
    }));
  };

  // 현재 보여줄 질문의 인덱스를 계산
  const getCurrentQuestionIndex = () => {
    if (!selectedEmotion) return -1;
    
    const questions = emotionQuestions[selectedEmotion as keyof typeof emotionQuestions];
    if (!questions) return -1;
    
    // 답변된 질문의 개수를 확인
    let answeredCount = 0;
    for (const question of questions) {
      if (answers[question.key] && answers[question.key].trim().length > 0) {
        answeredCount++;
      } else {
        break; // 첫 번째 빈 답변에서 중단
      }
    }
    
    return answeredCount < questions.length ? answeredCount : questions.length;
  };

  const handleSave = () => {
    // 인증 확인
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedEmotion) {
      toast({
        title: "감정 선택 필요",
        description: "감정을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 모든 질문에 답변했는지 확인
    const questions = emotionQuestions[selectedEmotion as keyof typeof emotionQuestions];
    if (questions) {
      const unansweredQuestions = questions.filter(q => !answers[q.key] || answers[q.key].trim().length === 0);
      if (unansweredQuestions.length > 0) {
        toast({
          title: "답변 미완성",
          description: "모든 질문에 답변해주세요.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // 실제 일기 저장
    createDiaryMutation.mutate({
      date: selectedDate,
      emotion: selectedEmotion,
      answers: answers,
      one_line_message: personalMessage || undefined,
    }, {
      onSuccess: () => {
        // 완료 모달 표시
        setIsCompletionModalOpen(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-neutral-50">
      {/* Header */}
      <header className="border-b border-primary-200/20 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="p-2 hover:bg-primary-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary-600" />
              </Link>
              <h1 className="text-xl font-semibold text-primary-900 tracking-tight">
                Mentalog 일기 작성
              </h1>
            </div>
            
            {/* 사용자 정보 및 로그아웃 */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm text-neutral-700">
                    {user.user_metadata?.full_name || user.email}
                  </span>
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
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 날짜 선택 섹션 */}
          <Card className="p-6 bg-white border-neutral-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-neutral-900 mb-2">
                  일기 작성 날짜
                </h2>
                <p className="text-sm text-neutral-600">
                  일기를 작성할 날짜를 선택해주세요
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[300px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateKorean(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={{
                        after: new Date(),
                        before: new Date("1900-01-01")
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTodayReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  오늘로 설정
                </Button>
              </div>

              {/* 오늘이 아닌 날짜 선택 시 안내 메시지 */}
              {!isToday(selectedDate) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">안내:</span> 선택하신 날짜는 {formatDateKorean(selectedDate)}입니다. 
                    과거의 경험을 되돌아보며 일기를 작성해보세요.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* 감정 선택 섹션 */}
          <Card className="p-6 bg-white border-neutral-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-neutral-900 mb-2">
                  지금 당신은 어떤 상황인가요?
                </h2>
                <p className="text-sm text-neutral-600">
                  상황을 고르면, 그 순간의 자신과 대화할 수 있어요.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {emotionKeywords.map((emotion) => {
                  const isSelected = selectedEmotion === emotion.id;
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => handleEmotionSelect(emotion.id)}
                      className={`
                        px-3 py-2 rounded-xl border transition-all duration-200 font-medium text-sm
                        shadow-sm hover:shadow-md transform hover:scale-102
                        ${isSelected 
                          ? `${emotion.color} ${emotion.hoverColor} ring-2 ring-primary-500 ring-offset-1 shadow-md scale-102` 
                          : 'bg-white border-neutral-300 text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                        }
                      `}
                    >
                      {emotion.label}
                    </button>
                  );
                })}
              </div>

              {selectedEmotion && (
                <div className="text-sm text-primary-700">
                  선택된 감정: {emotionKeywords.find(e => e.id === selectedEmotion)?.label}
                </div>
              )}
            </div>
          </Card>

          {/* 감정별 질문 섹션 */}
          {selectedEmotion && emotionQuestions[selectedEmotion as keyof typeof emotionQuestions] && (
            <div className="space-y-6">
              {emotionQuestions[selectedEmotion as keyof typeof emotionQuestions].map((question, index) => {
                const currentQuestionIndex = getCurrentQuestionIndex();
                const shouldShow = index <= currentQuestionIndex;
                
                if (!shouldShow) return null;
                
                return (
                  <Card key={question.key} className="p-6 bg-white border-neutral-200">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-lg font-medium text-neutral-900 mb-2">
                          질문 {index + 1}. {question.question.replace('오늘', isToday(selectedDate) ? '오늘' : '그날')}
                        </h2>
                      </div>
                      
                      <Textarea
                        value={answers[question.key] || ''}
                        onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        className="min-h-[120px] resize-none border-neutral-300 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* 개인 메시지 섹션 - 모든 질문 완료 후 표시 */}
          {selectedEmotion && (() => {
            const questions = emotionQuestions[selectedEmotion as keyof typeof emotionQuestions];
            const allQuestionsAnswered = questions && questions.every(q => answers[q.key] && answers[q.key].trim().length > 0);
            
            if (!allQuestionsAnswered) return null;
            
            return (
              <Card className="p-6 bg-primary-50 border-primary-200">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium text-primary-900 mb-2">
                      지금 나에게 가장 필요한 한 마디는 무엇인가요?
                    </h2>
                    <p className="text-sm text-primary-700">
                      지금 이 순간 내가 가장 듣고 싶거나 필요한 말을 적어보세요
                    </p>
                  </div>
                  
                  <Textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="지금 이 순간 나에게 가장 필요한 한 마디를 적어보세요..."
                    className="min-h-[120px] resize-none border-primary-300 focus:border-primary-500 focus:ring-primary-500 bg-white"
                  />
                </div>
              </Card>
            );
          })()}

          {/* 감정 미선택 시 안내 메시지 */}
          {!selectedEmotion && (
            <Card className="p-8 bg-neutral-50 border-neutral-200">
              <div className="text-center">
                <h2 className="text-lg font-medium text-neutral-600 mb-2">
                  감정을 선택해주세요
                </h2>
                <p className="text-sm text-neutral-500">
                  감정을 선택하시면 그에 맞는 질문들이 나타납니다
                </p>
              </div>
            </Card>
          )}


          {/* 저장 버튼 */}
          {selectedEmotion && (
            <div className="flex justify-center pt-4">
              {(() => {
                const questions = emotionQuestions[selectedEmotion as keyof typeof emotionQuestions];
                const allQuestionsAnswered = questions && questions.every(q => answers[q.key] && answers[q.key].trim().length > 0);
                
                return (
                  <Button
                    onClick={handleSave}
                    className="bg-primary-700 hover:bg-primary-500 text-white py-3 px-8 w-full max-w-md"
                    size="lg"
                    disabled={createDiaryMutation.isPending || isLoading || !allQuestionsAnswered}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createDiaryMutation.isPending ? '저장 중...' : 
                     !allQuestionsAnswered ? '모든 질문에 답변해주세요' : 
                     'Mentalog 일기 저장하기'}
                  </Button>
                );
              })()}
            </div>
          )}
        </div>
      </main>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="signin"
      />
      
      {/* 일기 작성 완료 모달 */}
      <DiaryCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        selectedEmotion={selectedEmotion}
        answers={answers}
        personalMessage={personalMessage}
        selectedDate={selectedDate}
      />
    </div>
  );
}
