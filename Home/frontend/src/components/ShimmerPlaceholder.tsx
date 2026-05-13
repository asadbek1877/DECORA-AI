import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Simple shimmer using RN Animated (no react-native-reanimated)

interface ShimmerPlaceholderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width: w,
  height: h,
  borderRadius: br = 12,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ width: w as any, height: h, borderRadius: br, backgroundColor: 'rgba(13,242,242,0.08)', opacity: anim }, style]}
    />
  );
};

interface ImageShimmerProps {
  height: number;
  style?: ViewStyle;
}

export const ImageShimmer: React.FC<ImageShimmerProps> = ({ height, style }) => {
  return (
    <View style={[{ height, borderRadius: 24, backgroundColor: 'rgba(16,34,34,0.8)', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }, style]}>
      <ActivityIndicator color="#0df2f2" size="large" />
    </View>
  );
};

interface GeneratingOverlayProps {
  height: number;
  message?: string;
}

export const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({
  height,
  message = 'Creating your design...',
}) => {
  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient colors={['#102222', '#0a1a1a', '#102222']} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <ActivityIndicator color="#0df2f2" size="large" />
        <Animated.Text style={[styles.text, { opacity: pulse }]}>{message}</Animated.Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.dot} />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 16 },
  text: { color: '#f0fafa', fontSize: 16, fontWeight: '600', marginTop: 8 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0df2f2' },
});
