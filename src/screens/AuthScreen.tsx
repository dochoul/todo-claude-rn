import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  // KeyboardAvoidingView: 키보드가 올라올 때 화면이 가려지지 않도록 자동으로 올려주는 컨테이너
  KeyboardAvoidingView,
  // Platform: iOS/Android/Web 분기 처리에 사용
  Platform,
  // ScrollView: 내용이 화면을 넘칠 때 스크롤 가능하게 함
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../hooks/useTheme';

interface Props {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onSignInWithGoogle: () => Promise<void>;
  error: string | null;
  theme: Theme;
}

export function AuthScreen({ onSignIn, onSignUp, onSignInWithGoogle, error, theme }: Props) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const colors = theme === 'dark' ? darkColors : lightColors;

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setSuccessMsg('');

    if (tab === 'signin') {
      await onSignIn(email.trim(), password);
    } else {
      const ok = await onSignUp(email.trim(), password);
      if (ok) setSuccessMsg('가입 완료! 이메일을 확인해주세요.');
    }
    setLoading(false);
  }

  return (
    // KeyboardAvoidingView: 키보드가 올라올 때 레이아웃을 자동으로 조정
    // iOS는 'padding', Android는 'height' 방식이 더 자연스러움
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.flex, { backgroundColor: colors.bg }]}
    >
      {/* keyboardShouldPersistTaps="handled": 키보드가 열린 상태에서 버튼 탭 시 키보드를 닫지 않고 바로 onPress 실행 */}
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.logo, { color: colors.text }]}>✅ DoneIt</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>할일을 관리하세요</Text>

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          {/* 탭 전환 (로그인 / 회원가입) */}
          <View style={[styles.tabRow, { backgroundColor: colors.tabBg }]}>
            {(['signin', 'signup'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && { backgroundColor: colors.cardBg }]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, { color: tab === t ? '#6200EE' : colors.subText }]}>
                  {t === 'signin' ? '로그인' : '회원가입'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.subText }]}>이메일</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
              placeholder="이메일 주소"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address" // 이메일 전용 키보드 표시
              autoCapitalize="none"        // 자동 대문자 비활성화
              autoCorrect={false}          // 자동 수정 비활성화
            />

            <Text style={[styles.label, { color: colors.subText }]}>비밀번호</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
              placeholder="비밀번호"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry           // 비밀번호 마스킹 (•••)
              onSubmitEditing={handleSubmit} // 키보드 완료 버튼 누르면 제출
            />

            {/* 에러 메시지 */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* 회원가입 성공 메시지 */}
            {successMsg ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {/* 로그인/회원가입 버튼 */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {tab === 'signin' ? '로그인' : '회원가입'}
                </Text>
              )}
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.subText }]}>또는</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* Google 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.googleBtn, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
              onPress={onSignInWithGoogle}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.googleBtnText, { color: colors.text }]}>Google로 로그인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const lightColors = {
  bg: '#F0EDF6',
  cardBg: '#FFF',
  text: '#1A1A1A',
  subText: '#666',
  border: '#E0E0E0',
  inputBg: '#F9F9F9',
  placeholder: '#AAA',
  tabBg: '#F0EDF6',
};

const darkColors = {
  bg: '#121212',
  cardBg: '#1E1E1E',
  text: '#F0F0F0',
  subText: '#999',
  border: '#444',
  inputBg: '#2A2A2A',
  placeholder: '#666',
  tabBg: '#2A2A2A',
};

// StyleSheet.create(): RN의 스타일 정의 방식
// 웹 CSS와 달리 픽셀 단위(숫자)를 사용하고, 카멜케이스로 작성함
// 예: font-size → fontSize, background-color → backgroundColor
const styles = StyleSheet.create({
  flex: { flex: 1 }, // flex: 1 = 가능한 모든 공간을 차지 (CSS의 flex: 1과 동일)
  container: {
    flexGrow: 1,       // ScrollView 내부에서 화면 전체를 채우도록
    justifyContent: 'center', // 세로 중앙 정렬
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden', // 자식 요소가 borderRadius를 벗어나지 않도록
    // 그림자 (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6, // 그림자 (Android) - iOS의 shadow* 속성은 Android에서 동작 안 함
  },
  tabRow: {
    flexDirection: 'row', // 가로 방향 배치 (기본값은 세로 방향 'column')
    padding: 4,
    margin: 12,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    padding: 20,
    paddingTop: 8,
    gap: 6, // 자식 요소들 사이의 간격
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
  },
  successBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    gap: 10,
    marginTop: 10,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
