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
} from 'react-native';
import { useRouter } from 'expo-router';
import { compressImageToBase64 } from '../src/utils/imageCompression';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useDesignStore } from '../src/store/designStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DESIGN_STYLES = [
  { id: 'Modern', name: 'Modern', icon: 'cube-outline', color: '#3B82F6' },
  { id: 'Luxury', name: 'Luxury', icon: 'crown', color: '#D4AF37' },
  { id: 'Japanese', name: 'Japanese', icon: 'lotus', color: '#E74C3C' },
  { id: 'Industrial', name: 'Industrial', icon: 'nuts', color: '#7F8C8D' },
  { id: 'Minimalist', name: 'Minimalist', icon: 'square', color: '#95A5A6' },
  { id: 'Bohemian', name: 'Bohemian', icon: 'leaf', color: '#F39C12' },
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
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/createDesign' as any);
      }
    } catch (error) {
      console.error('[DesignSelection] Back navigation error:', error);
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
                      borderWidth: isSelected ? 3 : 2,
                      backgroundColor: isSelected
                        ? colors.surfaceLight
                        : colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  hitSlop={8}
                >
                  <View 
                    style={[
                      styles.iconContainer,
                      { 
                        backgroundColor: `${style.color}30`,
                        borderColor: style.color,
                      }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={style.icon as any}
                      size={32}
                      color={style.color}
                    />
                  </View>
                  
                  <Text style={[styles.styleName, { color: colors.text }]}>
                    {style.name}
                  </Text>
                  
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={style.color}
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
    gap: 12,
  },
  
  styleCardWrapper: {
    width: '48%',
  },
  
  styleCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 160,
    position: 'relative',
  },
  
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  
  styleName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
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
