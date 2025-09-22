'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function LoginSuccessModal({ isOpen, onClose, userName }: LoginSuccessModalProps) {
  const handleConfirm = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className="sm:max-w-[420px] p-8 rounded-3xl border-primary-200 shadow-2xl"
        hideCloseButton
      >
        <DialogHeader className="space-y-6 text-center">
          {/* 아이콘 */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* 제목 */}
          <DialogTitle className="text-2xl font-semibold text-primary-900 tracking-tight">
            로그인 성공!
          </DialogTitle>

          {/* 환영 메시지 */}
          <div className="space-y-2">
            <p className="text-primary-700 font-medium">
              {userName ? `${userName}님, 다시 만나서 반가워요!` : '다시 만나서 반가워요!'}
            </p>
          </div>
        </DialogHeader>

        {/* 감정적 메시지 */}
        <div className="mt-8 mb-6 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
          <div className="text-center space-y-3">
            <p className="text-primary-800 font-medium leading-relaxed">
              마음이 많이 지쳤나요?
            </p>
            <p className="text-primary-700 leading-relaxed">
              지금 그 마음을 기록해 보세요.
            </p>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirm}
            className="w-32 h-12 bg-primary-700 hover:bg-primary-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
