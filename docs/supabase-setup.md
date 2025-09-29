# Supabase 백엔드 설정 가이드

## 📋 개요

이 문서는 일기 애플리케이션의 Supabase 백엔드 설정 방법을 안내합니다.

## 🚀 구현된 기능

- ✅ **회원가입/로그인 기능**
  - 이메일 기반 인증
  - 자동 사용자 프로필 생성
  - Row Level Security (RLS) 적용

- ✅ **일기 저장 기능** 
  - CRUD 작업 (생성, 읽기, 수정, 삭제)
  - 날짜별 일기 저장
  - 감정 및 답변 데이터 JSON 저장

- ✅ **캘린더 연동**
  - 월별 일기 데이터 조회
  - 캘린더용 최적화된 데이터 형태
  - 날짜별 감정 상태 표시

## 🛠️ 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. "New Project" 버튼 클릭
3. 프로젝트 이름, 비밀번호 설정
4. 프로젝트 생성 완료 후 대시보드 접속

### 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음과 같이 설정:

```bash
# Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon 공개 키
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase 서비스 역할 키 (서버 사이드 작업용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**값 확인 방법:**
- Supabase 대시보드 → Settings → API
- URL과 anon key는 Public 섹션에서 확인
- service_role key는 Service Role 섹션에서 확인

### 3. 데이터베이스 마이그레이션 실행

다음 마이그레이션 파일들을 Supabase SQL Editor에서 순서대로 실행:

1. `supabase/migrations/0001_create_users_table.sql`
2. `supabase/migrations/0002_create_diary_entries_table.sql`

**실행 방법:**
1. Supabase 대시보드 → SQL Editor
2. 각 마이그레이션 파일 내용을 복사하여 붙여넣기
3. "RUN" 버튼 클릭하여 실행

### 4. 인증 설정 (선택사항)

Supabase 대시보드 → Authentication → Settings에서:
- Email confirmations 설정
- Password requirements 설정  
- Social providers 설정 (Google, GitHub 등)

## 📊 데이터베이스 스키마

### users 테이블
- `id`: UUID (auth.users 참조)
- `full_name`: TEXT
- `email`: TEXT  
- `avatar_url`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

### diary_entries 테이블
- `id`: UUID (Primary Key)
- `user_id`: UUID (users 테이블 참조)
- `date`: DATE (UNIQUE per user)
- `emotion`: TEXT
- `answers`: JSONB
- `one_line_message`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

## 🔒 보안 기능

### Row Level Security (RLS)
- 모든 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 접근 가능
- `auth.uid()`를 통한 사용자 인증 확인

### 자동 트리거
- 회원가입 시 자동 프로필 생성
- 업데이트 시간 자동 관리

## 🎯 API 사용 예시

### 인증 관련
```typescript
import { useSignIn, useSignUp, useSignOut } from '@/features/auth/hooks/useAuthQueries';

// 로그인
const signIn = useSignIn();
signIn.mutate({ email, password });

// 회원가입  
const signUp = useSignUp();
signUp.mutate({ email, password, fullName });
```

### 일기 관련
```typescript
import { 
  useDiaryEntry, 
  useCreateDiaryEntry,
  useDiaryCalendarData 
} from '@/features/diary/hooks/useDiaryQueries';

// 특정 날짜 일기 조회
const { data: diary } = useDiaryEntry(new Date());

// 일기 생성
const createDiary = useCreateDiaryEntry();
createDiary.mutate({
  date: new Date(),
  emotion: 'happy',
  answers: { question1: 'answer1' },
  one_line_message: '좋은 하루였다'
});

// 캘린더 데이터
const { data: calendarData } = useDiaryCalendarData(2024, 1);
```

## 📱 프론트엔드 연동

### 인증 상태 관리
```typescript
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';

function App() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // 앱 초기화 시 인증 상태 복원
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);
}
```

### 캘린더 연동
```typescript
import { useDiaryCalendarData } from '@/features/diary/hooks/useDiaryQueries';

function Calendar() {
  const { data: calendarData } = useDiaryCalendarData(2024, 1);
  
  // calendarData 형태: { '2024-01-01': { emotion: 'happy', one_line_message: '...' } }
  return (
    <div>
      {Object.entries(calendarData || {}).map(([date, entry]) => (
        <div key={date} className={`emotion-${entry.emotion}`}>
          {date}: {entry.one_line_message}
        </div>
      ))}
    </div>
  );
}
```

## 🔧 문제 해결

### 환경 변수 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 변수명이 `NEXT_PUBLIC_` 접두사를 포함하는지 확인
- 개발 서버 재시작 (`npm run dev`)

### 배포 환경 환경 변수 설정
배포 플랫폼(Vercel, Netlify 등)에서 환경 변수를 설정해야 합니다:

**Vercel 배포 시:**
1. Vercel 대시보드 → Project Settings → Environment Variables
2. 다음 변수들을 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-key`
3. 저장 후 프로젝트 재배포

**Netlify 배포 시:**
1. Netlify 대시보드 → Site Settings → Environment Variables
2. 위와 동일한 환경 변수들 추가
3. 저장 후 사이트 재빌드

**기타 플랫폼:**
- 각 플랫폼의 환경 변수 설정 방법에 따라 동일한 변수들을 추가

### 마이그레이션 오류
- 각 마이그레이션을 순서대로 실행했는지 확인
- Supabase SQL Editor에서 에러 메시지 확인
- 테이블이 이미 존재하는 경우 `IF NOT EXISTS` 사용

### 인증 오류
- RLS 정책이 올바르게 설정되었는지 확인
- 사용자가 로그인 상태인지 확인
- 브라우저 콘솔에서 상세 에러 메시지 확인

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js with Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
