import { useState, useEffect } from 'react';
// useColorScheme: 기기의 다크모드/라이트모드 설정을 감지하는 RN 내장 훅
import { useColorScheme } from 'react-native';
// AsyncStorage: RN의 key-value 저장소 (웹의 localStorage와 유사)
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'app_theme'; // AsyncStorage에 저장할 키 이름

export function useTheme() {
  // useColorScheme(): 기기 설정의 테마를 반환 ('light' | 'dark' | null)
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // 앱 시작 시 저장된 테마 불러오기
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored); // 저장된 값이 있으면 사용
        } else {
          // 저장된 값이 없으면 기기 시스템 테마를 기본값으로 사용
          setTheme(systemScheme === 'dark' ? 'dark' : 'light');
        }
      })
      .catch(() => {
        // AsyncStorage 오류 시 시스템 테마로 폴백
        setTheme(systemScheme === 'dark' ? 'dark' : 'light');
      });
  }, [systemScheme]);

  // 테마 전환 함수: 상태를 바꾸고 AsyncStorage에 저장
  async function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await AsyncStorage.setItem(THEME_KEY, next); // 앱 재시작 후에도 유지
  }

  return { theme, toggleTheme };
}
