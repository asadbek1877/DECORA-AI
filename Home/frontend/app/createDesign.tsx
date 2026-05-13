import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';
import { ScreenWrapper } from '../src/components/new-ui/ScreenWrapper';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { useDesignStore } from '../src/store/designStore';

const SCREEN_WIDTH = require('react-native').Dimensions.get('window').width;

// AI Providers available - ONLY GEMINI
const AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', icon: '✨', color: '#4285F4', description: 'Fast & free' },
];

export default function CreateDesignScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { setOriginalImage } = useDesignStore();
  const insets = useSafeAreaInsets();
  const [selectedMode, setSelectedMode] = useState<'design' | null>('design');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAiProvider, setSelectedAiProvider] = useState('gemini');

  const handleProviderSelect = (providerId: string) => {
    setSelectedAiProvider(providerId);
    triggerActionSheet(providerId);
  };

  const triggerActionSheet = (providerId: string) => {
    Alert.alert(
      '📸 Upload Image',
      'Choose how you want to provide your room image:',
      [
        { text: '📷 Take Photo', onPress: () => takePhoto() },
        { text: '📁 Gallery', onPress: () => pickFromLibrary() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const takePhoto = async () => {
    try {
      setIsLoading(true);
      console.log('[CreateDesign] Requesting camera permissions...');
      
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera permission is needed to take photos');
        setIsLoading(false);
        return;
      }

      console.log('[CreateDesign] Opening camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.92,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[CreateDesign] Photo captured:', result.assets[0].uri);
        // Save image to store and navigate directly to design selection
        setOriginalImage(result.assets[0].uri);
        router.push('/designSelection');
      }
    } catch (error) {
      console.error('[CreateDesign] Camera error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      setIsLoading(true);
      console.log('[CreateDesign] Opening image library...');
      
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert('Permission required', 'Gallery permission is needed to pick images');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[CreateDesign] Image selected:', result.assets[0].uri);
        // Save image to store and navigate directly to design selection
        setOriginalImage(result.assets[0].uri);
        router.push('/designSelection');
      }
    } catch (error) {
      console.error('[CreateDesign] Gallery error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    console.log('[CreateDesign] Back button pressed');
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/' as any);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <AppHeader 
              title={t.createDesign || 'Choose AI Engine'} 
              showBack 
              onBack={handleBackPress}
            />
          </Animated.View>

          {/* AI Providers Section */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Select AI Provider</Text>
            <Text style={[styles.subsectionDesc, { color: colors.muted }]}>Choose your AI generation engine to start designing</Text>
            
            <View style={styles.providersGrid}>
              {AI_PROVIDERS.map((provider, idx) => (
                <Animated.View key={provider.id} entering={FadeInDown.duration(600 + idx * 50)}>
                  <AnimatedPressable
                    onPress={() => handleProviderSelect(provider.id)}
                    style={[
                      styles.providerCard,
                      {
                        backgroundColor: provider.color,
                        borderColor: provider.color,
                        borderWidth: 2,
                      },
                    ]}
                    pressScale={0.92}
                  >
                    <Text style={styles.providerIcon}>{provider.icon}</Text>
                    <Text style={[styles.providerName, { color: '#fff' }]}>
                      {provider.name}
                    </Text>
                    <Text style={[styles.providerDesc, { color: 'rgba(255,255,255,0.8)' }]}>
                      {provider.description}
                    </Text>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="design" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 80, gap: 24 },

  section: { gap: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  subsectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subsectionDesc: { fontSize: 12, marginBottom: 12 },

  // Mode Selection
  modeGrid: { gap: 16 },
  modeCard: {
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  modeIcon: { width: 70, height: 70, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modeName: { fontSize: 18, fontWeight: '800' },
  modeDescription: { fontSize: 13, textAlign: 'center', minHeight: 32 },
  modeFeatures: { width: '100%', gap: 6, marginTop: 8 },
  featureText: { fontSize: 12, fontWeight: '600' },

  // Image Source Selection
  imageSourceCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 160,
  },
  imageSourceTitle: { fontSize: 16, fontWeight: '800' },
  imageSourceSub: { fontSize: 12, textAlign: 'center' },

  // Providers
  providersGrid: {
    gap: 12,
    marginTop: 8,
  },
  providerCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 140,
  },
  providerIcon: { fontSize: 48 },
  providerName: { fontSize: 18, fontWeight: '800' },
  providerDesc: { fontSize: 12 },

  // Sample Images
  samplesRow: { gap: 12, paddingEnd: 12 },
  sampleCard: {
    width: 140,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  sampleImage: { width: '100%', height: '100%' },
  sampleOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    paddingVertical: 8, 
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  sampleName: { color: '#fff', fontWeight: '800', fontSize: 12, textAlign: 'center' },

  // AI Providers Grid
  providersGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
  },
  providerCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    marginBottom: 12,
    minHeight: 140,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    flexDirection: 'column',
  },
  providerIcon: { fontSize: 32 },
  providerName: { fontSize: 14, fontWeight: '800', textAlign: 'center', maxWidth: '100%' },
  providerDesc: { fontSize: 11, textAlign: 'center', maxWidth: '100%' },
  checkmark: { position: 'absolute', top: 8, right: 8 },

  // Chat Bots Grid
  chatBotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chatBotCard: {
    width: (SCREEN_WIDTH - 48 - 12 * 2) / 3, // 3 cols
    marginBottom: 12,
    minHeight: 100,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    flexDirection: 'column',
  },
  botIcon: { fontSize: 24 },
  botName: { fontSize: 12, fontWeight: '800', textAlign: 'center', maxWidth: '100%' },
  botCheckmark: { position: 'absolute', top: 6, right: 6 },

  // Back Button
  backButton: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  backButtonText: { fontSize: 14, fontWeight: '700' },

  // Help Section
  helpSection: { gap: 12 },
  helpTitle: { fontSize: 16, fontWeight: '800' },
  helpItem: { gap: 4 },
  helpLabel: { fontSize: 14, fontWeight: '700' },
  helpText: { fontSize: 12, lineHeight: 18 },
});
