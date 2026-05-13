import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  imageUri?: string;
}

export const GradientBackground = ({ imageUri }: GradientBackgroundProps) => {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const bgImage = imageUri || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=60';

  // Floating bubble animations
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createFloat = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );

    createFloat(float1, 4000).start();
    createFloat(float2, 5000).start();
  }, []);

  const floatTranslate1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const floatTranslate2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Background image */}
      <ImageBackground
        source={{ uri: bgImage }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Dark overlay */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(9,13,15,0.9)', 'rgba(12,18,22,0.95)', 'rgba(8,12,15,0.98)']
            : ['rgba(248,255,254,0.82)', 'rgba(240,255,253,0.9)', 'rgba(232,247,247,0.95)']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Glass bubble decorations */}
      <Animated.View style={[styles.bubble, isDark ? styles.bubbleDark : styles.bubbleLight, styles.bubble1, { transform: [{ translateY: floatTranslate1 }] }]} />
      <Animated.View style={[styles.bubble, isDark ? styles.bubbleDark : styles.bubbleLight, styles.bubble2, { transform: [{ translateY: floatTranslate2 }] }]} />
      <Animated.View style={[styles.bubble, isDark ? styles.bubbleDark : styles.bubbleLight, styles.bubble3, { transform: [{ translateY: floatTranslate1 }] }]} />
      <Animated.View style={[styles.bubble, isDark ? styles.bubbleDark : styles.bubbleLight, styles.bubble4, { transform: [{ translateY: floatTranslate2 }] }]} />

      {/* Faint grid lines */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[
              styles.gridLineVertical,
              isDark ? styles.gridLineDark : styles.gridLineLight,
              { left: (width / 6) * (i + 1) },
            ]}
          />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={[
              styles.gridLineHorizontal,
              isDark ? styles.gridLineDark : styles.gridLineLight,
              { top: (height / 8) * (i + 1) },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bubbleLight: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  bubbleDark: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  bubble1: {
    width: 180,
    height: 180,
    top: -40,
    right: -50,
  },
  bubble2: {
    width: 120,
    height: 120,
    top: height * 0.3,
    left: -40,
  },
  bubble3: {
    width: 80,
    height: 80,
    bottom: height * 0.25,
    right: 30,
  },
  bubble4: {
    width: 200,
    height: 200,
    bottom: -60,
    left: -60,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  gridLineLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  gridLineDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
