'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 네트워크 관련 에러인지 확인
    const isNetworkError = 
      error.message?.includes('fetch') || 
      error.message?.includes('network') || 
      error.message?.includes('Failed to fetch');

    return {
      hasError: isNetworkError,
      error: isNetworkError ? error : null,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isNetworkError = 
      error.message?.includes('fetch') || 
      error.message?.includes('network') || 
      error.message?.includes('Failed to fetch');

    if (isNetworkError) {
      console.error('네트워크 에러 발생:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ isRetrying: true });
    
    // 2초 후 에러 상태 리셋
    setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: null, 
        isRetrying: false 
      });
    }, 2000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>연결 오류</CardTitle>
              <CardDescription>
                서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>다음을 확인해보세요:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>인터넷 연결 상태</li>
                  <li>Wi-Fi 또는 모바일 데이터 연결</li>
                  <li>방화벽 설정</li>
                </ul>
              </div>
              <Button 
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className="w-full"
              >
                {this.state.isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    재연결 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 시도
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;
