import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, typography, spacing, shadows } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const sizeStyles: Record<string, { paddingHorizontal: number; paddingVertical: number; minHeight: number }> = {
    sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
    md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 48 },
    lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, minHeight: 56 },
  };

  const textSizes: Record<string, { fontSize: number }> = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={isDisabled ? ['#B0B0B0', '#A0A0A0'] : [...colors.gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            sizeStyles[size],
            shadows.md,
            { borderRadius: borderRadius.lg },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.textPrimary, textSizes[size], textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: {
      backgroundColor: colors.surfaceAlt,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const variantTextStyles: Record<string, TextStyle> = {
    secondary: { color: colors.text },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        { borderRadius: borderRadius.lg },
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, variantTextStyles[variant], textSizes[size], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  textBase: {
    fontWeight: '600',
  },
});
