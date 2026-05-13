import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Returns an array of Animated.Values that stagger fade-in + slide-up on mount.
 * Usage:
 *   const anims = useEntranceAnimation(4);
 *   <Animated.View style={anims.style(0)}>...</Animated.View>
 *   <Animated.View style={anims.style(1)}>...</Animated.View>
 */
export function useEntranceAnimation(
  count: number,
  options?: { stagger?: number; duration?: number; translateY?: number }
) {
  const { stagger = 100, duration = 450, translateY = 22 } = options || {};

  const values = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.stagger(
      stagger,
      values.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const style = (index: number) => ({
    opacity: values[index],
    transform: [
      {
        translateY: values[index].interpolate({
          inputRange: [0, 1],
          outputRange: [translateY, 0],
        }),
      },
    ],
  });

  return { values, style };
}

/**
 * Returns a press scale animation for buttons/cards.
 * Usage:
 *   const press = usePressAnimation();
 *   <Animated.View style={{ transform: [{ scale: press.scale }] }}>
 *     <TouchableOpacity onPressIn={press.in} onPressOut={press.out}>
 */
export function usePressAnimation(toValue = 0.95) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return { scale, in: pressIn, out: pressOut };
}
