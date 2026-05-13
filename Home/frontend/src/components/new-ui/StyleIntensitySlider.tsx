import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useUI } from './designSystem';

interface StyleIntensitySliderProps {
  value: number; // 0-100
  onChange: (value: number) => void;
  label?: string;
  showIntensityLabel?: boolean;
}

export const StyleIntensitySlider: React.FC<StyleIntensitySliderProps> = ({
  value,
  onChange,
  label = 'Design Intensity',
  showIntensityLabel = true,
}) => {
  const { colors } = useUI();
  const [sliderWidth, setSliderWidth] = useState(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const newValue = Math.max(
          0,
          Math.min(100, Math.round((gestureState.x0 / sliderWidth) * 100))
        );
        onChange(newValue);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  // Determine intensity level based on percentage
  const intensityLevel = useMemo(() => {
    if (value <= 20) return 'Minimal';
    if (value <= 60) return 'Medium';
    return 'Full Redesign';
  }, [value]);

  const intensityDescription = useMemo(() => {
    if (value <= 20) return 'Subtle changes, keep original feel';
    if (value <= 60) return 'Moderate changes, new furniture & colors';
    return 'Complete transformation, full redesign';
  }, [value]);

  const thumbPosition = (value / 100) * sliderWidth;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: colors.primary }]}>{Math.round(value)}%</Text>
        </View>
      </View>

      {/* Custom Slider Track */}
      <View
        style={[styles.sliderWrapper, { borderColor: colors.border }]}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Filled Track */}
        <View
          style={[
            styles.filledTrack,
            {
              width: `${value}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />

        {/* Thumb */}
        <View
          style={[
            styles.thumb,
            {
              left: `${value}%`,
              backgroundColor: colors.primary,
              marginLeft: -8,
            },
          ]}
        />
      </View>

      <View style={styles.rangeLabels}>
        <Text style={[styles.rangeLabel, { color: colors.muted }]}>Min</Text>
        <Text style={[styles.rangeLabel, { color: colors.muted }]}>Med</Text>
        <Text style={[styles.rangeLabel, { color: colors.muted }]}>Max</Text>
      </View>

      {showIntensityLabel && (
        <View style={styles.intensityInfo}>
          <Text style={[styles.intensityLevel, { color: colors.primary }]}>
            {intensityLevel} ({value}%)
          </Text>
          <Text style={[styles.intensityDescription, { color: colors.muted }]}>
            {intensityDescription}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
  sliderWrapper: {
    height: 40,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  filledTrack: {
    height: '100%',
    borderRadius: 8,
  },
  thumb: {
    width: 16,
    height: 40,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  rangeLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  intensityInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  intensityLevel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  intensityDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
