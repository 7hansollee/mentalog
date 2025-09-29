import { createBrowserClient } from "@supabase/ssr";

// URL 유효성 검사 함수
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return string.includes('.supabase.co') || string.includes('localhost') || string.includes('127.0.0.1');
  } catch (_) {
    return false;
  }
}

// 환경 변수 유효성 검사
function validateSupabaseConfig(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  // 플레이스홀더 값인지 확인
  if (supabaseUrl.includes('your-supabase-url') || 
      supabaseUrl.includes('your-project-id') || 
      supabaseAnonKey.includes('your-supabase-anon-key') ||
      supabaseAnonKey.includes('your-anon-key')) {
    return false;
  }
  
  // URL 형식이 올바른지 확인
  if (!isValidUrl(supabaseUrl)) {
    return false;
  }
  
  return true;
}

export function createClient() {
  if (!validateSupabaseConfig()) {
    throw new Error('Supabase 환경 변수가 올바르게 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 통합된 클라이언트 인스턴스 생성 및 내보내기
let supabaseClient: any = null;

// 브라우저에서만 Supabase 클라이언트 초기화
if (typeof window !== 'undefined') {
  if (!validateSupabaseConfig()) {
    console.warn('⚠️  Supabase 환경 변수가 올바르게 설정되지 않았습니다.');
    console.warn('🔧  배포 환경에서는 플랫폼의 환경 변수 설정에서 다음 값들을 추가해주세요:');
    console.warn('   - NEXT_PUBLIC_SUPABASE_URL: https://your-project-id.supabase.co');
    console.warn('   - NEXT_PUBLIC_SUPABASE_ANON_KEY: your-anon-key');
    console.warn('   - SUPABASE_SERVICE_ROLE_KEY: your-service-role-key');
    console.warn('📖  자세한 설정 방법은 docs/supabase-setup.md를 참고하세요.');
    console.warn('🏠  환경 변수가 없으면 더미 클라이언트를 사용합니다.');
    
    // 환경 변수가 없으면 더미 객체 사용
    supabaseClient = {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: null, error: new Error('회원가입 실패: Supabase 환경 변수가 설정되지 않았습니다. 배포 플랫폼의 환경 변수 설정을 확인해주세요.') }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('로그인 실패: Supabase 환경 변수가 설정되지 않았습니다. 배포 플랫폼의 환경 변수 설정을 확인해주세요.') }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
        updateUser: () => Promise.resolve({ data: null, error: new Error('Supabase 환경 변수가 설정되지 않았습니다') }),
      },
      from: () => ({
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 환경 변수가 설정되지 않았습니다') }) }) }),
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 환경 변수가 설정되지 않았습니다') }) }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 환경 변수가 설정되지 않았습니다') }) }) }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase 환경 변수가 설정되지 않았습니다') }) }),
      }),
    };
  } else {
    try {
      supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      console.log('✅ Supabase 클라이언트가 성공적으로 초기화되었습니다.');
    } catch (error) {
      console.error('❌ Supabase 클라이언트 초기화 실패:', error);
      // fallback to dummy client
      supabaseClient = {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signUp: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }),
          signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }),
          signOut: () => Promise.resolve({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: null } }),
          resetPasswordForEmail: () => Promise.resolve({ error: null }),
          updateUser: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }),
        },
        from: () => ({
          insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }) }) }),
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }) }) }),
          update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase 클라이언트 초기화 실패') }) }) }) }),
          delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase 클라이언트 초기화 실패') }) }),
        }),
      };
    }
  }
} else {
  // 서버 사이드에서는 더미 객체 반환
  supabaseClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }),
    },
    from: () => ({
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }) }) }),
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Server side not supported') }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: new Error('Server side not supported') }) }),
    }),
  };
}

export const supabase = supabaseClient;

// 타입 정의
export type Database = {
  public: {
    Tables: {
      diary_entries: {
        Row: {
          id: string;
          date: string;
          emotion: string;
          answers: any;
          one_line_message: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          emotion: string;
          answers: any;
          one_line_message?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          emotion?: string;
          answers?: any;
          one_line_message?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
