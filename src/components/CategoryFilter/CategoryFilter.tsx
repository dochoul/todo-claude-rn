import React from 'react';
// ScrollView: 내용이 화면을 벗어날 때 스크롤 가능하게 함
// horizontal: 가로 스크롤 (기본값은 세로 스크롤)
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Filter, CATEGORIES, CATEGORY_COLORS } from '../../types/todo';
import { Theme } from '../../hooks/useTheme';

interface Props {
  filter: Filter;            // 현재 선택된 필터
  onFilterChange: (f: Filter) => void; // 필터 변경 콜백
  todoCounts: Record<Filter, number>;  // 각 필터별 할일 개수
  theme: Theme;
}

export function CategoryFilter({ filter, onFilterChange, todoCounts, theme }: Props) {
  const colors = theme === 'dark' ? darkColors : lightColors;

  // 표시할 필터 목록 정의
  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘 마감' },
    // CATEGORIES 배열을 Filter 타입으로 변환해서 추가
    ...CATEGORIES.map((c) => ({ key: c as Filter, label: c })),
  ];

  return (
    // horizontal: 가로 방향 스크롤
    // showsHorizontalScrollIndicator={false}: 가로 스크롤바 숨기기
    // contentContainerStyle: ScrollView 내부 컨테이너의 스타일 (style은 외부 래퍼에 적용됨)
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(({ key, label }) => {
        const isActive = filter === key;
        // 각 필터 버튼의 강조 색상 결정
        const accentColor = CATEGORIES.includes(key as never)
          ? CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] // 카테고리: 해당 카테고리 색상
          : key === 'today' ? '#E91E63'  // 오늘 마감: 핑크
          : '#6200EE';                    // 전체: 보라

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              { backgroundColor: colors.chipBg, borderColor: colors.chipBorder },
              // 선택된 필터만 강조 색상으로 배경 채우기
              isActive && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => onFilterChange(key)}
          >
            <Text style={[
              styles.chipText,
              { color: colors.chipText },
              isActive && styles.chipTextActive, // 선택 시 텍스트 흰색으로
            ]}>
              {label}
            </Text>
            {/* 각 필터에 해당하는 할일 개수 배지 */}
            <View style={[
              styles.badge,
              isActive ? styles.badgeActive : { backgroundColor: colors.badgeBg },
            ]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {todoCounts[key] ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const lightColors = {
  chipBg: '#F5F5F5',
  chipBorder: '#E0E0E0',
  chipText: '#555',
  badgeBg: '#E0E0E0',
};

const darkColors = {
  chipBg: '#2A2A2A',
  chipBorder: '#444',
  chipText: '#BBB',
  badgeBg: '#444',
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, // 완전한 알약 모양을 위해 높이의 절반 이상으로 설정
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFF',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,        // 한 자리 숫자도 원형으로 보이도록 최소 너비 설정
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)', // 선택 시 반투명 흰색
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
  },
  badgeTextActive: {
    color: '#FFF',
  },
});
