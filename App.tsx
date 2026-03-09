import React from 'react';
import { ActivityIndicator, View } from 'react-native';
// SafeAreaProvider: 노치/홈바 등 안전 영역 정보를 하위 컴포넌트에 제공하는 컨텍스트
// 앱 최상단에 한 번만 감싸야 SafeAreaView가 정상 동작함
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { useTheme } from './src/hooks/useTheme';
import { AuthScreen } from './src/screens/AuthScreen';
import { MainScreen } from './src/screens/MainScreen';

// 실제 앱 내용을 담는 내부 컴포넌트
// SafeAreaProvider와 분리한 이유: Provider 내부에서만 useAuth, useTheme 등 훅을 사용할 수 있기 때문
function AppContent() {
  const { user, loading, error, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // 앱 시작 시 Supabase에서 기존 세션을 확인하는 동안 로딩 스피너 표시
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? '#121212' : '#F5F0FF' }}>
        {/* ActivityIndicator: RN 기본 로딩 스피너 (iOS/Android 네이티브 스타일로 렌더링됨) */}
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  // 로그인 여부에 따라 화면 분기
  // RN에는 웹의 라우터(URL)가 없으므로 이렇게 조건부 렌더링으로 화면을 전환함
  if (!user) {
    return (
      <AuthScreen
        onSignIn={signIn}
        onSignUp={signUp}
        onSignInWithGoogle={signInWithGoogle}
        error={error}
        theme={theme}
      />
    );
  }

  return (
    <MainScreen
      user={user}
      onSignOut={signOut}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

// 앱의 진입점 컴포넌트 (index.ts에서 registerRootComponent로 등록됨)
export default function App() {
  return (
    // SafeAreaProvider로 전체 앱을 감싸야 안전 영역 처리가 됨
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
