'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Calendar, Home } from 'lucide-react';
import { generatePersonalizedResponse } from '@/lib/sentiment-analysis';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

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
  
  // 모달이 열릴 때 한 번만 메시지 생성하고 고정
  const [fixedResponse, setFixedResponse] = useState<{
    emotions: string[];
    comfortMessage: string;
    encouragement: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && !fixedResponse) {
      const result = generatePersonalizedResponse(selectedEmotion, answers, personalMessage);
      setFixedResponse(result);
    }
  }, [isOpen, selectedEmotion, answers, personalMessage, fixedResponse]);

  // 모달이 닫힐 때 메시지 초기화
  useEffect(() => {
    if (!isOpen) {
      setFixedResponse(null);
    }
  }, [isOpen]);

  // 메시지가 아직 생성되지 않았으면 기본 메시지 사용
  const response = fixedResponse || {
    emotions: [selectedEmotion],
    comfortMessage: "오늘 하루도 고생 많았어요. 당신의 솔직한 마음을 나누어주셔서 감사해요. 내일은 더 나은 하루가 될 거예요.",
    encouragement: "오늘도 최선을 다한 당신이 자랑스러워요."
  };
  
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
