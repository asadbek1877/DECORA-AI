import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface StyleChip {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const AVAILABLE_STYLES: StyleChip[] = [
  { id: 'modern', label: 'Modern', icon: 'cube-outline', color: '#3525CD' },
  { id: 'luxury', label: 'Luxury', icon: 'diamond-outline', color: '#FFD700' },
  { id: 'minimal', label: 'Minimal', icon: 'square-outline', color: '#9CA3AF' },
  { id: 'japanese', label: 'Japanese', icon: 'leaf-outline', color: '#10B981' },
  { id: 'industrial', label: 'Industrial', icon: 'settings-outline', color: '#64748B' },
  { id: 'bohemian', label: 'Bohemian', icon: 'star-outline', color: '#EC4899' },
];

interface StylePreviewChipsProps {
  onStyleSelect: (style: string) => void;
  selectedStyle?: string;
  isDark: boolean;
  primaryColor: string;
}

export function StylePreviewChips({
  onStyleSelect,
  selectedStyle,
  isDark,
  primaryColor,
}: StylePreviewChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipContainer}
      scrollEventThrottle={16}
    >
      {AVAILABLE_STYLES.map((style, idx) => (
        <Animated.View
          key={style.id}
          entering={FadeInRight.delay(idx * 50).duration(300)}
        >
          <Pressable
            onPress={() => onStyleSelect(style.label)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedStyle === style.label
                    ? primaryColor
                    : isDark
                    ? '#1f2937'
                    : '#f3f4f6',
                borderColor:
                  selectedStyle === style.label ? primaryColor : 'transparent',
              },
            ]}
          >
            <Ionicons
              name={style.icon as any}
              size={20}
              color={
                selectedStyle === style.label
                  ? '#fff'
                  : isDark
                  ? '#9CA3AF'
                  : '#6B7280'
              }
            />
            <Text
              style={[
                styles.chipLabel,
                {
                  color:
                    selectedStyle === style.label
                      ? '#fff'
                      : isDark
                      ? '#D1D5DB'
                      : '#4B5563',
                },
              ]}
            >
              {style.label}
            </Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
