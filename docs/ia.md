// Information Architecture: 1인 사업가 멘탈 케어 일기 서비스

## Site Map
- /                     // 홈
- /write               // 감정 선택 후 일기 작성
- /calendar            // 감정 키워드 캘린더
- /stats               // 감정 키워드 통계
- /mypage              // 마이페이지 (기록 히스토리)
- /login               // 로그인
- /signup              // 회원가입

## User Flow
- 비회원 사용자 흐름
  - 홈 → 감정 기록하기 (/write) → 감정 선택 → 일기 작성 → 한 줄 메시지 → 완료
  - 감정은 localStorage에 저장 → 로그인 시 이전 기록 이전 안내

- 회원 사용자 흐름
  - 로그인 → 감정 작성 (/write) → 감정 캘린더 확인 (/calendar) → 감정 통계 분석 (/stats)
  - 반복 감정 감지 시 자동 피드백 노출

## Navigation Structure
- 내비게이션 방식: 사이드바
- 구조:
  - 📝 감정 기록하기 (/write)
  - 📅 감정 캘린더 (/calendar)
  - 📊 감정 통계 (/stats)
  - 👤 마이페이지 (/mypage)
  - 🔐 로그인 또는 회원가입 (로그인 상태에 따라 표시 변경)

- 반응형 디자인:
  - 모바일에서는 햄버거 버튼으로 사이드바 토글
  - 사이드바는 drawer 형태로 전환

## Page Hierarchy
- 홈 (/)
  - 소개 문구, CTA 버튼 ("지금 감정 일기 시작하기")
- 감정 기록 (/write)
  - 감정 선택 → 일기 작성 → 마지막 한 줄 메시지 입력
- 감정 캘린더 (/calendar)
  - 날짜별 컬러로 감정 키워드 시각화
  - 클릭 시 해당 날짜 상세 감정 보기
- 감정 통계 (/stats)
  - 주간/월간 감정 키워드 분석 (bar chart, donut chart)
- 마이페이지 (/mypage)
  - 사용자 정보, 전체 기록, 감정 히스토리, 계정 설정

## Content Organization
- 감정 기록 페이지
  - 감정 선택 버튼 (불안, 무기력, 스트레스 등)
  - 일기 텍스트 입력창
  - 마지막 한 줄 메시지 입력란
  - 저장 버튼

- 감정 캘린더 페이지
  - 월 단위 달력
  - 날짜별 감정 키워드 컬러 뱃지
  - hover/tap 시 키워드 상세 표시

- 통계 페이지
  - 키워드 빈도 분석
  - 주간/월간 필터
  - 차트 시각화 (Chart.js or Recharts 사용 예정)

## Interaction Patterns
- 감정 선택: 다중 선택 버튼 (접근성 고려, 키보드 및 스크린리더 대응)
- 일기 입력: 자동 저장 기능 포함 (localStorage / DB)
- 감정 피드백: 특정 키워드 반복 감지 시 자동 메시지 출력
- 감정 캘린더: hover 또는 클릭 시 상세 감정 표시
- 모바일 인터랙션: 버튼 최소 터치 영역 44px 이상, 사이드바 숨김

## URL Structure
- /                     // 홈
- /write               // 감정 작성
- /calendar            // 감정 캘린더
- /calendar/:date      // 특정 날짜 감정 상세
- /stats               // 감정 통계
- /stats?range=week    // 주간 통계
- /stats?range=month   // 월간 통계
- /mypage              // 마이페이지
- /login               // 로그인
- /signup              // 회원가입

## Component Hierarchy
- <AppLayout>
  - <SidebarNavigation />
  - <MobileTopBar />
  - <MainContent>
    - <EmotionSelector />          // 감정 버튼
    - <DiaryEditor />              // 일기 입력창
    - <OneLineMessageInput />      // 마지막 메시지 입력
    - <CalendarView />             // 감정 캘린더
    - <StatsChart />               // 통계 그래프
    - <FeedbackNotice />           // 반복 감정 알림
    - <UserPanel />                // 마이페이지

// 추가 고려 사항
- 모든 텍스트 및 인터페이스는 한국어로 구성
- 로그인은 선택사항 (기록은 local → 이후 동기화 가능)
- 모바일 환경 대응 필수 (Tailwind 기반 반응형 구성)
- 감정 키워드는 고정된 색상 매핑 (접근성 대비 보장)
- SEO 최적화 (title/meta/semantic 태그 적용, SSR 적용 예정)
