-- 일기 항목 테이블 생성
-- 사용자가 작성한 일기와 관련 정보를 저장합니다.

BEGIN;

-- 일기 항목 테이블 생성
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    emotion TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}',
    one_line_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- 하루에 하나의 일기만 작성 가능하도록 제약 조건 추가
    UNIQUE(user_id, date)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON public.diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date ON public.diary_entries(user_id, date);

-- updated_at 트리거 추가
CREATE TRIGGER diary_entries_updated_at
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS (Row Level Security) 활성화
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 일기만 읽고 쓸 수 있음
CREATE POLICY "사용자는 자신의 일기만 조회 가능" ON public.diary_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 일기만 삽입 가능" ON public.diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 일기만 업데이트 가능" ON public.diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 일기만 삭제 가능" ON public.diary_entries
    FOR DELETE USING (auth.uid() = user_id);

COMMIT;
