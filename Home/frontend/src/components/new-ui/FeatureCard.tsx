import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable } from './AnimatedPressable';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
  badgeColor?: string;
  badgeText?: string;
  onPress: () => void;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  backgroundColor,
  badgeColor,
  badgeText,
  onPress,
  delay = 0,
}: FeatureCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <AnimatedPressable
        style={[styles.card, { backgroundColor }]}
        onPress={onPress}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={28} color="#fff" />
          </View>
          {badgeText && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.footer}>
          <Text style={styles.ctaText}>Open</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
