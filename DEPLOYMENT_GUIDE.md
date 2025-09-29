# 🚀 배포 가이드

## 📋 개요

일기 애플리케이션을 배포하기 위한 단계별 가이드입니다.

## 🔑 필수 환경 변수

배포 전에 다음 환경 변수들을 설정해야 합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 환경 변수 값 확인 방법

1. [Supabase](https://supabase.com) 대시보드 접속
2. 프로젝트 선택
3. Settings → API 메뉴로 이동
4. 다음 값들을 복사:
   - **URL**: `Project URL` 값
   - **anon key**: `Project API keys` 섹션의 `anon` `public` 키
   - **service_role key**: `Project API keys` 섹션의 `service_role` `secret` 키

## 🔧 배포 플랫폼별 설정

### Vercel 배포

1. **프로젝트 연결**
   ```bash
   # Vercel CLI 설치 (선택사항)
   npm i -g vercel
   
   # 배포
   vercel
   ```

2. **환경 변수 설정**
   - Vercel 대시보드 → 프로젝트 선택
   - Settings → Environment Variables
   - 위의 3개 환경 변수 추가
   - Save 클릭

3. **재배포**
   - Deployments 탭으로 이동
   - 최신 배포 항목에서 "Redeploy" 클릭

### Netlify 배포

1. **프로젝트 연결**
   - GitHub 저장소와 연결
   - 또는 드래그 앤 드롭으로 빌드 폴더 업로드

2. **환경 변수 설정**
   - Site settings → Environment variables
   - 위의 3개 환경 변수 추가
   - Save 클릭

3. **재빌드**
   - Deploys 탭으로 이동
   - "Trigger deploy" → "Clear cache and deploy site"

### 기타 플랫폼

각 플랫폼의 환경 변수 설정 방법에 따라 동일한 변수들을 설정하세요.

## ✅ 배포 후 확인사항

1. **사이트 접속 확인**
   - 배포된 URL로 접속
   - 페이지가 정상적으로 로드되는지 확인

2. **환경 변수 적용 확인**
   - 브라우저 개발자 도구 → Console 탭
   - "✅ Supabase 클라이언트가 성공적으로 초기화되었습니다." 메시지 확인
   - 경고 메시지가 없는지 확인

3. **기능 테스트**
   - 회원가입/로그인 기능 테스트
   - 일기 작성 기능 테스트
   - 캘린더 기능 테스트

## 🚨 문제 해결

### "Supabase 환경 변수가 설정되지 않았습니다" 오류

**원인**: 배포 플랫폼에서 환경 변수가 설정되지 않았거나 잘못된 값이 설정됨

**해결 방법**:
1. 배포 플랫폼의 환경 변수 설정 확인
2. Supabase 대시보드에서 올바른 값 복사
3. 환경 변수 저장 후 재배포
4. 브라우저 캐시 클리어

### 회원가입/로그인이 작동하지 않음

**확인사항**:
1. Supabase 프로젝트가 활성화되어 있는지 확인
2. 데이터베이스 마이그레이션이 실행되었는지 확인
3. RLS 정책이 올바르게 설정되었는지 확인

**해결 방법**:
1. Supabase SQL Editor에서 마이그레이션 파일들을 순서대로 실행
2. Authentication → Users 탭에서 사용자 생성 확인

### 일기 기능이 작동하지 않음

**확인사항**:
1. `diary_entries` 테이블이 생성되었는지 확인
2. 사용자가 로그인되어 있는지 확인

**해결 방법**:
1. Supabase Table Editor에서 테이블 구조 확인
2. RLS 정책 확인

## 📱 모바일 최적화

배포된 사이트는 모바일에서도 정상적으로 작동합니다:
- 반응형 디자인 적용
- PWA 지원 (추후 업데이트 예정)
- 터치 인터페이스 최적화

## 🔄 업데이트 방법

1. **코드 변경**
   - 로컬에서 개발
   - Git에 커밋 및 푸시

2. **자동 배포**
   - Vercel/Netlify: Git 푸시 시 자동 배포
   - 수동 배포: 플랫폼 대시보드에서 재배포

3. **마이그레이션 필요 시**
   - 새로운 마이그레이션 파일 생성
   - Supabase SQL Editor에서 실행

## 📞 지원

문제가 지속되거나 추가 도움이 필요한 경우:
1. `docs/supabase-setup.md` 문서 참고
2. 브라우저 개발자 도구에서 오류 메시지 확인
3. Supabase 대시보드에서 로그 확인
