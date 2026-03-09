import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  // Platform: iOS/Android/Web 분기 처리
  Platform,
} from 'react-native';
// DateTimePicker: 날짜/시간 선택 UI (iOS/Android 각각 네이티브 UI 사용)
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Category, Priority, CATEGORIES, PRIORITIES,
  CATEGORY_COLORS, PRIORITY_COLORS, PRIORITY_ICONS,
  timestampToDateStr, toMidnightTimestamp,
} from '../../types/todo';
import { Theme } from '../../hooks/useTheme';

interface Props {
  onAdd: (text: string, category: Category, priority: Priority, dueDate?: number) => void;
  theme: Theme;
}

export function AddTodo({ onAdd, theme }: Props) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<Category>('개인');
  const [priority, setPriority] = useState<Priority>('보통');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  // expanded: 텍스트 입력 시 옵션(카테고리/우선순위/마감일)을 펼쳐서 보여줌
  const [expanded, setExpanded] = useState(false);

  const colors = theme === 'dark' ? darkColors : lightColors;

  function handleAdd() {
    if (!text.trim()) return;
    // Date 객체를 자정 타임스탬프로 변환 (DB 저장 형식에 맞춤)
    const dueDateTs = dueDate
      ? toMidnightTimestamp(timestampToDateStr(dueDate.getTime()))
      : undefined;
    onAdd(text.trim(), category, priority, dueDateTs);
    // 추가 후 입력 초기화
    setText('');
    setDueDate(undefined);
    setExpanded(false);
  }

  return (
    // style 배열: RN에서 여러 스타일을 합치는 방법 (뒤에 오는 스타일이 앞을 덮어씀)
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
          placeholder="새 할일 추가..."
          placeholderTextColor={colors.placeholder}
          value={text}
          onChangeText={(v) => {
            setText(v);
            // 텍스트 입력 시 옵션 펼치기
            if (v && !expanded) setExpanded(true);
          }}
          onSubmitEditing={handleAdd}    // 키보드의 완료/엔터 버튼 눌렀을 때
          returnKeyType="done"           // 키보드 완료 버튼 텍스트를 'done'으로 표시
        />
        {/* TouchableOpacity: RN의 클릭 가능한 요소 (웹의 button/div onClick과 유사)
            누르면 살짝 투명해지는 피드백 효과가 있음 */}
        <TouchableOpacity
          style={[styles.addBtn, !text.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!text.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 조건부 렌더링: expanded가 true일 때만 옵션 영역 표시 */}
      {expanded && (
        <View style={styles.options}>
          {/* 카테고리 선택 */}
          <Text style={[styles.optionLabel, { color: colors.subText }]}>카테고리</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  { borderColor: CATEGORY_COLORS[c] },
                  // 선택된 카테고리만 배경색 채우기
                  category === c && { backgroundColor: CATEGORY_COLORS[c] },
                ]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, { color: category === c ? '#FFF' : CATEGORY_COLORS[c] }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 우선순위 선택 */}
          <Text style={[styles.optionLabel, { color: colors.subText }]}>우선순위</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.chip,
                  { borderColor: PRIORITY_COLORS[p] },
                  priority === p && { backgroundColor: PRIORITY_COLORS[p] },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, { color: priority === p ? '#FFF' : PRIORITY_COLORS[p] }]}>
                  {PRIORITY_ICONS[p]} {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 마감일 선택 */}
          <Text style={[styles.optionLabel, { color: colors.subText }]}>마감일 (선택)</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              style={[styles.chip, { borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                {dueDate ? timestampToDateStr(dueDate.getTime()) : '📅 날짜 선택'}
              </Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                style={[styles.chip, { borderColor: '#F44336' }]}
                onPress={() => setDueDate(undefined)}
              >
                <Text style={{ color: '#F44336', fontSize: 13 }}>제거</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* DateTimePicker: 날짜 선택 UI
              - iOS: 화면 하단에 스크롤 휠 형태로 표시 (항상 보임)
              - Android: 다이얼로그 팝업 형태로 표시 (선택 후 자동으로 닫힘)
              → iOS는 선택 후 수동으로 숨겨야 하므로 Platform.OS === 'ios' 체크 */}
          {showDatePicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              minimumDate={new Date()} // 오늘 이전 날짜 선택 불가
              onChange={(_, date) => {
                // Android는 선택 즉시 닫히므로 false, iOS는 계속 보여야 하므로 true 유지
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setDueDate(date);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

// 라이트/다크 테마 색상값을 별도 객체로 관리
const lightColors = {
  bg: '#FFF',
  border: '#E0E0E0',
  text: '#1A1A1A',
  subText: '#666',
  inputBg: '#F9F9F9',
  placeholder: '#AAA',
};

const darkColors = {
  bg: '#1E1E1E',
  border: '#444',
  text: '#F0F0F0',
  subText: '#999',
  inputBg: '#2A2A2A',
  placeholder: '#666',
};

// StyleSheet.create()로 스타일 정의
// 웹 CSS와 주요 차이점:
//   - 단위 없이 숫자만 사용 (기본 dp 단위, 화면 밀도에 따라 자동 조정)
//   - 상속 없음 (부모 스타일이 자식에게 자동 적용되지 않음)
//   - 일부 속성만 지원 (float, z-index 제한적 등)
const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    // iOS 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Android 그림자 (elevation 숫자가 클수록 그림자 강해짐)
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row', // 자식을 가로로 배치
    gap: 10,
  },
  input: {
    flex: 1, // 남은 공간 모두 차지 (+ 버튼을 제외한 나머지)
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: '#6200EE',
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',    // 가로 중앙 정렬
    justifyContent: 'center', // 세로 중앙 정렬
  },
  addBtnDisabled: {
    backgroundColor: '#C5B4E3',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  options: {
    marginTop: 12,
    gap: 6,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 공간이 부족하면 다음 줄로 넘김 (CSS의 flex-wrap: wrap)
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
