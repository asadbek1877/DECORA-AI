import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDesignStore } from '../src/store/designStore';

const { width, height } = Dimensions.get('window');

function GlassButton({
  icon,
  label,
  onPress,
  accent = false,
  large = false,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  accent?: boolean;
  large?: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.88, { duration: 80 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 350 });
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (large) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.captureOuter, animStyle]}>
          <View style={[styles.captureMiddle, { borderColor: color }]}>
            <View style={[styles.captureInner, { backgroundColor: color }]} />
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.glassBtn, animStyle]}>
        <BlurView intensity={60} tint="dark" style={styles.glassBtnBlur}>
          <View style={[styles.glassBtnInner, accent && { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={22} color="#fff" />
          </View>
        </BlurView>
        <Text style={styles.glassBtnLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function CameraScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { setOriginalImage } = useDesignStore();
  const [isCapturing, setIsCapturing] = useState(false);

  const takePhoto = async () => {
    try {
      setIsCapturing(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera permission is needed');
        setIsCapturing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.92,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        setOriginalImage(result.assets[0].uri);
        router.push('/designSelection' as any);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.9,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        setOriginalImage(result.assets[0].uri);
        router.push('/designSelection' as any);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const browseSamples = () => {
    Alert.alert('Samples', 'Sample designs coming soon!');
  };

  const goBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/' as any);
      }
    } catch {
      router.replace('/(tabs)/' as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen dark background simulating camera viewfinder */}
      <View style={styles.viewfinder}>
        {/* Grid overlay */}
        <View style={styles.grid} pointerEvents="none">
          <View style={[styles.gridLine, styles.gridH1]} />
          <View style={[styles.gridLine, styles.gridH2]} />
          <View style={[styles.gridLine, styles.gridV1]} />
          <View style={[styles.gridLine, styles.gridV2]} />
        </View>

        {/* Corner brackets */}
        <View style={styles.bracketTL}>
          <View style={[styles.bracketH, { backgroundColor: colors.primary }]} />
          <View style={[styles.bracketV, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.bracketTR}>
          <View style={[styles.bracketH, { backgroundColor: colors.primary }]} />
          <View style={[styles.bracketVR, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.bracketBL}>
          <View style={[styles.bracketHB, { backgroundColor: colors.primary }]} />
          <View style={[styles.bracketV, { backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.bracketBR}>
          <View style={[styles.bracketHB, { backgroundColor: colors.primary }]} />
          <View style={[styles.bracketVR, { backgroundColor: colors.primary }]} />
        </View>

        {/* Tip text in center */}
        <Animated.View entering={FadeIn.delay(400).duration(600)} style={styles.tipContainer}>
          <BlurView intensity={50} tint="dark" style={styles.tipBlur}>
            <Ionicons name="home-outline" size={16} color={colors.primary} />
            <Text style={styles.tipText}>Xonani to'liq ko'rsating</Text>
          </BlurView>
        </Animated.View>
      </View>

      {/* Top Bar */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.topBar, { paddingTop: insets.top + 8 }]}
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable onPress={goBack} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.topTitle}>{t.uploadPhoto || 'Rasm Olish'}</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
      >
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Mode hint */}
        <Text style={styles.modeHint}>
          Kamera yoki galereyadan tanlang
        </Text>

        {/* Action row */}
        <View style={styles.actionRow}>
          {/* Gallery button */}
          <GlassButton
            icon="images-outline"
            label={t.gallery || 'Galereya'}
            onPress={pickFromLibrary}
            color={colors.primary}
          />

          {/* Main camera capture button */}
          <GlassButton
            icon="camera"
            label=""
            onPress={takePhoto}
            large
            color={colors.primary}
          />

          {/* Browse samples */}
          <GlassButton
            icon="grid-outline"
            label={t.browseSamples || 'Namunalar'}
            onPress={browseSamples}
            color={colors.primary}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080a10',
  },
  viewfinder: {
    flex: 1,
    backgroundColor: '#0e1018',
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  gridH1: {
    top: '33.3%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridH2: {
    top: '66.6%',
    left: 0,
    right: 0,
    height: 1,
  },
  gridV1: {
    left: '33.3%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  gridV2: {
    left: '66.6%',
    top: 0,
    bottom: 0,
    width: 1,
  },
  bracketTL: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
  bracketTR: {
    position: 'absolute',
    top: 60,
    right: 30,
    alignItems: 'flex-end',
  },
  bracketBL: {
    position: 'absolute',
    bottom: 200,
    left: 30,
    justifyContent: 'flex-end',
  },
  bracketBR: {
    position: 'absolute',
    bottom: 200,
    right: 30,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bracketH: {
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  bracketHB: {
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  bracketV: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginTop: -3,
    marginLeft: -0,
  },
  bracketVR: {
    width: 3,
    height: 32,
    borderRadius: 2,
    marginTop: -3,
    alignSelf: 'flex-end',
  },
  tipContainer: {
    position: 'absolute',
    bottom: 220,
    left: '50%',
    transform: [{ translateX: -120 }],
    borderRadius: 20,
    overflow: 'hidden',
  },
  tipBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 240,
    justifyContent: 'center',
    borderRadius: 20,
  },
  tipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    overflow: 'hidden',
    zIndex: 10,
  },
  topBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    overflow: 'hidden',
    gap: 16,
    zIndex: 10,
  },
  modeHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  glassBtn: {
    alignItems: 'center',
    gap: 8,
  },
  glassBtnBlur: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  glassBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
  },
  glassBtnLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Capture shutter button
  captureOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureMiddle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
});

