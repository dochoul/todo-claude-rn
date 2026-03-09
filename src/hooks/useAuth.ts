import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// 이 훅이 반환하는 값들의 타입 정의
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 로그인/회원가입/세션 관리를 담당하는 커스텀 훅
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 초기값 true: 세션 확인 전까지 로딩
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 앱 시작 시 저장된 세션이 있는지 확인 (로그인 유지 기능)
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        // 네트워크 오류 등으로 세션 확인 실패 시 비로그인 상태로 처리
        setUser(null);
      })
      .finally(() => {
        setLoading(false); // 성공/실패 관계없이 로딩 종료
      });

    // 로그인/로그아웃 등 인증 상태 변화를 실시간으로 감지
    // 예: 다른 탭에서 로그아웃하면 이 앱도 자동으로 로그아웃됨
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지)
    return () => data.subscription.unsubscribe();
  }, []);

  // 이메일 + 비밀번호 로그인
  async function signIn(email: string, password: string): Promise<boolean> {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(translateAuthError(signInError.message));
      return false;
    }
    return true;
  }

  // 이메일 + 비밀번호 회원가입
  async function signUp(email: string, password: string): Promise<boolean> {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return false;
    }
    return true; // 가입 성공 (이메일 인증 필요)
  }

  // Google OAuth 로그인
  async function signInWithGoogle(): Promise<void> {
    // Platform.OS로 실행 환경 구분
    // 웹: 현재 도메인으로 리다이렉트 (window.location.origin = 현재 사이트 주소)
    // 모바일: 딥링크 스킴으로 리다이렉트 (앱으로 돌아오는 주소, 추후 설정 필요)
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'doneit://auth/callback';

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  }

  async function signOut(): Promise<void> {
    setError(null);
    await supabase.auth.signOut();
  }

  return { user, loading, error, signIn, signUp, signInWithGoogle, signOut };
}

// Supabase 영어 에러 메시지를 한국어로 번역하는 함수
function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (message.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.';
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
  if (message.includes('Password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.';
  if (message.includes('Unable to validate email address')) return '유효하지 않은 이메일 주소입니다.';
  if (message.toLowerCase().includes('rate limit')) return '잠시 후 다시 시도해주세요. (이메일 발송 횟수 초과)';
  return message; // 번역되지 않은 에러는 원문 그대로 표시
}
