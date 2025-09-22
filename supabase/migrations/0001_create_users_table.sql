-- 사용자 테이블 생성
-- 이 테이블은 Supabase auth.users를 확장하여 추가 사용자 정보를 저장합니다.

BEGIN;

-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 업데이트 시간 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블에 updated_at 트리거 추가 (EXISTS 체크 추가)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'users_updated_at' 
        AND tgrelid = 'public.users'::regclass
    ) THEN
        CREATE TRIGGER users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS 정책들 (IF NOT EXISTS 방식으로 변경)
DO $$
BEGIN
    -- 조회 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = '사용자는 자신의 프로필만 조회 가능'
    ) THEN
        CREATE POLICY "사용자는 자신의 프로필만 조회 가능" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- 업데이트 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = '사용자는 자신의 프로필만 업데이트 가능'
    ) THEN
        CREATE POLICY "사용자는 자신의 프로필만 업데이트 가능" ON public.users
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- 삽입 정책
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = '사용자는 자신의 프로필만 삽입 가능'
    ) THEN
        CREATE POLICY "사용자는 자신의 프로필만 삽입 가능" ON public.users
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 새 사용자가 등록될 때 자동으로 users 테이블에 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- 이미 존재하는 사용자의 경우 무시
        RETURN NEW;
    WHEN OTHERS THEN
        -- 다른 에러가 발생해도 auth.users 생성은 계속 진행
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블의 insert 트리거 (EXISTS 체크 추가)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

COMMIT;
