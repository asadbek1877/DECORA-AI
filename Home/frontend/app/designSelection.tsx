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
  Modal,
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

type PromptLanguage = 'en' | 'ru' | 'uz';

const STYLE_PROMPTS: Record<string, Record<PromptLanguage, string>> = {
  Modern: {
    en: 'Transform this room into a sleek, modern interior. STRICTLY PRESERVE the original room layout, architectural geometry, windows, and doors. Update the furniture to feature clean lines, apply a neutral color palette, and add modern lighting fixtures. Keep the exact spatial proportions of the uploaded image.',
    ru: 'Превратите эту комнату в элегантный современный интерьер. СТРОГО СОХРАНЯЙТЕ исходную планировку комнаты, архитектурную геометрию, окна и двери. Обновите мебель, добавив четкие линии, используйте нейтральную цветовую палитру и добавьте современные осветительные приборы. Сохраните точные пространственные пропорции.',
    uz: "Ushbu xonani zamonaviy interyerga aylantiring. Xonaning asl joylashuvini, arxitektura geometriyasini, deraza va eshiklarni QAT'IY SAQLAB QOLING. Mebellarni toza chiziqlar bilan yangilang, neytral ranglar palitrasini qo'llang va zamonaviy yoritish moslamalarini qo'shing. Xonaning o'lchamlarini aniq saqlang.",
  },
  Luxury: {
    en: 'Redesign this room with an opulent, luxury aesthetic. DO NOT alter the original room structure, walls, or window placements. Introduce premium textures, marble accents, rich fabrics, sophisticated lighting, and gold/brass details while maintaining the current spatial dimensions.',
    ru: 'Измените дизайн этой комнаты в роскошном стиле. НЕ ИЗМЕНЯЙТЕ исходную структуру комнаты, стены или расположение окон. Добавьте премиальные текстуры, мраморные акценты, дорогие ткани, изысканное освещение и золотые детали, сохраняя текущие пространственные размеры.',
    uz: "Ushbu xonani hashamatli dizayn bilan qayta bezating. Xonaning asl tuzilishini, devorlarni yoki deraza joylashuvini O'ZGARTIRMANG. Xonaning o'lchamlarini saqlagan holda, yuqori sifatli teksturalar, marmar elementlar, boy matolar, murakkab yoritish va tilla detallarni qo'shing.",
  },
  Japanese: {
    en: 'Apply a calming Japanese Zen/Japandi style to this room. MAINTAIN the exact original architectural layout and structure. Incorporate natural light wood textures, low-profile minimalist furniture, Shoji-inspired elements, and soft diffused lighting, keeping the original room proportions intact.',
    ru: 'Примените к этой комнате успокаивающий японский стиль Zen/Japandi. СОХРАНИТЕ точную исходную архитектурную планировку и структуру. Используйте текстуры светлого натурального дерева, низкую минималистичную мебель, элементы в стиле сёдзи и мягкое рассеянное освещение.',
    uz: "Ushbu xonaga tinchlantiruvchi Yapon Zen/Japandi uslubini qo'llang. Asl arxitektura tuzilishi va tartibini SAQLAB QOLING. Tabiiy ochiq rangli yog'och teksturalari, past minimalist mebellar, Shoji uslubidagi elementlar va yumshoq tarqaluvchi yorug'likdan foydalaning.",
  },
  Industrial: {
    en: 'Convert this space into a raw, industrial loft style. PRESERVE the existing room geometry, doors, and windows entirely. Add exposed brick textures, raw concrete elements, visible metal accents, rustic leather furniture, and factory-style lighting.',
    ru: 'Превратите это пространство в стиль индустриального лофта. ПОЛНОСТЬЮ СОХРАНИТЕ существующую геометрию комнаты, двери и окна. Добавьте текстуры открытой кирпичной кладки, элементы из необработанного бетона, видимые металлические акценты, мебель из грубой кожи и освещение в фабричном стиле.',
    uz: "Bu joyni xom, industrial loft uslubiga aylantiring. Xonaning mavjud geometriyasini, eshik va derazalarini TO'LIQ SAQLANG. Ochiq g'isht teksturalari, xom beton elementlar, ko'rinib turadigan metall detallar, charm mebellar va fabrika uslubidagi chiroqlarni qo'shing.",
  },
  Minimalist: {
    en: 'Restyle this room into an ultra-minimalist space. KEEP the original architecture and spatial layout exactly as they are. Remove visual clutter, apply a monochromatic light palette, use monolithic and highly functional furniture, and maximize the feeling of open space.',
    ru: 'Переделайте эту комнату в ультраминималистичное пространство. СОХРАНИТЕ оригинальную архитектуру и пространственную планировку. Уберите визуальный шум, примените монохромную светлую палитру, используйте функциональную мебель и максимально увеличьте ощущение открытого пространства.',
    uz: "Xonani ultra-minimalist uslubda qayta jihozlang. Asl arxitektura va fazoviy joylashuvni qanday bo'lsa, xuddi shunday SAQLANG. Vizual chalg'ituvchi narsalarni olib tashlang, monoxrom och rangli palitradan foydalaning va ochiq joy hissini maksimal darajaga yetkazing.",
  },
  Bohemian: {
    en: 'Transform the interior into a cozy, Bohemian (Boho-chic) style. STRICTLY RETAIN the original room boundaries, windows, and structural layout. Layer the space with eclectic textiles, rattan furniture, warm earthy tones, macrame accents, and abundant indoor plants.',
    ru: 'Превратите интерьер в уютный богемный стиль (Boho-chic). СТРОГО СОХРАНЯЙТЕ исходные границы комнаты, окна и структурную планировку. Наполните пространство эклектичным текстилем, мебелью из ротанга, теплыми землистыми тонами и обилием комнатных растений.',
    uz: "Interyerni shinam Bohemiya (Boho-chic) uslubiga aylantiring. Xonaning asl chegaralarini, derazalarini va strukturaviy joylashuvini QAT'IY SAQLANG. Joyni turli xil tekstil materiallari, rattan mebellar, issiq tabiiy ranglar va ko'plab xona o'simliklari bilan boyiting.",
  },
};

function getStylePrompt(styleId: string, lang: string): string {
  const language = lang === 'ru' || lang === 'uz' ? lang : 'en';
  return STYLE_PROMPTS[styleId]?.[language] || STYLE_PROMPTS[styleId]?.en || '';
}

export default function DesignSelectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t, lang } = useLanguageStore();
  const { selectStyle, generatePreviews, originalImageUri, currentProjectId } = useDesignStore();
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Debug log on mount
  React.useEffect(() => {
    console.log('[DesignSelection] Component mounted');
    console.log('[DesignSelection] Original Image URI:', originalImageUri);
  }, [originalImageUri]);

  const handleSelectStyle = (styleId: string) => {
    console.log('[DesignSelection] Selected style:', styleId);
    setSelectedStyle(styleId);
  };

  const displayedPrompt = getStylePrompt(selectedStyle, lang);
  const englishPrompt = getStylePrompt(selectedStyle, 'en');

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
      await generatePreviews(
        currentProjectId || undefined,
        [selectedStyle],
        undefined,
        compressedImage.base64,
        englishPrompt,
      );
      
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

                      {isSelected && (
                        <Pressable
                          onPress={() => setModalVisible(true)}
                          style={({ pressed }) => [
                            styles.promptChip,
                            { opacity: pressed ? 0.82 : 1 },
                          ]}
                          hitSlop={6}
                        >
                          <MaterialCommunityIcons
                            name="cog-outline"
                            size={12}
                            color="#fff"
                          />
                          <Text style={styles.promptChipText}>Prompt</Text>
                        </Pressable>
                      )}
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

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>AI Prompt</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedStyle} · {lang.toUpperCase()}
                </Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <MaterialCommunityIcons name="close" size={20} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <Text style={styles.modalPromptText}>{displayedPrompt}</Text>
            </ScrollView>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={({ pressed }) => [
                styles.modalDoneButton,
                { opacity: pressed ? 0.82 : 1 },
              ]}
            >
              <Text style={styles.modalDoneButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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

  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  promptChipText: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  modalTitleWrap: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  modalScroll: {
    maxHeight: 320,
    marginTop: 14,
  },

  modalScrollContent: {
    paddingBottom: 4,
  },

  modalPromptText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
    color: '#111827',
  },

  modalDoneButton: {
    marginTop: 14,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },

  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
