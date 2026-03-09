import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { User } from '@supabase/supabase-js';
import { useTodos } from '../hooks/useTodos';
import { Theme } from '../hooks/useTheme';
import { AddTodo } from '../components/AddTodo/AddTodo';
import { TodoItem } from '../components/TodoItem/TodoItem';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';

interface Props {
  user: User;
  onSignOut: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function MainScreen({ user, onSignOut, theme, onToggleTheme }: Props) {
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodo, filter, setFilter, filteredTodos, todoCounts, loading } = useTodos(user);

  const colors = theme === 'dark' ? darkColors : lightColors;

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>✅ DoneIt</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onToggleTheme} style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignOut} style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress */}
      {totalCount > 0 && (
        <View style={[styles.progressContainer, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.progressText, { color: colors.subText }]}>
            {completedCount} / {totalCount} 완료
          </Text>
          {/* [fix] `as any` 제거 - flexGrow로 프로그레스바 구현 */}
          <View style={[styles.progressBg, { backgroundColor: colors.progressBg }]}>
            <View style={[styles.progressFill, { flexGrow: progressPercent }]} />
            <View style={{ flexGrow: 100 - progressPercent }} />
          </View>
        </View>
      )}

      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <AddTodo onAdd={addTodo} theme={theme} />
            <CategoryFilter
              filter={filter}
              onFilterChange={setFilter}
              todoCounts={todoCounts}
              theme={theme}
            />
            {loading && (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#6200EE" />
            )}
          </>
        }
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            theme={theme}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={[styles.emptyText, { color: colors.subText }]}>
                {filter === 'all' ? '할일이 없습니다' : '해당하는 할일이 없습니다'}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const lightColors = {
  bg: '#F5F0FF',
  headerBg: '#FFF',
  cardBg: '#FFF',
  text: '#1A1A1A',
  subText: '#666',
  border: '#E0E0E0',
  progressBg: '#E0E0E0',
};

const darkColors = {
  bg: '#121212',
  headerBg: '#1A1A1A',
  cardBg: '#1E1E1E',
  text: '#F0F0F0',
  subText: '#999',
  border: '#333',
  progressBg: '#333',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  progressContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 3,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 15,
  },
});
