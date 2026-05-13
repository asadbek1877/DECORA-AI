import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const FooterLinks = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity><Text style={styles.link}>Privacy</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.link}>Terms</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.link}>Social</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  link: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
});
