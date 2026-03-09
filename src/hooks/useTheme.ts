import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'app_theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // [fix] catch 추가 - AsyncStorage 실패 시 시스템 테마로 폴백
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
        } else {
          setTheme(systemScheme === 'dark' ? 'dark' : 'light');
        }
      })
      .catch(() => {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      });
  }, [systemScheme]);

  async function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }

  return { theme, toggleTheme };
}
