import React, { useCallback } from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Scale factor on press (default 0.96 for buttons, 0.98 for cards) */
  pressScale?: number;
  /** Animation duration in ms (default 100) */
  duration?: number;
  disabled?: boolean;
}

/**
 * Premium animated pressable with smooth scale feedback.
 * Uses react-native-reanimated for 60fps native-thread animations.
 */
export function AnimatedPressable({
  children,
  onPress,
  onLongPress,
  style,
  pressScale = 0.96,
  duration = 100,
  disabled = false,
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(pressScale, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [pressScale, duration]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
      mass: 0.5,
    });
  }, []);

  return (
    <AnimatedPressableBase
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}

/**
 * Animated card — softer press feedback for image cards and containers.
 */
export function AnimatedCard({
  children,
  onPress,
  onLongPress,
  style,
  disabled,
}: Omit<AnimatedPressableProps, 'pressScale' | 'duration'>) {
  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={style}
      pressScale={0.98}
      duration={120}
      disabled={disabled}
    >
      {children}
    </AnimatedPressable>
  );
}
