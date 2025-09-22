import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

export interface DiaryEntry {
  id: string;
  date: string;
  emotion: string;
  answers: Record<string, string>;
  one_line_message: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDiaryEntryData {
  date: Date;
  emotion: string;
  answers: Record<string, string>;
  one_line_message?: string;
}

// 일기 저장
export async function createDiaryEntry(data: CreateDiaryEntryData) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const formattedDate = format(data.date, 'yyyy-MM-dd');
  
  const { data: result, error } = await supabase
    .from('diary_entries')
    .insert({
      date: formattedDate,
      emotion: data.emotion,
      answers: data.answers,
      one_line_message: data.one_line_message || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`일기 저장 실패: ${error.message}`);
  }

  return result;
}

// 특정 날짜 일기 목록 조회 (하루에 여러 개 가능)
export async function getDiaryEntriesByDate(date: Date) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const formattedDate = format(date, 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('date', formattedDate)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }); // 최신순 정렬

  if (error) {
    throw new Error(`일기 조회 실패: ${error.message}`);
  }

  return data || [];
}

// 특정 날짜 일기 조회 (단일 - 하위 호환성 유지)
export async function getDiaryEntry(date: Date) {
  const entries = await getDiaryEntriesByDate(date);
  return entries.length > 0 ? entries[0] : null;
}

// 월별 일기 목록 조회
export async function getDiaryEntriesByMonth(year: number, month: number) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    throw new Error(`월별 일기 조회 실패: ${error.message}`);
  }

  return data || [];
}

// 캘린더용 일기 데이터 조회 (날짜별 감정 정보만)
export async function getDiaryCalendarData(year: number, month: number) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
  const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('diary_entries')
    .select('date, emotion, one_line_message, created_at')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('created_at', { ascending: false }); // 같은 날짜는 최신순

  if (error) {
    throw new Error(`캘린더 데이터 조회 실패: ${error.message}`);
  }

  // 날짜별로 여러 일기를 그룹화
  const calendarData = (data || []).reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push({
      emotion: entry.emotion,
      one_line_message: entry.one_line_message,
      created_at: entry.created_at,
    });
    return acc;
  }, {} as Record<string, Array<{ emotion: string; one_line_message: string | null; created_at: string }>>);

  return calendarData;
}

// 통계용 데이터 조회
export async function getDiaryStats(startDate?: Date, endDate?: Date) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  let query = supabase
    .from('diary_entries')
    .select('date, emotion')
    .eq('user_id', user.id);

  if (startDate) {
    query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
  }
  
  if (endDate) {
    query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) {
    throw new Error(`통계 데이터 조회 실패: ${error.message}`);
  }

  return data || [];
}

// 일기 수정
export async function updateDiaryEntry(id: string, data: Partial<CreateDiaryEntryData>) {
  const updateData: any = {};
  
  if (data.emotion) updateData.emotion = data.emotion;
  if (data.answers) updateData.answers = data.answers;
  if (data.one_line_message !== undefined) updateData.one_line_message = data.one_line_message;
  
  const { data: result, error } = await supabase
    .from('diary_entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`일기 수정 실패: ${error.message}`);
  }

  return result;
}

// 일기 삭제
export async function deleteDiaryEntry(id: string) {
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // 사용자 본인의 일기만 삭제 가능

  if (error) {
    throw new Error(`일기 삭제 실패: ${error.message}`);
  }
}
