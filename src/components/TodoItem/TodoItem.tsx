import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Alert, Platform,
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
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'text' | 'category' | 'priority' | 'dueDate'>>) => void;
  theme: Theme;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate, theme }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    todo.dueDate ? new Date(todo.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colors = theme === 'dark' ? darkColors : lightColors;
  const dueDateStatus = getDueDateStatus(todo.dueDate);
  const priorityColor = PRIORITY_COLORS[todo.priority];

  function handleSave() {
    if (!editText.trim()) return;
    onUpdate(todo.id, {
      text: editText.trim(),
      category: editCategory,
      priority: editPriority,
      dueDate: editDueDate ? toMidnightTimestamp(timestampToDateStr(editDueDate.getTime())) : undefined,
    });
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('삭제 확인', `"${todo.text}" 를 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  }

  const dueDateBadgeColor = {
    far: '#9E9E9E',
    soon: '#FF9800',
    today: '#F44336',
    overdue: '#B71C1C',
  }[dueDateStatus ?? 'far'] ?? '#9E9E9E';

  if (editing) {
    return (
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderLeftColor: priorityColor }]}>
        <TextInput
          style={[styles.editInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
          value={editText}
          onChangeText={setEditText}
          autoFocus
          multiline
        />

        {/* Category picker */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>카테고리</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.miniChip, { borderColor: CATEGORY_COLORS[c] }, editCategory === c && { backgroundColor: CATEGORY_COLORS[c] }]}
                onPress={() => setEditCategory(c)}
              >
                <Text style={[styles.miniChipText, editCategory === c && { color: '#FFF' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority picker */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>우선순위</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.miniChip, { borderColor: PRIORITY_COLORS[p] }, editPriority === p && { backgroundColor: PRIORITY_COLORS[p] }]}
                onPress={() => setEditPriority(p)}
              >
                <Text style={[styles.miniChipText, editPriority === p && { color: '#FFF' }]}>{PRIORITY_ICONS[p]} {p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due date */}
        <View style={styles.pickerRow}>
          <Text style={[styles.pickerLabel, { color: colors.subText }]}>마감일</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              style={[styles.miniChip, { borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                {editDueDate ? timestampToDateStr(editDueDate.getTime()) : '날짜 선택'}
              </Text>
            </TouchableOpacity>
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

        {showDatePicker && (
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

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderLeftColor: priorityColor }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.checkbox}>
          <View style={[styles.checkboxBox, { borderColor: colors.border }, todo.completed && styles.checkboxChecked]}>
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.todoText, { color: colors.text }, todo.completed && styles.todoTextDone]}>
            {todo.text}
          </Text>
          <View style={styles.badges}>
            {todo.dueDate && (
              <View style={[styles.badge, { backgroundColor: dueDateBadgeColor }]}>
                <Text style={styles.badgeText}>{formatDueDateLabel(todo.dueDate)}</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[todo.priority] + '22', borderWidth: 1, borderColor: PRIORITY_COLORS[todo.priority] }]}>
              <Text style={[styles.badgeText, { color: PRIORITY_COLORS[todo.priority] }]}>
                {PRIORITY_ICONS[todo.priority]} {todo.priority}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: CATEGORY_COLORS[todo.category] + '22', borderWidth: 1, borderColor: CATEGORY_COLORS[todo.category] }]}>
              <Text style={[styles.badgeText, { color: CATEGORY_COLORS[todo.category] }]}>{todo.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => { setEditing(true); setEditText(todo.text); }} style={styles.iconBtn}>
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    paddingTop: 2,
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
    flex: 1,
    gap: 6,
  },
  todoText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
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
