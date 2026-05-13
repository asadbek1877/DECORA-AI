import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface ProcessingModalProps {
  visible: boolean;
  status?: 'analyzing' | 'generating' | 'uploading' | 'designing';
  progress?: number;
  bgColor?: string;
  primaryColor?: string;
  message?: string;
  onCancel?: () => void;  // Callback for cancel button
  startTime?: number;     // Date.now() when generation started
}

function ShimmerOrb({ size, delay, color }: { size: number; delay: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      )
    );
  }, []);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        orbStyle,
      ]}
    />
  );
}

function WaveBar({ index, color }: { index: number; color: string }) {
  const height = useSharedValue(8);

  useEffect(() => {
    height.value = withDelay(
      index * 100,
      withRepeat(
        withSequence(
          withTiming(40, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(8, { duration: 500, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      )
    );
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 5,
          borderRadius: 3,
          backgroundColor: color,
          marginHorizontal: 3,
        },
        barStyle,
      ]}
    />
  );
}

export function ProcessingModal({
  visible,
  status = 'analyzing',
  progress = 0,
  bgColor = '#0d0d1a',
  primaryColor = '#6C5CE7',
  message,
  onCancel,
  startTime,
}: ProcessingModalProps) {
  // ── Elapsed time timer ──────────────────────────
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      const start = startTime || Date.now();
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, startTime]);

  const formatElapsed = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  const progressValue = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      iconScale.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
      });
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      );
    } else {
      iconScale.value = 0;
    }
  }, [visible]);

  useEffect(() => {
    progressValue.value = withTiming(Math.min(progress, 95) / 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressValue.value, [0, 1], [0, 100])}%`,
  }));

  const getIcon = () => {
    switch (status) {
      case 'analyzing': return 'scan-outline';
      case 'generating': return 'color-palette-outline';
      case 'uploading': return 'cloud-upload-outline';
      default: return 'bulb-outline';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'analyzing': return 'Xona tahlil qilinmoqda...';
      case 'generating': return 'Dizayn yaratilmoqda...';
      case 'uploading': return 'Rasm yuklanmoqda...';
      case 'designing': return 'Dizayn chizilmoqda...';
      default: return message || 'Ishlanmoqda...';
    }
  };

  const getSubText = () => {
    switch (status) {
      case 'analyzing': return 'AI sizning xonangizni o\'rganmoqda';
      case 'generating': return 'Eng yaxshi dizayn tanlanmoqda';
      case 'uploading': return 'Rasmingiz serverga yuborilmoqda';
      default: return 'Bir oz kuting...';
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="fade">
      <BlurView intensity={40} style={StyleSheet.absoluteFill}>
        <Animated.View entering={FadeIn.duration(400)} style={[styles.overlay, { backgroundColor: `${bgColor}cc` }]}>
          {/* Background Orbs */}
          <View style={styles.orbsContainer}>
            <ShimmerOrb size={280} delay={0} color={`${primaryColor}30`} />
            <ShimmerOrb size={180} delay={400} color={`${primaryColor}50`} />
            <ShimmerOrb size={100} delay={800} color={`${primaryColor}80`} />
          </View>

          {/* Card Container */}
          <View style={styles.card}>
            {/* Icon with Glow */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconGlow,
                  { backgroundColor: primaryColor },
                  glowStyle,
                ]}
              />
              <Animated.View style={[styles.iconWrapper, iconStyle, { backgroundColor: `${primaryColor}25`, borderColor: `${primaryColor}60` }]}>
                <Ionicons name={getIcon() as any} size={44} color={primaryColor} />
              </Animated.View>
            </View>

            {/* Sound wave bars */}
            <View style={styles.waveContainer}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <WaveBar key={i} index={i} color={primaryColor} />
              ))}
            </View>

            {/* Status Text */}
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.subText}>{getSubText()}</Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: `${primaryColor}25` }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: primaryColor },
                    progressBarStyle,
                  ]}
                />
                {/* Shimmer effect on progress */}
                <Animated.View style={[styles.progressShimmer, progressBarStyle, glowStyle]}>
                  <View style={[styles.shimmerHighlight, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                </Animated.View>
              </View>
              <Text style={[styles.progressText, { color: primaryColor }]}>
                {Math.round(Math.min(progress, 95))}%
              </Text>
            </View>

            {/* Elapsed Timer */}
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.6)" />
              <Text style={styles.timerText}>{formatElapsed(elapsed)}</Text>
            </View>

            {/* Cancel Button */}
            {onCancel && (
              <Animated.View 
                entering={FadeIn.delay(800)}
                style={styles.cancelButtonContainer}
              >
                <Pressable 
                  onPress={onCancel}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    { backgroundColor: pressed ? `${primaryColor}40` : `${primaryColor}25` }
                  ]}
                >
                  <Ionicons name="close-circle" size={24} color={primaryColor} />
                  <Text style={[styles.cancelButtonText, { color: primaryColor }]}>Cancel</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 300,
    alignItems: 'center',
    gap: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    filter: 'blur(30px)',
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  progressContainer: {
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  progressShimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 4,
  },
  shimmerHighlight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    height: '100%',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 4,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'] as any,
  },
  cancelButtonContainer: {
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
