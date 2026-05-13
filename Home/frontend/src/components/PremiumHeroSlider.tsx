import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Image, Text, PanResponder, Animated as RNAnimated } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BeforeAfterPair {
  id: number;
  before: any;
  after: any;
}

const imageGroups: BeforeAfterPair[] = [
  {
    id: 1,
    before: require('../../assets/images/demo/1/before.webp'),
    after: require('../../assets/images/demo/1/after.png'),
  },
  {
    id: 2,
    before: require('../../assets/images/demo/2/before.webp'),
    after: require('../../assets/images/demo/2/after.png'),
  },
  {
    id: 3,
    before: require('../../assets/images/demo/3/before.webp'),
    after: require('../../assets/images/demo/3/after.png'),
  },
];

interface PremiumHeroSliderProps {
  height?: number;
  autoPlay?: boolean;
}

export function PremiumHeroSlider({
  height = 420,
  autoPlay = true,
}: PremiumHeroSliderProps) {
  const sliderPosition = useSharedValue(50);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const containerWidth = useRef(0);
  const rotationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationLoop = useRef<boolean>(true);

  const currentImages = imageGroups[currentImageIndex];

  // Handle image rotation every 2 minutes
  useEffect(() => {
    rotationInterval.current = setInterval(() => {
      setShowTransition(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageGroups.length);
        setShowTransition(false);
      }, 300);
    }, 120000); // 2 minutes

    return () => {
      if (rotationInterval.current) clearInterval(rotationInterval.current);
    };
  }, []);

  // Auto-animation: 0% → 100% → 0% in 6.5 seconds
  useEffect(() => {
    if (autoPlay && isAnimating && animationLoop.current) {
      sliderPosition.value = withRepeat(
        withTiming(100, {
          duration: 3250, // 6.5s total
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [autoPlay, isAnimating]);

  // Pan responder for manual drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animationLoop.current = false;
        setIsAnimating(false);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        const percentage = Math.max(
          0,
          Math.min(100, ((dx / containerWidth.current) * 100 + sliderPosition.value))
        );
        sliderPosition.value = percentage;
      },
      onPanResponderRelease: () => {
        setTimeout(() => {
          animationLoop.current = true;
          setIsAnimating(true);
        }, 2000);
      },
    })
  ).current;

  const afterWidthAnimatedStyle = useAnimatedStyle(() => ({
    width: `${sliderPosition.value}%`,
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    left: `${sliderPosition.value}%`,
  }));

  return (
    <Animated.View
      style={[styles.container, { height }]}
      {...panResponder.panHandlers}
      onLayout={(evt) => {
        containerWidth.current = evt.nativeEvent.layout.width;
      }}
    >
      {/* BEFORE IMAGE - Static background */}
      <Image
        source={currentImages.before}
        style={[styles.image, { height }]}
        resizeMode="cover"
      />

      {/* AFTER IMAGE - Revealed from left to right */}
      <Animated.View
        style={[
          styles.afterContainer,
          afterWidthAnimatedStyle,
          { height },
          showTransition && styles.fadeTransition,
        ]}
      >
        <Image
          source={currentImages.after}
          style={[styles.image, { height }]}
          resizeMode="cover"
        />
      </Animated.View>

      {/* DIVIDER LINE */}
      <Animated.View style={[styles.dividerLine, dividerAnimatedStyle]} />

      {/* CORNER BADGES */}
      <View style={[styles.badge, styles.badgeLeft]}>
        <Text style={styles.badgeText}>BEFORE</Text>
      </View>
      <View style={[styles.badge, styles.badgeRight]}>
        <Text style={styles.badgeText}>AFTER</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
  },
  // AFTER image container (clipped to width)
  afterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  fadeTransition: {
    opacity: 0.7,
  },
  // Divider line
  dividerLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 10,
  },
  // Badges
  badge: {
    position: 'absolute',
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    zIndex: 5,
  },
  badgeLeft: {
    left: 16,
  },
  badgeRight: {
    right: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
