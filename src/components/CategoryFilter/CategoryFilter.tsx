import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Filter, CATEGORIES, CATEGORY_COLORS } from '../../types/todo';
import { Theme } from '../../hooks/useTheme';

interface Props {
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  todoCounts: Record<Filter, number>;
  theme: Theme;
}

export function CategoryFilter({ filter, onFilterChange, todoCounts, theme }: Props) {
  const colors = theme === 'dark' ? darkColors : lightColors;

  const filters: Array<{ key: Filter; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘 마감' },
    ...CATEGORIES.map((c) => ({ key: c as Filter, label: c })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map(({ key, label }) => {
        const isActive = filter === key;
        const accentColor = CATEGORIES.includes(key as never)
          ? CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS]
          : key === 'today' ? '#E91E63' : '#6200EE';

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.chip,
              { backgroundColor: colors.chipBg, borderColor: colors.chipBorder },
              isActive && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => onFilterChange(key)}
          >
            <Text style={[styles.chipText, { color: colors.chipText }, isActive && styles.chipTextActive]}>
              {label}
            </Text>
            <View style={[styles.badge, isActive ? styles.badgeActive : { backgroundColor: colors.badgeBg }]}>
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
    borderRadius: 20,
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
    minWidth: 20,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
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
