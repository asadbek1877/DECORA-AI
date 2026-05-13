/**
 * ═════════════════════════════════════════════════════════════════
 *  Model Selector Component
 * ═════════════════════════════════════════════════════════════════
 * 
 * Displays available AI models with:
 * - Dynamic model list from backend configuration
 * - Per-model credit costs
 * - Speed/Quality indicators as visual badges
 * - Affordability check (disables models if user lacks credits)
 * - Animated selection with smooth transitions
 * 
 * Props:
 * - selectedModelId: Currently selected model ID
 * - onSelectModel: Callback when user selects a model
 * - availableCredits: User's current credit balance
 * - models: List of available models
 * - disabled: Disable interaction during generation
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useUI } from './new-ui/designSystem';
import { AIModelConfig } from '../types';

interface ModelSelectorProps {
  selectedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  availableCredits: number;
  models: AIModelConfig[];
  disabled?: boolean;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 140;

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  availableCredits,
  models,
  disabled = false,
}) => {
  const { colors, isDark } = useUI();
  const { width: screenWidth } = useWindowDimensions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const canAffordModel = (creditCost: number): boolean => {
    return availableCredits >= creditCost;
  };

  return (
    <View style={[styles.container, { paddingHorizontal: 16 }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose AI Model
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
          Each model offers different quality, speed, and credit costs
        </Text>
      </Animated.View>

      {/* Models Grid/Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {models.map((model, index) => {
          const isSelected = selectedModelId === model.id;
          const isAffordable = canAffordModel(model.creditCost);
          const isExpanded = expandedId === model.id;

          return (
            <Animated.View
              key={model.id}
              entering={FadeInRight.delay(index * 50)}
              style={styles.modelCardWrapper}
            >
              <Pressable
                onPress={() => {
                  if (!disabled && isAffordable) {
                    onSelectModel(model.id);
                    setExpandedId(isExpanded ? null : model.id);
                  }
                }}
                disabled={disabled || !isAffordable}
                style={({ pressed }) => [
                  styles.modelCard,
                  {
                    backgroundColor: isSelected
                      ? colors.primary + '15'
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: isAffordable ? 1 : 0.6,
                    transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }],
                  },
                ]}
              >
                {/* Card Content */}
                <View style={styles.cardHeader}>
                  {/* Icon + Title */}
                  <View style={styles.titleSection}>
                    <Text style={styles.modelIcon}>{model.icon || '🤖'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.modelName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {model.displayName}
                      </Text>
                      <Text
                        style={[
                          styles.modelDescription,
                          { color: colors.muted },
                        ]}
                        numberOfLines={2}
                      >
                        {model.description}
                      </Text>
                    </View>
                  </View>

                  {/* Not Affordable Badge */}
                  {!isAffordable && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.secondary + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.badgeText, { color: colors.secondary }]}
                      >
                        {model.creditCost - availableCredits} more needed
                      </Text>
                    </View>
                  )}
                </View>

                {/* Footer: Speed, Quality, Cost */}
                <View style={styles.cardFooter}>
                  {/* Speed Indicator */}
                  <View style={styles.indicator}>
                    <Text style={styles.speedIcon}>
                      {model.speed === 'fast'
                        ? '⚡'
                        : model.speed === 'medium'
                          ? '⏱️'
                          : '🐢'}
                    </Text>
                    <Text style={[styles.indicatorText, { color: colors.muted }]}>
                      {model.speed}
                    </Text>
                  </View>

                  {/* Quality Indicator */}
                  <View style={styles.indicator}>
                    <Text style={styles.qualityIcon}>
                      {model.quality === 'good'
                        ? '👍'
                        : model.quality === 'excellent'
                          ? '⭐'
                          : '👑'}
                    </Text>
                    <Text style={[styles.indicatorText, { color: colors.muted }]}>
                      {model.quality}
                    </Text>
                  </View>

                  {/* Credit Cost */}
                  <View
                    style={[
                      styles.creditCostBadge,
                      {
                        backgroundColor: isAffordable
                          ? colors.primary + '20'
                          : colors.secondary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.creditCostText,
                        {
                          color: isAffordable ? colors.primary : colors.secondary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {model.creditCost} 💳
                    </Text>
                  </View>
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <Animated.View
                    entering={ZoomIn}
                    style={[
                      styles.selectionCheck,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.checkmark}>✓</Text>
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Credit Info */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        style={[
          styles.creditInfo,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.creditInfoText, { color: colors.muted }]}>
          You have <Text style={{ color: colors.primary, fontWeight: '700' }}>
            {availableCredits}
          </Text>{' '}
          credits available. Each generation costs credits based on the selected model.
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  modelCardWrapper: {
    marginRight: 8,
  },
  modelCard: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  modelIcon: {
    fontSize: 24,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  modelDescription: {
    fontSize: 11,
    lineHeight: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedIcon: {
    fontSize: 12,
  },
  qualityIcon: {
    fontSize: 12,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '500',
  },
  creditCostBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  creditCostText: {
    fontSize: 12,
  },
  selectionCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  creditInfo: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  creditInfoText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
