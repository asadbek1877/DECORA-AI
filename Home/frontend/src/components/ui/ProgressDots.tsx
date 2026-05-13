import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressDotsProps {
  activeIndex: number;
  total?: number;
}

export const ProgressDots = ({ activeIndex, total = 3 }: ProgressDotsProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) =>
        i === activeIndex ? (
          <LinearGradient
            key={i}
            colors={['#1D1D1F', '#3A3A3C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeDot}
          />
        ) : (
          <View key={i} style={styles.inactiveDot} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
});
