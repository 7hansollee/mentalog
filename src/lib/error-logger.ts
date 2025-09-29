'use client';

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  type: 'network' | 'auth' | 'application' | 'unknown';
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  logError(error: Error | unknown, type: ErrorLog['type'] = 'unknown', userId?: string) {
    if (typeof window === 'undefined') return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message: errorMessage,
      stack: errorStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
      type,
    };

    this.errors.unshift(errorLog);
    
    // 최대 에러 개수 유지
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type.toUpperCase()}] ${errorMessage}`, error);
    }

    // 로컬 스토리지에 저장 (개발/디버깅 용도)
    try {
      localStorage.setItem('diary-app-errors', JSON.stringify(this.errors.slice(0, 10)));
    } catch (e) {
      // 로컬 스토리지 오류 무시
    }
  }

  logNetworkError(error: Error | unknown, userId?: string) {
    this.logError(error, 'network', userId);
  }

  logAuthError(error: Error | unknown, userId?: string) {
    this.logError(error, 'auth', userId);
  }

  getErrors(): ErrorLog[] {
    return this.errors.slice();
  }

  clearErrors() {
    this.errors = [];
    try {
      localStorage.removeItem('diary-app-errors');
    } catch (e) {
      // 로컬 스토리지 오류 무시
    }
  }

  getNetworkErrors(): ErrorLog[] {
    return this.errors.filter(error => error.type === 'network');
  }

  getAuthErrors(): ErrorLog[] {
    return this.errors.filter(error => error.type === 'auth');
  }

  // 에러 패턴 분석
  analyzeErrors() {
    const analysis = {
      total: this.errors.length,
      byType: {} as Record<string, number>,
      recent: this.errors.slice(0, 5),
      commonMessages: {} as Record<string, number>,
    };

    this.errors.forEach(error => {
      // 타입별 통계
      analysis.byType[error.type] = (analysis.byType[error.type] || 0) + 1;
      
      // 공통 메시지 통계
      const message = error.message.toLowerCase();
      analysis.commonMessages[message] = (analysis.commonMessages[message] || 0) + 1;
    });

    return analysis;
  }
}

export const errorLogger = new ErrorLogger();

// 글로벌 에러 핸들러 설정
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error, 'application');
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(event.reason, 'application');
  });
}
