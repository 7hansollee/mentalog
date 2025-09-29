'use client';

import { useAuthStore } from '../hooks/useAuthStore';
import { Clock } from 'lucide-react';

export function LogoutTimer() {
  const timeUntilLogout = useAuthStore((state) => state.timeUntilLogout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // 로그인되지 않았거나 시간이 0일 때는 표시하지 않음
  if (!isAuthenticated || timeUntilLogout <= 0) {
    return null;
  }

  // 시간을 분:초 형식으로 변환
  const minutes = Math.floor(timeUntilLogout / 60);
  const seconds = timeUntilLogout % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // 남은 시간에 따라 색상 변경
  const getColorClass = () => {
    if (timeUntilLogout <= 60) { // 1분 이하
      return 'text-red-600';
    } else if (timeUntilLogout <= 300) { // 5분 이하
      return 'text-orange-600';
    } else {
      return 'text-neutral-600';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Clock className={`w-3 h-3 ${getColorClass()}`} />
      <span className={`text-xs font-mono ${getColorClass()}`}>
        {formattedTime}
      </span>
    </div>
  );
}
