'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDiaryEntry,
  getDiaryEntry,
  getDiaryEntriesByDate,
  getDiaryEntriesByMonth,
  getDiaryCalendarData,
  getDiaryStats,
  updateDiaryEntry,
  deleteDiaryEntry,
  CreateDiaryEntryData,
} from '../api';

// 특정 날짜 일기 목록 조회 (여러 개 가능)
export function useDiaryEntriesByDate(date: Date) {
  return useQuery({
    queryKey: ['diary', 'date', date.toISOString().split('T')[0]],
    queryFn: () => getDiaryEntriesByDate(date),
    enabled: !!date, // date가 있을 때만 쿼리 실행
  });
}

// 특정 날짜 일기 조회 (하위 호환성 유지 - 가장 최신 일기 반환)
export function useDiaryEntry(date: Date) {
  return useQuery({
    queryKey: ['diary', date.toISOString().split('T')[0]],
    queryFn: () => getDiaryEntry(date),
    enabled: !!date, // date가 있을 때만 쿼리 실행
  });
}

// 월별 일기 목록 조회
export function useDiaryEntriesByMonth(year: number, month: number) {
  return useQuery({
    queryKey: ['diary', 'month', year, month],
    queryFn: () => getDiaryEntriesByMonth(year, month),
    enabled: !!(year && month), // year, month가 있을 때만 쿼리 실행
  });
}

// 일기 생성 뮤테이션
export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDiaryEntry,
    onSuccess: (data) => {
      // 캐시 무효화 및 업데이트
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      
      // 특정 날짜의 모든 캐시 무효화 (여러 일기가 있을 수 있으므로)
      queryClient.invalidateQueries({ queryKey: ['diary', 'date', data.date] });
      queryClient.invalidateQueries({ queryKey: ['diary', data.date] });
    },
  });
}

// 일기 수정 뮤테이션
export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiaryEntryData> }) =>
      updateDiaryEntry(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.setQueryData(['diary', data.date], data);
    },
  });
}

// 일기 삭제 뮤테이션
export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDiaryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

// 캘린더용 일기 데이터 조회
export function useDiaryCalendarData(year: number, month: number) {
  return useQuery({
    queryKey: ['diary', 'calendar', year, month],
    queryFn: () => getDiaryCalendarData(year, month),
    enabled: !!(year && month),
  });
}

// 통계용 일기 데이터 조회
export function useDiaryStats(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['diary', 'stats', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => getDiaryStats(startDate, endDate),
    enabled: true, // 항상 활성화, 날짜는 선택사항
  });
}