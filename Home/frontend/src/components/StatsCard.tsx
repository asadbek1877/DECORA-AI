import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const StatsCard = () => {
  return (
    <BlurView intensity={50} tint="light" style={styles.card}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>AI Designs Generated:</Text>
        <Text style={styles.statValue}>1M+</Text>
      </View>
      
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Styles:</Text>
        <Text style={styles.statValue}>50+</Text>
      </View>
      
      <View style={[styles.statItem, styles.lastItem]}>
        <Text style={styles.statLabel}>Users:</Text>
        <Text style={styles.statValue}>100k+</Text>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    padding: spacing.lg,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  statItem: {
    marginBottom: spacing.lg,
  },
  lastItem: {
    marginBottom: 0,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textDark,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.textDark,
  },
});
