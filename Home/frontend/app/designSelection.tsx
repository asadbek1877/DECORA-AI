import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  StatusBar,
  ActivityIndicator,
  Alert,
  Pressable,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { compressImageToBase64 } from '../src/utils/imageCompression';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useDesignStore } from '../src/store/designStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { safeRouterBack } from '../src/utils/navigation';

const DESIGN_STYLES = [
  {
    id: 'Modern',
    name: 'Modern',
    color: '#3B82F6',
    imageSource: require('../assets/images/styles/modern.jpg'),
  },
  {
    id: 'Luxury',
    name: 'Luxury',
    color: '#D4AF37',
    imageSource: require('../assets/images/styles/luxury.jpg'),
  },
  {
    id: 'Japanese',
    name: 'Japanese',
    color: '#E74C3C',
    imageSource: require('../assets/images/styles/japanese.jpg'),
  },
  {
    id: 'Industrial',
    name: 'Industrial',
    color: '#7F8C8D',
    imageSource: require('../assets/images/styles/industrial.jpg'),
  },
  {
    id: 'Minimalist',
    name: 'Minimalist',
    color: '#95A5A6',
    imageSource: require('../assets/images/styles/minimalist.jpg'),
  },
  {
    id: 'Bohemian',
    name: 'Bohemian',
    color: '#F39C12',
    imageSource: require('../assets/images/styles/bohemian.jpg'),
  },
];

export default function DesignSelectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { selectStyle, generatePreviews, originalImageUri, currentProjectId } = useDesignStore();
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [isGenerating, setIsGenerating] = useState(false);

  // Debug log on mount
  React.useEffect(() => {
    console.log('[DesignSelection] Component mounted');
    console.log('[DesignSelection] Original Image URI:', originalImageUri);
  }, [originalImageUri]);

  const handleSelectStyle = (styleId: string) => {
    console.log('[DesignSelection] Selected style:', styleId);
    setSelectedStyle(styleId);
  };

  const handleGenerate = async () => {
    console.log('[DesignSelection] Generate pressed. Image URI:', originalImageUri);
    
    if (!originalImageUri) {
      Alert.alert('Xatolik', 'Iltimos, avval rasmni yuklang');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('[DesignSelection] Starting generation for style:', selectedStyle);
      
      // Compress and convert image to base64
      console.log('[DesignSelection] Converting image to base64...');
      const compressedImage = await compressImageToBase64(originalImageUri);
      
      if (!compressedImage || !compressedImage.base64) {
        throw new Error('Rasmni konvertsiya qilishda xatolik yuz berdi');
      }
      
      console.log('[DesignSelection] Image compression successful:', {
        originalSize: compressedImage.originalSize,
        compressedSize: compressedImage.compressedSize,
        base64Length: compressedImage.base64.length,
      });
      
      selectStyle(selectedStyle);
      
      // Generate previews with base64 image data
      console.log('[DesignSelection] Calling generatePreviews with base64 image');
      await generatePreviews(currentProjectId || undefined, [selectedStyle], undefined, compressedImage.base64);
      
      console.log('[DesignSelection] Generation complete, navigating to result');
      // Navigate to result screen
      router.push({
        pathname: '/result',
        params: { style: selectedStyle },
      });
    } catch (error) {
      console.log('[DesignSelection] Error generating design:', error);
      
      // Determine error message based on error type
      let userTitle = 'Xatolik';
      let userMessage = 'AI serverlari hozirda band yoki javob berish muddati tugadi. Iltimos, birozdan so\'ng qayta urinib ko\'ring.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        const fullErrorMsg = error.message;
        
        // Check for timeout error (Gemini server timeout or network)
        if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
          userTitle = 'Xatolik';
          userMessage = 'AI serverlari hozirda band yoki javob berish muddati tugadi. Iltimos, birozdan so\'ng qayta urinib ko\'ring.';
        } else if (errorMsg.includes('api') || errorMsg.includes('gemini')) {
          userTitle = 'AI Xizmati Xatosi';
          userMessage = 'Google Gemini serverlari vaqtincha ishlamayapti. Iltimos, birozdan so\'ng qayta urinib ko\'ring.';
        } else if (errorMsg.includes('network') || errorMsg.includes('connect')) {
          userTitle = 'Ulanish muammosi';
          userMessage = 'Internet ulanishida muammo. Iltimos, internetni tekshiring va qayta urinib ko\'ring.';
        } else if (errorMsg.includes('overload') || errorMsg.includes('503') || errorMsg.includes('502')) {
          userTitle = 'Server Xatosi';
          userMessage = 'AI serverlari hozirda band. Iltimos, birozdan so\'ng qayta urinib ko\'ring.';
        } else if (errorMsg.includes('konvertsiya')) {
          userTitle = 'Rasm muammosi';
          userMessage = fullErrorMsg;
        } else {
          // Generic error fallback
          userMessage = 'AI serverlari hozirda band yoki javob berish muddati tugadi. Iltimos, birozdan so\'ng qayta urinib ko\'ring.';
        }
      }
      
      Alert.alert(userTitle, userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const goBack = () => {
    console.log('[DesignSelection] Going back');
    try {
      safeRouterBack(router as any, '/');
    } catch (error) {
      console.log('[DesignSelection] Back navigation error:', error);
      router.replace('/');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        translucent 
        backgroundColor="transparent" 
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Design Style
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Choose your preferred interior design style
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {/* Styles Grid */}
        <View style={styles.stylesGrid}>
          {DESIGN_STYLES.map((style, idx) => {
            const isSelected = selectedStyle === style.id;
            return (
              <Animated.View
                key={style.id}
                entering={FadeInDown.delay(idx * 50).duration(400)}
                style={styles.styleCardWrapper}
              >
                <Pressable
                  onPress={() => {
                    console.log('[DesignSelection] Card pressed:', style.id);
                    handleSelectStyle(style.id);
                  }}
                  style={({ pressed }) => [
                    styles.styleCard,
                    {
                      borderColor: isSelected ? style.color : colors.border,
                      borderWidth: isSelected ? 3 : 1,
                      shadowColor: isSelected ? style.color : '#000',
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    },
                  ]}
                  hitSlop={8}
                >
                  <ImageBackground
                    source={style.imageSource}
                    style={styles.imageFill}
                    imageStyle={styles.imageRound}
                    resizeMode="cover"
                  >
                    <View style={styles.imageOverlay} />

                    <LinearGradient
                      colors={['transparent', 'rgba(2, 6, 23, 0.22)', 'rgba(2, 6, 23, 0.92)']}
                      locations={[0, 0.48, 1]}
                      style={styles.footerGradient}
                    >
                      <Text style={styles.styleName} numberOfLines={1}>
                        {style.name}
                      </Text>
                      <Text style={styles.styleHint} numberOfLines={1}>
                        Designer inspiration
                      </Text>
                    </LinearGradient>
                  </ImageBackground>

                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: style.color }]}>
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#fff"
                      />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Info Box */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.infoBox, { backgroundColor: colors.surfaceLight }]}
        >
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            This style will guide the AI to match your room's design preferences
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={[styles.bottomContainer, { borderTopColor: colors.border }]}>
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.buttonContainer}
        >
          <Pressable
            onPress={() => {
              console.log('[DesignSelection] Generate button pressed');
              handleGenerate();
            }}
            disabled={isGenerating || !originalImageUri}
            style={({ pressed }) => [
              styles.generateButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : isGenerating || !originalImageUri ? 0.5 : 1,
              },
            ]}
            hitSlop={8}
          >
            {isGenerating ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <MaterialCommunityIcons
                name="wand"
                size={20}
                color={colors.textInverse}
              />
            )}
            <Text 
              style={[
                styles.generateButtonText, 
                { color: colors.textInverse }
              ]}
            >
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 13,
  },

  content: { 
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
    gap: 20,
  },

  // Styles Grid
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  
  styleCardWrapper: {
    flexBasis: '48%',
    maxWidth: '48%',
    marginBottom: 2,
  },
  
  styleCard: {
    borderRadius: 26,
    overflow: 'hidden',
    aspectRatio: 0.86,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  imageFill: {
    flex: 1,
    justifyContent: 'space-between',
  },

  imageRound: {
    borderRadius: 26,
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  footerGradient: {
    marginTop: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 14,
    paddingTop: 30,
  },

  styleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },

  styleHint: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  
  buttonContainer: {
    gap: 8,
  },
  
  generateButton: {
    flexDirection: 'row',
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
