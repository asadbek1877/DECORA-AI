import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
  cancelAnimation,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HANDLE_SIZE = 48;

interface ImageCompareProps {
  beforeUri: string;
  afterUri: string;
  height?: number;
  autoPlay?: boolean;
}

export const ImageCompare: React.FC<ImageCompareProps> = ({
  beforeUri,
  afterUri,
  height = 400,
  autoPlay = false,
}) => {
  const containerWidth = SCREEN_WIDTH - 40;
  
  // Shared value for slider position
  const sliderX = useSharedValue(containerWidth / 2);
  const startX = useSharedValue(containerWidth / 2);
  const [isInteracting, setIsInteracting] = useState(false);

  // Auto-play animation
    useEffect(() => {
      if (!autoPlay || isInteracting) {
        cancelAnimation(sliderX); // 🔥 ЭНГ МУҲИМ
        return;
      }

      sliderX.value = withRepeat(
        withSequence(
          withTiming(containerWidth * 0.75, {
            duration: 2500,
            easing: Easing.inOut(Easing.cubic),
          }),
          withTiming(containerWidth * 0.25, {
            duration: 2500,
            easing: Easing.inOut(Easing.cubic),
          })
        ),
        -1,
        true
      );

      return () => {
        cancelAnimation(sliderX);
      };
    }, [autoPlay, isInteracting, containerWidth]);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = sliderX.value;
      runOnJS(setIsInteracting)(true);
    })
    .onUpdate((e) => {
      const newX = startX.value + e.translationX;
      const clamped = Math.max(0, Math.min(containerWidth, newX));
      sliderX.value = clamped;
    })
    .onEnd(() => {
      runOnJS(setIsInteracting)(false);
    });

  // Animated style for before container (clipping via width ONLY)
  const beforeContainerAnimStyle = useAnimatedStyle(() => {
    return {
      width: sliderX.value,
    };
  });

  // Animated style for slider line
  const sliderLineAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderX.value }],
    };
  });

  // Animated style for handle
  const handleAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            sliderX.value,
            [0, containerWidth],
            [-HANDLE_SIZE / 2, containerWidth - HANDLE_SIZE / 2]
          ),
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { height, width: containerWidth }]}>
        {/* AFTER image - Full background (never moves) */}
        <Image
          source={{ uri: afterUri }}
          style={[styles.image, { height, width: containerWidth }]}
          resizeMode="cover"
        />

        {/* BEFORE image - Clipped container (width only changes) */}
        <Animated.View
          style={[
            styles.beforeContainer,
            { 
              height,
            },
            beforeContainerAnimStyle,
          ]}
        >
          <Image
            source={{ uri: beforeUri }}
            style={[
              styles.image,
              { 
                height,
                width: containerWidth,
              },
            ]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Slider line - Only moves horizontally */}
        <Animated.View
          style={[styles.sliderLine, { height }, sliderLineAnimStyle]}
        />

        {/* Handle - Circular control (only horizontal position changes) */}
        <Animated.View
          style={[
            styles.handleContainer,
            { top: height / 2 - HANDLE_SIZE / 2 },
            handleAnimStyle,
          ]}
        >
          <View style={styles.sliderHandle}>
            <Ionicons name="chevron-back" size={14} color="#0df2f2" />
            <View style={styles.handleDivider} />
            <Ionicons name="chevron-forward" size={14} color="#0df2f2" />
          </View>
        </Animated.View>

        {/* Labels */}
        <View style={styles.labelBefore}>
          <View style={styles.labelPill}>
            <View style={[styles.labelDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.labelText}>Before</Text>
          </View>
        </View>
        <View style={styles.labelAfter}>
          <View style={styles.labelPill}>
            <View style={[styles.labelDot, { backgroundColor: '#51CF66' }]} />
            <Text style={styles.labelText}>After</Text>
          </View>
        </View>

        {/* Hint */}
        <View style={styles.hintContainer}>
          <View style={styles.hintPill}>
            <Ionicons name="swap-horizontal" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.hintText}>Drag to compare</Text>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beforeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  handleContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 20,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderHandle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  handleDivider: {
    width: 1.5,
    height: 16,
    backgroundColor: '#0df2f2',
    opacity: 0.4,
    marginHorizontal: 1,
  },
  labelBefore: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 5,
  },
  labelAfter: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  labelDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
});
