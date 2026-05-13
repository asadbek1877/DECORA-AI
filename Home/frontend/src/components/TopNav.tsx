import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const TopNav = () => {
  return (
    <View style={styles.container}>
      {/* Decore Logo */}
      <Text style={styles.logo}>
        Decore<Text style={styles.logoDot}>.</Text>
      </Text>

      {/* Right Menu Pills */}
      <BlurView intensity={40} tint="light" style={styles.menuBlur}>
        <View style={styles.menuContainer}>
          {['Features', 'Pricing', 'Gallery', 'Contact'].map((item) => (
            <TouchableOpacity key={item} style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? spacing.xl : spacing.md,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  logo: {
    ...typography.h3,
    color: colors.textDark,
  },
  logoDot: {
    color: colors.primary,
  },
  menuBlur: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  menuItem: {
    paddingHorizontal: spacing.sm,
  },
  menuText: {
    ...typography.bodySmall,
    color: colors.textDark,
    opacity: 0.8,
  },
});
