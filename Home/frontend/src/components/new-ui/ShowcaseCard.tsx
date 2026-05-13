import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable } from './AnimatedPressable';

interface ShowcaseCardProps {
  icon: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  backgroundColor: string;
  onPress: () => void;
  delay?: number;
}

export function ShowcaseCard({
  icon,
  title,
  description,
  beforeImage,
  afterImage,
  backgroundColor,
  onPress,
  delay = 0,
}: ShowcaseCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(400)}
    >
      <AnimatedPressable
        style={[styles.card, { backgroundColor }]}
        onPress={onPress}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={icon as any} size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </View>

        {/* BEFORE/AFTER PREVIEW */}
        <View style={styles.previewSection}>
          <View style={styles.previewRow}>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: beforeImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Text style={styles.previewLabel}>Before</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color="rgba(255,255,255,0.6)" />
            </View>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: afterImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Text style={styles.previewLabel}>After</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Try it now</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
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
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  previewSection: {
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 6,
  },
  previewImage: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  previewLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
