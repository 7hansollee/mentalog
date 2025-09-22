'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDiaryEntriesByDate, useDeleteDiaryEntry } from '../hooks/useDiaryQueries';
import { CalendarDays, Heart, MessageCircle, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DiaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
}

// 감정별 색상 및 한글 라벨
const emotionConfig = {
  happy: { color: 'bg-yellow-300 text-yellow-800', label: '기쁨', emoji: '😊' },
  sad: { color: 'bg-blue-300 text-blue-800', label: '슬픔', emoji: '😢' },
  angry: { color: 'bg-red-300 text-red-800', label: '화남', emoji: '😡' },
  anxious: { color: 'bg-purple-300 text-purple-800', label: '불안', emoji: '😰' },
  stress: { color: 'bg-orange-300 text-orange-800', label: '스트레스', emoji: '😫' },
  tired: { color: 'bg-gray-300 text-gray-800', label: '피곤', emoji: '😴' },
  lonely: { color: 'bg-indigo-300 text-indigo-800', label: '외로움', emoji: '😔' },
  hopeful: { color: 'bg-green-300 text-green-800', label: '희망', emoji: '🌟' },
  confused: { color: 'bg-pink-300 text-pink-800', label: '혼란', emoji: '😵' },
  grateful: { color: 'bg-emerald-300 text-emerald-800', label: '감사', emoji: '🙏' },
};

// 질문 라벨 맵핑
const questionLabels: Record<string, string> = {
  today_events: '오늘 있었던 일',
  feelings: '느낀 감정과 생각',
  grateful_things: '감사한 일',
  tomorrow_goals: '내일의 목표',
  reflection: '하루 돌아보기',
  mood_reason: '기분의 이유',
  important_moment: '중요한 순간',
  learned_today: '오늘 배운 것',
  challenge: '어려웠던 점',
  achievement: '성취한 것',
};

export function DiaryDetailModal({ isOpen, onClose, date }: DiaryDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);
  const { data: diaryEntries = [], isLoading, error } = useDiaryEntriesByDate(date || new Date());
  const deleteDiaryMutation = useDeleteDiaryEntry();
  const { toast } = useToast();

  if (!date) return null;

  const formattedDate = format(date, 'yyyy년 MM월 dd일 EEEE', { locale: ko });
  const currentEntry = diaryEntries[selectedEntryIndex];

  const handleDelete = async () => {
    if (!currentEntry) return;

    try {
      await deleteDiaryMutation.mutateAsync(currentEntry.id);
      const { dismiss } = toast({
        title: "일기가 삭제되었습니다",
        description: "선택한 일기가 성공적으로 삭제되었습니다.",
      });
      
      // 3초 후 자동으로 토스트 제거
      setTimeout(() => {
        dismiss();
      }, 3000);
      setIsDeleteDialogOpen(false);
      // 다른 일기가 있으면 인덱스 조정, 없으면 모달 닫기
      if (diaryEntries.length > 1) {
        setSelectedEntryIndex(Math.max(0, selectedEntryIndex - 1));
      } else {
        onClose();
      }
    } catch (error) {
      toast({
        title: "삭제 실패",
        description: "일기 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            <DialogTitle className="text-xl font-semibold text-neutral-900">
              {formattedDate}
            </DialogTitle>
          </div>
          <div className="flex items-center space-x-2">
            {/* 다중 일기 네비게이션 */}
            {diaryEntries.length > 1 && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntryIndex(Math.max(0, selectedEntryIndex - 1))}
                  disabled={selectedEntryIndex === 0}
                  className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700"
                >
                  ←
                </Button>
                <span className="text-sm text-neutral-600">
                  {selectedEntryIndex + 1} / {diaryEntries.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEntryIndex(Math.min(diaryEntries.length - 1, selectedEntryIndex + 1))}
                  disabled={selectedEntryIndex === diaryEntries.length - 1}
                  className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700"
                >
                  →
                </Button>
              </div>
            )}
            {currentEntry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 w-8 p-0 text-neutral-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none border-0 focus:border-0 active:border-0"
                disabled={deleteDiaryMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0 active:outline-none border-0 focus:border-0 active:border-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-neutral-500">일기를 불러오는 중...</div>
            </div>
          )}

          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="text-center text-red-600">
                일기를 불러오는데 실패했습니다.
              </div>
            </Card>
          )}

          {!isLoading && !error && diaryEntries.length === 0 && (
            <Card className="p-6 bg-neutral-50 border-neutral-200">
              <div className="text-center text-neutral-500">
                이 날에는 작성된 일기가 없습니다.
              </div>
            </Card>
          )}

          {currentEntry && (
            <>
              {/* 감정 정보 */}
              <Card className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">오늘의 감정</span>
                </div>
                <div className="mt-2">
                  {currentEntry.emotion && (
                    <Badge 
                      className={`${emotionConfig[currentEntry.emotion as keyof typeof emotionConfig]?.color || 'bg-gray-300 text-gray-800'} font-medium`}
                    >
                      <span className="mr-1">
                        {emotionConfig[currentEntry.emotion as keyof typeof emotionConfig]?.emoji || '🤔'}
                      </span>
                      {emotionConfig[currentEntry.emotion as keyof typeof emotionConfig]?.label || currentEntry.emotion}
                    </Badge>
                  )}
                </div>
              </Card>

              {/* 한 줄 메시지 */}
              {currentEntry.one_line_message && (
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <MessageCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">오늘의 한마디</span>
                  </div>
                  <p className="text-yellow-800 font-medium italic">
                    "{currentEntry.one_line_message}"
                  </p>
                </Card>
              )}

              {/* 일기 내용 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center space-x-2">
                  <div className="w-1 h-6 bg-primary-500 rounded"></div>
                  <span>일기 내용</span>
                </h3>
                
                {currentEntry.answers && Object.keys(currentEntry.answers).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(currentEntry.answers).map(([key, value]) => (
                      <Card key={key} className="p-4 border-neutral-200">
                        <div className="mb-2">
                          <h4 className="font-medium text-neutral-700">
                            {questionLabels[key] || key}
                          </h4>
                        </div>
                        <div className="text-neutral-900 whitespace-pre-wrap leading-relaxed">
                          {value || '작성되지 않음'}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 bg-neutral-50 border-neutral-200">
                    <div className="text-center text-neutral-500">
                      상세 내용이 작성되지 않았습니다.
                    </div>
                  </Card>
                )}
              </div>

              {/* 작성 시간 */}
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 text-center">
                  작성 시간: {format(new Date(currentEntry.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                  {currentEntry.updated_at !== currentEntry.created_at && (
                    <span className="ml-2">
                      (수정: {format(new Date(currentEntry.updated_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })})
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-neutral-900">
              일기 삭제 확인
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-neutral-600">
              정말로 이 일기를 삭제하시겠습니까?
            </p>
            <p className="text-sm text-neutral-500">
              삭제된 일기는 복구할 수 없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteDiaryMutation.isPending}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteDiaryMutation.isPending}
              >
                {deleteDiaryMutation.isPending ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
