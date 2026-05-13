import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  ZoomIn,
  Easing,
} from 'react-native-reanimated';

interface FloatingCTAProps {
  onPress: () => void;
  primaryColor: string;
  isDark: boolean;
  label?: string;
}

export function FloatingCTA({
  onPress,
  primaryColor,
  isDark,
  label = 'Start redesign',
}: FloatingCTAProps) {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.4);
  const pulseScale = useSharedValue(1);

  // Pulse animation
  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.08, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {
      damping: 10,
      mass: 0.8,
      stiffness: 400,
    });
    shadowOpacity.value = withTiming(0.2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      mass: 0.8,
      stiffness: 400,
    });
    shadowOpacity.value = withTiming(0.4);
  };

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.6 - (pulseScale.value - 1) * 0.6,
  }));

  return (
    <View style={styles.container}>
      {/* Pulse glow background */}
      <Animated.View
        style={[
          styles.pulseGlow,
          pulseStyle,
          {
            backgroundColor: primaryColor,
            shadowColor: primaryColor,
          },
        ]}
      />

      {/* Main button */}
      <Animated.View
        entering={ZoomIn.duration(400).delay(300)}
        style={[scaleStyle, shadowStyle, styles.shadowContainer]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            {
              backgroundColor: primaryColor,
            },
          ]}
        >
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pulseGlow: {
    position: 'absolute',
    width: 240,
    height: 60,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  sparkle: {
    fontSize: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
