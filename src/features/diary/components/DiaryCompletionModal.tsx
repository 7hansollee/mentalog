'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Calendar, Home } from 'lucide-react';
import { generatePersonalizedResponse } from '@/lib/sentiment-analysis';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface DiaryCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmotion: string;
  answers: Record<string, string>;
  personalMessage?: string;
  selectedDate: Date;
}

export function DiaryCompletionModal({
  isOpen,
  onClose,
  selectedEmotion,
  answers,
  personalMessage,
  selectedDate
}: DiaryCompletionModalProps) {
  const router = useRouter();
  
  // 감정 분석 및 위로 메시지 생성 (useMemo로 캐싱하여 리렌더링 시 같은 메시지 유지)
  const response = useMemo(() => 
    generatePersonalizedResponse(selectedEmotion, answers, personalMessage),
    [selectedEmotion, answers, personalMessage]
  );
  
  const handleGoToCalendar = () => {
    onClose();
    router.push('/calendar');
  };
  
  const handleGoToHome = () => {
    onClose();
    router.push('/');
  };
  
  const formatDateKorean = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-t-lg">
          <DialogHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-primary-900">
              일기 작성이 완료되었어요!
            </DialogTitle>
            <p className="text-sm text-primary-700">
              {formatDateKorean(selectedDate)}의 소중한 이야기가 저장되었습니다
            </p>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 위로 메시지 카드 */}
          <Card className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="space-y-3">
              <h3 className="font-medium text-amber-900 text-center">
                💝 오늘의 당신에게 전하는 메시지
              </h3>
              <p className="text-amber-800 leading-relaxed text-center">
                {response.comfortMessage}
              </p>
            </div>
          </Card>
          
          {/* 개인 메시지가 있는 경우 */}
          {personalMessage && (
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-900">
                  당신이 스스로에게 남긴 메시지:
                </h4>
                <p className="text-green-800 italic">
                  "{personalMessage}"
                </p>
              </div>
            </Card>
          )}
          
          {/* 액션 버튼들 */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button
              onClick={handleGoToCalendar}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              캘린더에서 일기 확인하기
            </Button>
            
            <Button
              onClick={handleGoToHome}
              variant="outline"
              className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
