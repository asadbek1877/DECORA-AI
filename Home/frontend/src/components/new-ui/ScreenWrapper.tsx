import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface ScreenWrapperProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Entry animation duration (default 260ms) */
  duration?: number;
  /** Delay before animation starts (default 0) */
  delay?: number;
  /** Skip animation entirely and show content instantly */
  instant?: boolean;
}

/**
 * Wraps a screen with smooth fade + subtle slide entry animation.
 * Starts at 0.6 opacity (not 0) to avoid flash/blink issues.
 */
export function ScreenWrapper({
  children,
  style,
  duration = 260,
  delay = 0,
  instant = false,
}: ScreenWrapperProps) {
  const progress = useSharedValue(instant ? 1 : 0);

  useEffect(() => {
    if (instant) return;
    const timer = setTimeout(() => {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.3, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [8, 0]) },
    ],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  /** Slide distance in pixels (default 12) */
  slideDistance?: number;
  /** Direction: 'up' (default) | 'down' | 'left' | 'right' | 'none' */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * Reusable fade-in + directional slide animation for individual elements.
 * Starts at 0.2 opacity (not 0) to avoid flash issues.
 */
export function FadeInView({
  children,
  delay = 0,
  duration = 320,
  style,
  slideDistance = 14,
  direction = 'up',
}: FadeInViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const offset = interpolate(progress.value, [0, 1], [slideDistance, 0]);
    const transforms: any[] = [];

    if (direction === 'up') transforms.push({ translateY: offset });
    else if (direction === 'down') transforms.push({ translateY: -offset });
    else if (direction === 'left') transforms.push({ translateX: offset });
    else if (direction === 'right') transforms.push({ translateX: -offset });

    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      transform: transforms,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
