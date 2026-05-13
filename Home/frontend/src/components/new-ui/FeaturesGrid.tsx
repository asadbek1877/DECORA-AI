import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { FeatureCard } from './FeatureCard';

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
  badgeColor?: string;
  badgeText?: string;
  onPress: () => void;
}

interface FeaturesGridProps {
  features: Feature[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <View style={styles.container}>
      {/* Two columns grid */}
      <View style={styles.grid}>
        {features.map((feature, index) => (
          <View key={feature.id} style={[styles.column, { width: '48%' }]}>
            <FeatureCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              backgroundColor={feature.backgroundColor}
              badgeColor={feature.badgeColor}
              badgeText={feature.badgeText}
              onPress={feature.onPress}
              delay={index * 100}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  column: {
    gap: 12,
  },
});
