-- 일기 작성 개수 제한 해제
-- 하루에 여러 개의 일기를 작성할 수 있도록 UNIQUE 제약 조건을 제거합니다.

BEGIN;

-- 기존 UNIQUE 제약 조건 제거
-- 제약 조건 이름을 찾아서 제거
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- diary_entries 테이블의 UNIQUE 제약 조건 이름 찾기
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.diary_entries'::regclass 
    AND contype = 'u' 
    AND array_to_string(conkey, ',') = (
        SELECT array_to_string(array_agg(attnum ORDER BY attnum), ',')
        FROM pg_attribute 
        WHERE attrelid = 'public.diary_entries'::regclass 
        AND attname IN ('user_id', 'date')
    );
    
    -- 제약 조건이 존재하면 제거
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.diary_entries DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE '제약 조건 % 이 제거되었습니다.', constraint_name;
    ELSE
        RAISE NOTICE 'UNIQUE(user_id, date) 제약 조건을 찾을 수 없습니다.';
    END IF;
END $$;

-- 일기 작성 시간을 구분하기 위해 created_at에 인덱스 추가
-- 같은 날짜에 여러 일기가 있을 때 작성 시간순으로 정렬하기 위함
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_date_created 
ON public.diary_entries(user_id, date, created_at DESC);

-- 기존 인덱스는 그대로 유지 (성능상 이유)
-- idx_diary_entries_user_date 인덱스는 여전히 유용함

COMMIT;
