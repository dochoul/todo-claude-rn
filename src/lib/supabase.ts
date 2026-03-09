import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Expo의 환경변수는 EXPO_PUBLIC_ 접두사를 붙여야 클라이언트에서 접근 가능
// 웹(Vite)의 VITE_ 접두사와 같은 역할
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Platform.OS: 현재 실행 환경을 알려줌 ('ios' | 'android' | 'web')
const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 웹: 브라우저 기본 localStorage 사용 (undefined = 기본값 사용)
    // 모바일: AsyncStorage 사용 (RN에는 localStorage가 없음)
    storage: isWeb ? undefined : AsyncStorage,

    autoRefreshToken: true,  // 토큰 만료 전 자동 갱신
    persistSession: true,    // 앱 재시작 후에도 로그인 유지

    // 웹: Google OAuth 후 URL 해시(#access_token=...)에서 토큰 자동 파싱
    // 모바일: URL 해시 방식을 사용하지 않으므로 false
    detectSessionInUrl: isWeb,
  },
});
