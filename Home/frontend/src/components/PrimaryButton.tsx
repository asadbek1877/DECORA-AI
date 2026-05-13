import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const PrimaryButton = () => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.button}>
      <Text style={styles.text}>Get Started</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0C8CE9',
    paddingHorizontal: spacing.xl + 8,
    paddingVertical: spacing.md,
    borderRadius: 30,
    alignSelf: 'flex-start',
    shadowColor: '#0C8CE9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
});
