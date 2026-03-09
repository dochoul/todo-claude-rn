import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Category, Priority, CATEGORIES, PRIORITIES, CATEGORY_COLORS, PRIORITY_COLORS, PRIORITY_ICONS, timestampToDateStr, toMidnightTimestamp } from '../../types/todo';
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
  const [expanded, setExpanded] = useState(false);

  const colors = theme === 'dark' ? darkColors : lightColors;

  function handleAdd() {
    if (!text.trim()) return;
    const dueDateTs = dueDate ? toMidnightTimestamp(timestampToDateStr(dueDate.getTime())) : undefined;
    onAdd(text.trim(), category, priority, dueDateTs);
    setText('');
    setDueDate(undefined);
    setExpanded(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
          placeholder="새 할일 추가..."
          placeholderTextColor={colors.placeholder}
          value={text}
          onChangeText={(v) => { setText(v); if (v && !expanded) setExpanded(true); }}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, !text.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!text.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.options}>
          {/* Category */}
          <Text style={[styles.optionLabel, { color: colors.subText }]}>카테고리</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, { borderColor: CATEGORY_COLORS[c] }, category === c && { backgroundColor: CATEGORY_COLORS[c] }]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.chipText, { color: category === c ? '#FFF' : CATEGORY_COLORS[c] }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority */}
          <Text style={[styles.optionLabel, { color: colors.subText }]}>우선순위</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, { borderColor: PRIORITY_COLORS[p] }, priority === p && { backgroundColor: PRIORITY_COLORS[p] }]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.chipText, { color: priority === p ? '#FFF' : PRIORITY_COLORS[p] }]}>
                  {PRIORITY_ICONS[p]} {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Due date */}
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

          {showDatePicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => {
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

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
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
    flexWrap: 'wrap',
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
