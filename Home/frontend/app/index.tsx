import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { PremiumHeroSlider } from '../src/components/PremiumHeroSlider';
import { StylePreviewChips } from '../src/components/StylePreviewChips';
import { FloatingCTA } from '../src/components/FloatingCTA';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { FeaturesGrid } from '../src/components/new-ui/FeaturesGrid';
import { ShowcaseCard } from '../src/components/new-ui/ShowcaseCard';
import { useScrollStore } from '../src/store/scrollStore';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useUI();
  const { t } = useLanguageStore();
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const { updateScroll } = useScrollStore();

  const handleStartRedesign = () => {
    router.push('/createDesign' as any);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScroll(scrollY);
  };

  const features = [
    {
      id: 'beforeAfter',
      icon: 'images' as const,
      title: 'Before/After',
      description: 'Transform your space with AI',
      backgroundColor: '#3B82F6',
      badgeColor: '#1E3A8A',
      badgeText: 'Featured',
      onPress: () => router.push('/createDesign' as any),
    },
    {
      id: 'budgetPlanner',
      icon: 'calculator' as const,
      title: 'Budget Planner',
      description: 'Track expenses & materials',
      backgroundColor: '#10B981',
      onPress: () => router.push('/budgetPlanner' as any),
    },
    {
      id: 'quizStyle',
      icon: 'help-circle' as const,
      title: 'Quiz Style',
      description: 'Find your perfect style',
      backgroundColor: '#F59E0B',
      onPress: () => router.push('/quizStyle' as any),
    },
    {
      id: 'materialExplorer',
      icon: 'cube' as const,
      title: 'Material Explorer',
      description: 'Discover materials',
      backgroundColor: '#8B5CF6',
      onPress: () => router.push('/materialExplorer' as any),
    },
    {
      id: 'diagrams',
      icon: 'grid' as const,
      title: 'Design Diagrams',
      description: 'Plan your layout',
      backgroundColor: '#EC4899',
      onPress: () => router.push('/designDiagrams' as any),
    },
  ];

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Decora AI" showSearch={false} />

      <ScreenWrapper>
        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {/* HERO SECTION - BEFORE/AFTER SLIDER */}
          <FadeInView delay={0}>
            <View style={styles.heroSection}>
              {/* Title */}
              <Animated.View entering={FadeInDown.duration(500)}>
                <Text style={[styles.mainTitle, { color: colors.text }]}>
                  {t.transformYourSpace}
                </Text>
              </Animated.View>

              {/* Before/After Slider */}
              <View style={[styles.sliderWrapper, { shadowColor: colors.primary }]}>
                <PremiumHeroSlider height={380} autoPlay={true} />
              </View>
            </View>
          </FadeInView>

          {/* STYLE SELECTOR */}
          <FadeInView delay={150}>
            <View style={styles.styleSection}>
              <StylePreviewChips
                onStyleSelect={setSelectedStyle}
                selectedStyle={selectedStyle}
                isDark={colors.bg === '#000' || colors.bg === '#1a1a1a'}
                primaryColor={colors.primary}
              />
            </View>
          </FadeInView>

          {/* FEATURED FEATURES GRID */}
          <FadeInView delay={280}>
            <View style={styles.featuresSection}>
              <FeaturesGrid features={features} />
            </View>
          </FadeInView>

          {/* SHOWCASE CARDS - Each function with before/after examples */}
          <FadeInView delay={380}>
            <View style={styles.showcaseSection}>
              <View style={styles.showcaseCards}>
                {/* Before/After Transform */}
                <ShowcaseCard
                  icon="images"
                  title="AI Transform"
                  description="Redesign any room instantly"
                  beforeImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=150&fit=crop"
                  afterImage="https://images.unsplash.com/photo-1600585154456-94f05e27639b?w=300&h=150&fit=crop"
                  backgroundColor="#3B82F6"
                  onPress={() => router.push('/camera' as any)}
                  delay={0}
                />

                {/* Budget Planner */}
                <ShowcaseCard
                  icon="calculator"
                  title="Budget Planner"
                  description="Track materials & expenses"
                  beforeImage="https://images.unsplash.com/photo-1554224311-beee415c15ee?w=300&h=150&fit=crop"
                  afterImage="https://images.unsplash.com/photo-1526628652108-aa545604533a?w=300&h=150&fit=crop"
                  backgroundColor="#10B981"
                  onPress={() => router.push('/budgetPlanner' as any)}
                  delay={100}
                />

                {/* Quiz Style */}
                <ShowcaseCard
                  icon="help-circle"
                  title="Style Quiz"
                  description="Find your perfect aesthetic"
                  beforeImage="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=300&h=150&fit=crop"
                  afterImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=150&fit=crop"
                  backgroundColor="#F59E0B"
                  onPress={() => router.push('/quizStyle' as any)}
                  delay={200}
                />

                {/* Material Explorer */}
                <ShowcaseCard
                  icon="cube"
                  title="Materials"
                  description="Explore colors & textures"
                  beforeImage="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=150&fit=crop"
                  afterImage="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=150&fit=crop"
                  backgroundColor="#8B5CF6"
                  onPress={() => router.push('/materialExplorer' as any)}
                  delay={300}
                />

                {/* Design Diagrams */}
                <ShowcaseCard
                  icon="grid"
                  title="Layouts"
                  description="Plan perfect space flow"
                  beforeImage="https://images.unsplash.com/photo-1565636192335-14f2b7ce9c1f?w=300&h=150&fit=crop"
                  afterImage="https://images.unsplash.com/photo-1579657287189-7a1e4e1236e4?w=300&h=150&fit=crop"
                  backgroundColor="#EC4899"
                  onPress={() => router.push('/designDiagrams' as any)}
                  delay={400}
                />
              </View>
            </View>
          </FadeInView>

          {/* SPACING */}
          <View style={{ height: 140 }} />
        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { 
    paddingTop: 16,
    paddingBottom: 140,
    gap: 24,
  },
  
  // HERO SECTION
  heroSection: {
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  sliderWrapper: {
    width: '100%',
    borderRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 12,
  },


  // FEATURES SECTION
  featuresSection: {
    gap: 12,
    paddingHorizontal: 0,
  },
  // STYLE SECTION
  styleSection: {
    gap: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // SHOWCASE SECTION
  showcaseSection: {
    gap: 12,
    paddingHorizontal: 16,
  },
  showcaseCards: {
    gap: 14,
  },
});
