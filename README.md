# ✅ DoneIt - Todo App (React Native)

> 웹 버전([todo-claude-cyan.vercel.app](https://todo-claude-cyan.vercel.app))을 React Native(Expo)로 포팅한 모바일 + 웹 통합 투두 앱.
> 동일한 Supabase 백엔드를 공유하므로 웹과 모바일에서 실시간으로 데이터가 동기화됩니다.

**🌐 웹 배포:** [todo-claude-rn.vercel.app](https://todo-claude-rn.vercel.app)

---

## 주요 기능

- **인증** — 이메일/비밀번호 회원가입·로그인, Google OAuth
- **할일 CRUD** — 추가, 수정(인라인), 삭제, 완료 토글
- **카테고리** — 개인 / 업무 / 쇼핑 / 회의 / 기타
- **우선순위** — 높음(🔴) / 보통(🟡) / 낮음(🟢)
- **마감일** — D-Day 뱃지 (D-3, D-Day, D+2, 기한 초과)
- **필터링** — 전체 / 오늘 마감 / 카테고리별
- **진행률** — 완료 개수 및 프로그레스 바
- **실시간 동기화** — Supabase Realtime (다른 기기와 즉시 동기화)
- **다크/라이트 테마** — 시스템 설정 자동 감지 + 수동 전환
- **크로스 플랫폼** — iOS / Android / 웹 브라우저 모두 지원

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | [Expo](https://expo.dev) (SDK 55) + React Native 0.83 |
| 언어 | TypeScript |
| 백엔드/DB | [Supabase](https://supabase.com) (PostgreSQL + Realtime + Auth) |
| 세션 저장 | AsyncStorage (모바일) / localStorage (웹) |
| 날짜 선택 | @react-native-community/datetimepicker |
| 안전 영역 | react-native-safe-area-context |
| 웹 지원 | react-native-web |
| 배포 | [Vercel](https://vercel.com) (웹 버전) |

---

## 프로젝트 구조

```
todo-claude-rn/
├── App.tsx                        # 앱 진입점 (인증 상태에 따라 화면 분기)
├── index.ts                       # Expo 루트 등록 + URL polyfill
├── app.json                       # Expo 설정 (앱 이름, 아이콘 등)
├── vercel.json                    # Vercel 배포 설정
└── src/
    ├── types/
    │   └── todo.ts                # 타입 정의 + 유틸 함수 (카테고리, 우선순위, D-Day 계산)
    ├── lib/
    │   └── supabase.ts            # Supabase 클라이언트 (플랫폼별 설정 분기)
    ├── hooks/
    │   ├── useAuth.ts             # 인증 훅 (로그인/회원가입/Google OAuth/세션 관리)
    │   ├── useTodos.ts            # 할일 CRUD + Realtime 구독
    │   └── useTheme.ts            # 다크/라이트 테마 (AsyncStorage 저장)
    ├── screens/
    │   ├── AuthScreen.tsx         # 로그인/회원가입 화면
    │   └── MainScreen.tsx         # 메인 화면 (헤더 + 진행률 + 할일 목록)
    └── components/
        ├── AddTodo/
        │   └── AddTodo.tsx        # 할일 추가 폼 (카테고리/우선순위/마감일 선택)
        ├── TodoItem/
        │   └── TodoItem.tsx       # 할일 카드 (보기 모드 ↔ 수정 모드)
        └── CategoryFilter/
            └── CategoryFilter.tsx # 가로 스크롤 필터 칩 목록
```

---

## 웹 vs 웹앱 vs 모바일 차이

| | 웹 버전 (todo-claude-cyan) | 이 프로젝트 (웹) | 이 프로젝트 (모바일) |
|--|--|--|--|
| 기술 | React + Vite | React Native Web | React Native |
| 스타일 | CSS | StyleSheet | StyleSheet |
| 저장소 | localStorage | localStorage | AsyncStorage |
| 날짜 선택 | `<input type="date">` | DateTimePicker | DateTimePicker (네이티브) |
| 인증 리다이렉트 | window.location.origin | window.location.origin | 딥링크 (추후) |
| Google OAuth | ✅ | ✅ | 🚧 딥링크 설정 필요 |

---

## 로컬 실행

### 사전 요구사항

- Node.js **v20 이상** (v20.19.6 권장)
- [nvm](https://github.com/nvm-sh/nvm) 사용 시: `nvm use 20.19.6`
- iOS 테스트: [Expo Go](https://apps.apple.com/app/expo-go/id982107779) 앱 설치

### 설치

```bash
git clone https://github.com/dochoul/todo-claude-rn.git
cd todo-claude-rn
npm install
```

### 환경변수 설정

`.env` 파일을 생성하고 Supabase 프로젝트의 키를 입력합니다.

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Supabase 키는 [supabase.com](https://supabase.com) → 프로젝트 → Settings → API에서 확인

### 실행

```bash
# 개발 서버 시작 (QR코드로 Expo Go 연결)
npx expo start

# 웹 브라우저로 실행
npx expo start --web

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android
```

> **네트워크 주의**: 모바일 기기와 개발 PC가 **같은 Wi-Fi**에 있어야 합니다.
> 다른 네트워크라면 `npx expo start --tunnel` 사용 (ngrok 인증 필요)

---

## Supabase 설정

### DB 테이블

웹 버전과 동일한 Supabase 프로젝트를 공유합니다. 아래 테이블이 생성되어 있어야 합니다.

```sql
-- 할일 테이블
CREATE TABLE todos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users,
  text        TEXT NOT NULL,
  completed   BOOLEAN DEFAULT false,
  category    TEXT,
  priority    TEXT,
  due_date    BIGINT,
  created_at  BIGINT
);

-- 사용자 프로필 테이블
CREATE TABLE user_profiles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users,
  theme       TEXT DEFAULT 'light'
);
```

### Google OAuth 설정

1. Supabase 대시보드 → Authentication → Providers → Google 활성화
2. Authentication → URL Configuration에 Redirect URLs 추가:
   ```
   https://your-domain.vercel.app/**
   http://localhost:8081/**
   ```

---

## 배포 (Vercel 웹 버전)

```bash
# 웹 빌드 테스트
npm run build:web

# GitHub push → Vercel 자동 배포
git push origin main
```

### Vercel 환경변수 설정

Vercel 프로젝트 설정 → Environment Variables에 추가:

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 모바일 앱 배포 (EAS Build)

> App Store / Google Play 출시 시 필요

```bash
npm install -g eas-cli
eas login
eas build:configure

# iOS 빌드 ($99/년 Apple Developer 계정 필요)
eas build --platform ios

# Android 빌드 ($25 일회성 Google Play 계정 필요)
eas build --platform android
```

---

## 관련 프로젝트

- **웹 버전**: [github.com/dochoul/todo-claude](https://github.com/dochoul/todo-claude) — React + Vite로 개발된 원본 웹 앱
