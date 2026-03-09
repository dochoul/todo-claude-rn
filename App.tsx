import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from './src/hooks/useAuth';
import { useTheme } from './src/hooks/useTheme';
import { AuthScreen } from './src/screens/AuthScreen';
import { MainScreen } from './src/screens/MainScreen';

function AppContent() {
  const { user, loading, error, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme === 'dark' ? '#121212' : '#F5F0FF' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
