import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeStore } from '../../store/themeStore';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  strong?: boolean;
  intensity?: number;
}

export const GlassCard = ({ children, style, strong, intensity }: GlassCardProps) => {
  const { mode, colors: theme } = useThemeStore();
  const blurIntensity = intensity ?? (strong ? 40 : 24);
  const isDark = mode === 'dark';

  return (
    <BlurView
      intensity={blurIntensity}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.card,
        strong ? styles.strong : styles.normal,
        {
          backgroundColor: isDark ? 'rgba(21, 32, 38, 0.86)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  normal: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  strong: {
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
});
