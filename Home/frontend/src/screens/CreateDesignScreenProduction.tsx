import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { GoldButton } from '../../src/components/GoldButton';
import { CustomCard } from '../../src/components/CustomCard';
import { safeRouterBack } from '../../src/utils/navigation';

const { width } = Dimensions.get('window');

type StyleType = 'Modern' | 'Luxury' | 'Japanese' | 'Industrial';

const STYLES: StyleType[] = ['Modern', 'Luxury', 'Japanese', 'Industrial'];

const STYLE_ICONS: Record<StyleType, string> = {
  Modern: 'cube',
  Luxury: 'diamond',
  Japanese: 'leaf',
  Industrial: 'hammer',
};

const STYLE_DESCRIPTIONS: Record<StyleType, string> = {
  Modern:
    'Toza chiziqlar, minimal yondashuv, zamonaviy mebel va soddalik',
  Luxury: "Premium materiallar, zaharli to'qimalar va yuqori xarajatli dizayn",
  Japanese: 'Tabiiy materiallar, zen estetikasi va sokin muhit',
  Industrial:
    "Ochiq plitkalar, metall jihatlar va amaliy ishni aks ettirish",
};

export default function CreateDesignScreenProduction() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const uploadedImage = (params.uploadedImage as string) || '';

  const [projectName, setProjectName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('Modern');
  const [customInstructions, setCustomInstructions] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [generateVariations, setGenerateVariations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClearImage = useCallback(() => {
    Alert.alert(
      'Tasdiqlang',
      'Suratni o\'chirishni xohlaysizmi?',
      [
        { text: "Yo'q", onPress: () => {}, style: 'cancel' },
        {
          text: "Ha, o'chirish",
          onPress: () => {
            safeRouterBack(router as any, '/');
          },
          style: 'destructive',
        },
      ]
    );
  }, [router]);

  const handleGenerateDesign = useCallback(async () => {
    if (!projectName.trim()) {
      Alert.alert('Xato', 'Iltimos, loyihangiz nomini kiriting');
      return;
    }

    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      router.push({
        pathname: '/result',
        params: {
          style: selectedStyle,
          intensity,
          projectName,
        },
      } as any);
    }, 3000);
  }, [projectName, selectedStyle, intensity, router]);

  return (
    <View style={styles.container}>
      <Header
        title="Dizayn yaratish"
        showProfile={false}
        showHamburger={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Preview Section */}
        {uploadedImage && (
          <CustomCard style={styles.previewCard} padding={0}>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: uploadedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearImage}
              >
                <Ionicons
                  name="close-circle-sharp"
                  size={28}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
          </CustomCard>
        )}

        {/* Style Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O'zingiz xohlaydigan uslubni tanlang</Text>
          <View style={styles.styleGrid}>
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => setSelectedStyle(style)}
                style={[
                  styles.styleButton,
                  selectedStyle === style && styles.styleButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.styleIcon,
                    selectedStyle === style && styles.styleIconActive,
                  ]}
                >
                  <Ionicons
                    name={STYLE_ICONS[style]}
                    size={24}
                    color={
                      selectedStyle === style ? colors.textInverse : colors.primary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.styleLabel,
                    selectedStyle === style && styles.styleLabelActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.styleDescription}>
            {STYLE_DESCRIPTIONS[selectedStyle]}
          </Text>
        </View>

        {/* Model Selector */}
        <CustomCard style={styles.modelCard} padding={16}>
          <View style={styles.modelContent}>
            <View style={{ gap: 8 }}>
              <Text style={styles.modelTitle}>Google Gemini 1.5 Flash</Text>
              <View style={styles.modelBadge}>
                <Ionicons
                  name="sparkles"
                  size={12}
                  color={colors.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.modelBadgeText}>Narxi: 1 Kredit</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </View>
        </CustomCard>

        {/* Input Fields */}
        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Loyihangiz nomi</Text>
          <CustomCard
            style={styles.inputCard}
            padding={12}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Masalan: Otuv xonasi qayta dizayni"
              placeholderTextColor={colors.textMuted}
              value={projectName}
              onChangeText={setProjectName}
              maxLength={50}
            />
          </CustomCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Maxsus ko'rsatmalar (ixtiyoriy)</Text>
          <CustomCard
            style={styles.inputCard}
            padding={12}
          >
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Masalan: Mening avvalgi mebllardan foydalanish mumkin..."
              placeholderTextColor={colors.textMuted}
              value={customInstructions}
              onChangeText={setCustomInstructions}
              multiline
              numberOfLines={4}
              maxLength={200}
            />
          </CustomCard>
        </View>

        {/* Intensity Slider */}
        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.fieldLabel}>Design Intensivligi</Text>
            <Text style={styles.intensityValue}>{intensity}%</Text>
          </View>
          <CustomCard style={styles.sliderCard} padding={16}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={intensity}
              onValueChange={setIntensity}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Oz</Text>
              <Text style={styles.sliderLabel}>O'rtacha</Text>
              <Text style={styles.sliderLabel}>Kuchli</Text>
            </View>
          </CustomCard>
        </View>

        {/* Generate Variations Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.fieldLabel}>Turli variantlarni yaratish</Text>
            <Switch
              value={generateVariations}
              onValueChange={setGenerateVariations}
              trackColor={{ false: colors.border, true: colors.gold20 }}
              thumbColor={generateVariations ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Generate Button */}
        <GoldButton
          title={isGenerating ? 'Yaratilmoqda...' : 'Dizayn yaratish'}
          onPress={handleGenerateDesign}
          loading={isGenerating}
          disabled={!projectName.trim() || isGenerating}
          style={styles.generateButton}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  previewCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.gold10,
    padding: 8,
    borderRadius: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  styleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  styleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.gold10,
  },
  styleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gold10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  styleIconActive: {
    backgroundColor: colors.primary,
  },
  styleLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  styleLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  styleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modelCard: {
    marginBottom: 24,
  },
  modelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  modelBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputCard: {
    borderRadius: 10,
  },
  textInput: {
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  multilineInput: {
    paddingBottom: 8,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  intensityValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  sliderCard: {},
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  generateButton: {
    marginBottom: 20,
    minHeight: 52,
  },
});
