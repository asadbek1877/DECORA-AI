import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography, shadows } from '../theme';
import { DesignStyle } from '../types';

interface StyleCardProps {
  style: DesignStyle;
  isSelected?: boolean;
  onPress: () => void;
  previewImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StyleCard: React.FC<StyleCardProps> = ({
  style,
  isSelected = false,
  onPress,
  previewImageUrl,
  size = 'md',
}) => {
  const cardSizes: Record<string, ViewStyle> = {
    sm: { width: 120, height: 160 },
    md: { width: 160, height: 200 },
    lg: { width: '100%' as const, height: 220 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        cardSizes[size],
        shadows.md,
        isSelected && styles.cardSelected,
      ]}
    >
      <View style={styles.paletteRow}>
        {style.colorPalette.slice(0, 5).map((color: string, index: number) => (
          <View
            key={index}
            style={[styles.colorDot, { backgroundColor: color }]}
          />
        ))}
      </View>

      {previewImageUrl ? (
        <Image
          source={{ uri: previewImageUrl }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={
            style.colorPalette.length >= 2
              ? [style.colorPalette[0], style.colorPalette[1]]
              : ['#CCCCCC', '#EEEEEE']
          }
          style={styles.gradientPlaceholder}
        />
      )}

      <View style={styles.info}>
        <Text style={styles.styleName} numberOfLines={1}>
          {style.displayName}
        </Text>
        <Text style={styles.styleDesc} numberOfLines={2}>
          {style.description}
        </Text>
      </View>

      {isSelected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  paletteRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  previewImage: {
    width: '100%',
    height: 80,
  },
  gradientPlaceholder: {
    width: '100%',
    height: 80,
    opacity: 0.3,
  },
  info: {
    padding: spacing.sm,
    flex: 1,
  },
  styleName: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  styleDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
