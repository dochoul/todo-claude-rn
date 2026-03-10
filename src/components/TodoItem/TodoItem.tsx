import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  // Alert: iOS/Android 네이티브 다이얼로그 (웹의 window.confirm과 유사)
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Todo, CATEGORIES, PRIORITIES,
  CATEGORY_COLORS, PRIORITY_COLORS, PRIORITY_ICONS,
  getDueDateStatus, formatDueDateLabel, timestampToDateStr, toMidnightTimestamp,
} from '../../types/todo';
import { Theme } from '../../hooks/useTheme';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  // Partial<Pick<...>>: Todo의 특정 필드만 선택적으로 업데이트
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>) => void;
  theme: Theme;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate, theme }: Props) {
  // editing: 보기 모드(false) ↔ 수정 모드(true) 전환
  const [editing, setEditing] = useState(false);
  // 수정 중인 임시 값들 (저장 전까지 원본에 반영되지 않음)
  const [editText, setEditText] = useState(todo.text);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colors = theme === 'dark' ? darkColors : lightColors;
  const dueDateStatus = getDueDateStatus(todo.dueDate); // 'far' | 'soon' | 'today' | 'overdue' | null
  const priorityColor = PRIORITY_COLORS[todo.priority];

  // 수정 저장
  function handleSave() {
    if (!editText.trim()) return;
    onUpdate(todo.id, {
      text: editText.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDueDate
        ? toMidnightTimestamp(timestampToDateStr(editDueDate.getTime()))
        : undefined,
    });
    setEditing(false);
  }

  // 삭제 확인 다이얼로그
  function handleDelete() {
    // 웹에서는 Alert.alert 버튼 배열이 동작하지 않으므로 window.confirm 사용
    if (Platform.OS === 'web') {
      if (window.confirm(`"${todo.text}" 를 삭제할까요?`)) {
        onDelete(todo.id);
      }
      return;
    }
    // Alert.alert: 네이티브 확인 다이얼로그
    // 버튼 배열: 취소(cancel), 삭제(destructive - iOS에서 빨간색으로 표시)
    Alert.alert('삭제 확인', `"${todo.text}" 를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  }

  // D-Day 상태에 따른 배지 색상
  const dueDateBadgeColor = {
    far: '#9E9E9E',      // 3일 이상: 회색
    soon: '#FF9800',     // 1~2일: 주황
    today: '#F44336',    // 오늘: 빨강
    overdue: '#B71C1C',  // 기한 초과: 진한 빨강
  }[dueDateStatus ?? 'far'] ?? '#9E9E9E';

  // ─────────────────────────────────────────
  // 수정 모드 UI
  // ─────────────────────────────────────────
  if (editing) {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderLeftColor: priorityColor }]}>
        {/* multiline: 여러 줄 입력 가능, autoFocus: 편집 모드 진입 시 자동으로 포커스 */}
        <TextInput
          style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
          value={editText}
          onChangeText={setEditText}
          autoFocus
          multiline
        />

        {/* 카테고리 선택 */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>카테고리</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.miniChip,
                  { borderColor: CATEGORY_COLORS[c] },
                  editCategory === c && { backgroundColor: CATEGORY_COLORS[c] },
                ]}
                onPress={() => setEditCategory(c)}
              >
                <Text style={[styles.miniChipText, editCategory === c && { color: '#FFF' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 우선순위 선택 */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>우선순위</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.miniChip,
                  { borderColor: PRIORITY_COLORS[p] },
                  editPriority === p && { backgroundColor: PRIORITY_COLORS[p] },
                ]}
                onPress={() => setEditPriority(p)}
              >
                <Text style={[styles.miniChipText, editPriority === p && { color: '#FFF' }]}>
                  {PRIORITY_ICONS[p]} {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 마감일 선택 */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>마감일</Text>
          <View style={styles.chips}>
            {Platform.OS === 'web' ? (
              // 웹: <input type="date">를 칩 스타일로 직접 렌더링
              <input
                type="date"
                value={editDueDate ? timestampToDateStr(editDueDate.getTime()) : ''}
                min={timestampToDateStr(Date.now())}
                onChange={(e) => {
                  if (e.target.value) setEditDueDate(new Date(e.target.value + 'T00:00:00'));
                }}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  paddingLeft: 10,
                  paddingRight: 10,
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontSize: 13,
                  color: colors.text,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <TouchableOpacity
                style={[styles.miniChip, { borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.text, fontSize: 13 }}>
                  {editDueDate ? timestampToDateStr(editDueDate.getTime()) : '날짜 선택'}
                </Text>
              </TouchableOpacity>
            )}
            {editDueDate && (
              <TouchableOpacity
                style={[styles.miniChip, { borderColor: '#F44336' }]}
                onPress={() => setEditDueDate(undefined)}
              >
                <Text style={{ color: '#F44336', fontSize: 13 }}>제거</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {Platform.OS !== 'web' && showDatePicker && (
          <DateTimePicker
            value={editDueDate ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setEditDueDate(date);
            }}
          />
        )}

        {/* 저장 / 취소 버튼 */}
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#6200EE' }]}
            onPress={handleSave}
          >
            <Text style={styles.actionBtnText}>저장</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.cancelBg }]}
            onPress={() => setEditing(false)}
          >
            <Text style={[styles.actionBtnText, { color: colors.subText }]}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────
  // 보기 모드 UI
  // ─────────────────────────────────────────
  return (
    // borderLeftWidth + borderLeftColor: 우선순위에 따라 카드 왼쪽에 색상 줄 표시
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderLeftColor: priorityColor }]}>
      <View style={styles.row}>
        {/* 체크박스 */}
        <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.checkbox}>
          <View style={[
            styles.checkboxBox,
            { borderColor: colors.border },
            todo.completed && styles.checkboxChecked,
          ]}>
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* 할일 내용 영역 */}
        <View style={styles.content}>
          <Text style={[
            styles.todoText,
            { color: colors.text },
            // 완료된 할일: 취소선 + 투명도 낮춤
            todo.completed && styles.todoTextDone,
          ]}>
            {todo.text}
          </Text>

          {/* 배지 영역 (D-Day, 우선순위, 카테고리) */}
          <View style={styles.badges}>
            {/* 마감일 배지: 마감일이 있을 때만 표시 */}
            {todo.dueDate && (
              <View style={[styles.badge, { backgroundColor: dueDateBadgeColor }]}>
                <Text style={styles.badgeText}>{formatDueDateLabel(todo.dueDate)}</Text>
              </View>
            )}
            {/* 우선순위 배지: 색상 22는 hex 투명도(약 13%) */}
            <View style={[styles.badge, {
              backgroundColor: PRIORITY_COLORS[todo.priority] + '22',
              borderWidth: 1,
              borderColor: PRIORITY_COLORS[todo.priority],
            }]}>
              <Text style={[styles.badgeText, { color: PRIORITY_COLORS[todo.priority] }]}>
                {PRIORITY_ICONS[todo.priority]} {todo.priority}
              </Text>
            </View>
            {/* 카테고리 배지 */}
            <View style={[styles.badge, {
              backgroundColor: CATEGORY_COLORS[todo.category] + '22',
              borderWidth: 1,
              borderColor: CATEGORY_COLORS[todo.category],
            }]}>
              <Text style={[styles.badgeText, { color: CATEGORY_COLORS[todo.category] }]}>
                {todo.category}
              </Text>
            </View>
          </View>
        </View>

        {/* 편집/삭제 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => { setEditing(true); setEditText(todo.text); }}
            style={styles.iconBtn}
          >
            <Text style={{ fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const lightColors = {
  cardBg: '#FFF',
  text: '#1A1A1A',
  subText: '#666',
  border: '#E0E0E0',
  inputBg: '#F9F9F9',
  cancelBg: '#F5F5F5',
};

const darkColors = {
  cardBg: '#1E1E1E',
  text: '#F0F0F0',
  subText: '#999',
  border: '#444',
  inputBg: '#2A2A2A',
  cancelBg: '#333',
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderLeftWidth: 4,   // 우선순위 색상 줄
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 세로 기준 상단 정렬
    gap: 10,
  },
  checkbox: {
    paddingTop: 2, // 텍스트와 수직 정렬 맞춤
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  content: {
    flex: 1, // 체크박스와 버튼을 제외한 나머지 공간 모두 차지
    gap: 6,
  },
  todoText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  todoTextDone: {
    textDecorationLine: 'line-through', // 취소선
    opacity: 0.5,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 12,
    minHeight: 60,
  },
  pickerRow: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  miniChipText: {
    fontSize: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
