import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface SocialLoginProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
}

export const SocialLogin = ({ onGooglePress, onApplePress }: SocialLoginProps) => {
  const { colors: theme } = useThemeStore();

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.textSecondary }]}>or continue with</Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          activeOpacity={0.7}
          onPress={onGooglePress}
        >
          <Ionicons name="logo-google" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          activeOpacity={0.7}
          onPress={onApplePress}
        >
          <Ionicons name="logo-apple" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(29, 29, 31, 0.4)',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
