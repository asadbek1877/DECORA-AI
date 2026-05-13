import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, ScrollView, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useUI } from './new-ui/designSystem';

const { width } = Dimensions.get('window');

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  style?: string;
  title?: string;
}

/**
 * BeforeAfterSlider Component
 * Interactive slider to compare before and after images
 * Supports: dragging, tapping (toggle between images), and style selection
 */
export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  style,
  title
}) => {
  const { colors, isDark } = useUI();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showAfter, setShowAfter] = useState(true);
  const animatedPosition = useSharedValue(50);

  const handleSlide = (position: number) => {
    const clampedPosition = Math.max(0, Math.min(100, position));
    setSliderPosition(clampedPosition);
    animatedPosition.value = withSpring(clampedPosition, {
      damping: 12,
      stiffness: 100,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedPosition.value}%`,
  }));

  const handleToggle = () => {
    setShowAfter(!showAfter);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>        
      {/* Title Section */}
      {title && (
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {style && <Text style={[styles.styleLabel, { color: colors.muted }]}>{style}</Text>}
        </View>
      )}

      {/* Image Container */}
      <View style={styles.imageContainer}>
        {/* Before Image (Background) */}
        <Image
          source={{ uri: beforeImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* After Image (Overlay) */}
        <Animated.View style={[styles.afterImageWrapper, animatedStyle]}>
          <Image
            source={{ uri: afterImage }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Slider Handle */}
        <Pressable
          style={({ pressed }) => [
            styles.sliderHandle,
            {
              left: `${sliderPosition}%`,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
          onPress={handleToggle}
        >
          <View style={styles.handleContent}>
            <Ionicons
              name={showAfter ? 'arrow-forward' : 'arrow-back'}
              size={16}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.handleText}>
              {showAfter ? 'After' : 'Before'}
            </Text>
          </View>
        </Pressable>

        {/* Labels */}
        <View style={[styles.labelBefore, { backgroundColor: `${colors.primary}99` }]}>
          <Text style={styles.labelText}>Before</Text>
        </View>
        <View style={[styles.labelAfter, { backgroundColor: `rgba(52, 211, 153, 0.6)` }]}>
          <Text style={styles.labelText}>After</Text>
        </View>
      </View>

      {/* Info Text */}
      <View style={styles.infoSection}>
        <Ionicons name="hand-left-outline" size={14} color={colors.muted} />
        <Text style={[styles.infoText, { color: colors.muted }]}>
          Drag or tap to compare
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  titleSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  afterImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: 50,
    marginLeft: -25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#fff',
  },
  handleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  labelBefore: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelAfter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
  },
});

export default BeforeAfterSlider;
