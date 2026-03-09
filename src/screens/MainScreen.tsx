import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, StatusBar,
  // FlatList: 긴 목록을 효율적으로 렌더링하는 RN 컴포넌트
  // 웹의 map()과 달리 화면에 보이는 항목만 렌더링해서 메모리를 절약함 (가상화)
  FlatList,
} from 'react-native';
// SafeAreaView: 노치(아이폰 상단 홈), 홈 인디케이터(하단) 등을 피해서 컨텐츠를 배치
// react-native의 SafeAreaView는 deprecated → react-native-safe-area-context 사용 권장
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
  const {
    todos, addTodo, updateTodo, deleteTodo, toggleTodo,
    filter, setFilter, filteredTodos, todoCounts, loading
  } = useTodos(user);

  const colors = theme === 'dark' ? darkColors : lightColors;

  // 진행률 계산
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    // edges: 안전 영역을 적용할 방향 지정 ('top' = 상단 노치 영역만 피함)
    // 하단은 FlatList가 처리하므로 top만 지정
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* StatusBar: 상단 상태바(배터리, 시간 등) 스타일 설정 */}
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* 헤더 */}
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

      {/* 진행률 표시 바 */}
      {totalCount > 0 && (
        <View style={[styles.progressContainer, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.progressText, { color: colors.subText }]}>
            {completedCount} / {totalCount} 완료
          </Text>
          {/* flexGrow로 프로그레스바 구현: width % 대신 비율로 분할 */}
          <View style={[styles.progressBg, { backgroundColor: colors.progressBg }]}>
            <View style={[styles.progressFill, { flexGrow: progressPercent }]} />
            <View style={{ flexGrow: 100 - progressPercent }} />
          </View>
        </View>
      )}

      {/*
        FlatList 사용 이유:
        - todos가 많아도 화면에 보이는 항목만 렌더링 (성능 최적화)
        - ScrollView + map()은 모든 항목을 한 번에 렌더링해서 느려질 수 있음

        ListHeaderComponent: 목록 상단에 고정으로 표시할 컴포넌트
        renderItem: 각 항목을 어떻게 렌더링할지 정의
        ListEmptyComponent: 목록이 비었을 때 표시할 컴포넌트
        keyExtractor: 각 항목의 고유 키 (React의 key prop과 동일한 역할)
      */}
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
        showsVerticalScrollIndicator={false} // 스크롤바 숨기기
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
    flexDirection: 'row', // 채워진 부분과 빈 부분을 가로로 배치
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
