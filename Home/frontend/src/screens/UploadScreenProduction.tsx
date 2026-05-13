import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { GoldButton } from '../../src/components/GoldButton';
import { CustomCard } from '../../src/components/CustomCard';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type UploadMode = 'camera' | 'gallery' | 'none';

export default function UploadScreenProduction() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('none');

  // Animated pulsing effect for the camera icon
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 2000 }),
      -1,
      true
    );
  }, [scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestGalleryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const handleCameraCapture = useCallback(async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Raqab',
        'Kameraaga kirish uchun ruxsat bering'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        // Store in persistent state and navigate
        setTimeout(() => {
          router.push({
            pathname: '/createDesign',
            params: { uploadedImage: imageUri },
          } as any);
        }, 300);
      }
    } catch (error) {
      Alert.alert('Xato', 'Rasm olishda muammo yuzaga keldi');
      console.error('Camera error:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleGallerySelect = useCallback(async () => {
    const hasPermission = await requestGalleryPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Raqab',
        'Galereyaga kirish uchun ruxsat bering'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        // Store in persistent state and navigate
        setTimeout(() => {
          router.push({
            pathname: '/createDesign',
            params: { uploadedImage: imageUri },
          } as any);
        }, 300);
      }
    } catch (error) {
      Alert.alert('Xato', 'Rasm tanlashda muammo yuzaga keldi');
      console.error('Gallery error:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleModeSelect = (mode: UploadMode) => {
    setUploadMode(mode);
    if (mode === 'camera') {
      handleCameraCapture();
    } else if (mode === 'gallery') {
      handleGallerySelect();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Xonangizni yuklang"
        showProfile={false}
        showHamburger={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera Shutter Icon - Centerpiece */}
        <View style={styles.centerpiece}>
          <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
            <View style={styles.glowingBorder}>
              <TouchableOpacity
                style={styles.shutterButton}
                onPress={() => handleModeSelect('camera')}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                  />
                ) : (
                  <Ionicons
                    name="camera"
                    size={64}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Text style={styles.centerText}>
            Xonangizning suratini oling
          </Text>
          <Text style={styles.centerSubtext}>
            Kamera yoki galereyadan tanlang
          </Text>
        </View>

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          <CustomCard style={styles.toggleCard} padding={16}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleModeSelect('camera')}
                style={[
                  styles.modeButton,
                  uploadMode === 'camera' && styles.modeButtonActive,
                ]}
                disabled={loading}
              >
                <Ionicons
                  name="camera"
                  size={20}
                  color={
                    uploadMode === 'camera'
                      ? colors.primary
                      : colors.textSecondary
                  }
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    uploadMode === 'camera' && styles.modeButtonTextActive,
                  ]}
                >
                  Kameradan olish
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonDivider} />

              <TouchableOpacity
                onPress={() => handleModeSelect('gallery')}
                style={[
                  styles.modeButton,
                  uploadMode === 'gallery' && styles.modeButtonActive,
                ]}
                disabled={loading}
              >
                <Ionicons
                  name="images"
                  size={20}
                  color={
                    uploadMode === 'gallery'
                      ? colors.primary
                      : colors.textSecondary
                  }
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.modeButtonText,
                    uploadMode === 'gallery' && styles.modeButtonTextActive,
                  ]}
                >
                  Galereyadan tanlash
                </Text>
              </TouchableOpacity>
            </View>
          </CustomCard>
        </View>

        {/* Footer Text */}
        <Text style={styles.poweredByText}>POWERED BY GEMINI ✨</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  centerpiece: {
    alignItems: 'center',
    marginVertical: 60,
    gap: 20,
  },
  iconWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowingBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: colors.gold10,
  },
  shutterButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.gold20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  centerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  controlPanel: {
    marginVertical: 40,
  },
  toggleCard: {
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: colors.gold10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  buttonDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  poweredByText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
});
