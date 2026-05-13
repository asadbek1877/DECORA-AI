import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Upload',
    description: 'Choose or take a photo',
    icon: 'image-outline',
  },
  {
    number: 2,
    title: 'Choose',
    description: 'Select your style',
    icon: 'color-palette-outline',
  },
  {
    number: 3,
    title: 'Generate',
    description: 'AI creates magic',
    icon: 'sparkles',
  },
];

interface QuickStepsProps {
  primaryColor: string;
  isDark: boolean;
  textColor: string;
  mutedColor: string;
}

export function QuickSteps({
  primaryColor,
  isDark,
  textColor,
  mutedColor,
}: QuickStepsProps) {
  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => (
        <Animated.View
          key={step.number}
          entering={FadeInUp.delay(idx * 100).duration(400)}
          style={styles.stepWrapper}
        >
          {/* Connector line */}
          {idx < STEPS.length - 1 && (
            <View
              style={[
                styles.connector,
                { backgroundColor: `${primaryColor}40` },
              ]}
            />
          )}

          {/* Step content */}
          <View style={styles.stepContent}>
            {/* Icon circle */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${primaryColor}20`, borderColor: primaryColor },
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={28}
                color={primaryColor}
              />
            </View>

            {/* Text */}
            <View style={styles.textGroup}>
              <View style={styles.stepNumberAndTitle}>
                <Text style={[styles.stepNumber, { color: primaryColor }]}>
                  {step.number.toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.stepTitle, { color: textColor }]}>
                  {step.title}
                </Text>
              </View>
              <Text style={[styles.stepDescription, { color: mutedColor }]}>
                {step.description}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  stepWrapper: {
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 43,
    top: 68,
    width: 2,
    height: 40,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 4,
  },
  stepNumberAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
