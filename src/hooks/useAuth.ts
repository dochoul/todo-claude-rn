import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // [fix] getSession에 catch 추가 - 실패 시 loading이 무한 대기하는 문제 방지
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<boolean> {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(translateAuthError(signInError.message));
      return false;
    }
    return true;
  }

  async function signUp(email: string, password: string): Promise<boolean> {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return false;
    }
    return true;
  }

  async function signInWithGoogle(): Promise<void> {
    // [fix] window.location.origin은 웹 전용 API - 플랫폼에 따라 분기
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : 'doneit://auth/callback'; // 모바일 딥링크 (추후 설정 필요)

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

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (message.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.';
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다. 로그인을 시도해주세요.';
  if (message.includes('Password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.';
  if (message.includes('Unable to validate email address')) return '유효하지 않은 이메일 주소입니다.';
  if (message.toLowerCase().includes('rate limit')) return '잠시 후 다시 시도해주세요. (이메일 발송 횟수 초과)';
  return message;
}
