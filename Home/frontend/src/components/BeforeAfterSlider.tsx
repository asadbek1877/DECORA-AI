import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Animated,
} from 'react-native';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 32; // 16px padding on each side
const SLIDER_HEIGHT = 320;

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(0.5);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const newPosition = Math.max(
        0,
        Math.min(1, gestureState.moveX / SLIDER_WIDTH)
      );
      setSliderPosition(newPosition);
    },
  });

  return (
    <View style={styles.container}>
      {/* Placeholder Before/After Images */}
      <View style={styles.sliderContainer}>
        {/* Before Image (Left side) */}
        <View style={styles.imageWrapper}>
          <View style={[styles.placeholder, styles.beforePlaceholder]}>
            <MaterialCommunityIcons name="home" size={60} color={colors.textMuted} />
          </View>
          <View style={styles.label}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={14}
              color={colors.text}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.labelText}>Oldin</Text>
          </View>
        </View>

        {/* After Image (Right side) - Visible portion based on slider */}
        <View
          style={[
            styles.afterImageWrapper,
            {
              width: SLIDER_WIDTH * (1 - sliderPosition),
              overflow: 'hidden',
            },
          ]}
        >
          <View style={[styles.placeholder, styles.afterPlaceholder]}>
            <MaterialCommunityIcons name="star" size={60} color={colors.primary} />
          </View>
          <View style={styles.label}>
            <Text style={styles.labelText}>Keyin</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={14}
              color={colors.text}
              style={{ marginLeft: 4 }}
            />
          </View>
        </View>

        {/* Draggable Slider Handle */}
        <View
          style={[
            styles.sliderHandle,
            {
              left: SLIDER_WIDTH * sliderPosition - 20,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleInnerContainer}>
            <View style={styles.handleLine} />
            <View
              style={[
                styles.handleIcon,
                {
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={16}
                color={colors.text}
              />
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={colors.text}
              />
            </View>
          </View>
        </View>

        {/* Ratio Display */}
        <View style={styles.ratioContainer}>
          <View
            style={[
              styles.ratioBefore,
              { width: `${sliderPosition * 100}%` },
            ]}
          />
          <View
            style={[
              styles.ratioAfter,
              { width: `${(1 - sliderPosition) * 100}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliderContainer: {
    position: 'relative',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beforePlaceholder: {
    backgroundColor: colors.surface,
  },
  afterPlaceholder: {
    backgroundColor: `${colors.primary}10`,
  },
  afterImageWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
  },
  label: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  labelText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  handleInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  handleLine: {
    width: 2,
    height: SLIDER_HEIGHT - 24,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  handleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratioContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    flexDirection: 'row',
  },
  ratioBefore: {
    backgroundColor: colors.primary,
  },
  ratioAfter: {
    backgroundColor: colors.textMuted,
  },
});

// Re-export Text for JSX
import { Text } from 'react-native';
