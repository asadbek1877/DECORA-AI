import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';
import { useUI } from '../src/components/new-ui/designSystem';

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Welcome to Decora AI',
    description: 'Transform any space with AI-powered interior design suggestions',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1585399363661-c0d20835babe?w=400&h=400&fit=crop',
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'See Before & After',
    description: 'Upload a photo and instantly see how different styles can transform your room',
    icon: 'images',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop',
    color: '#8B5CF6',
  },
  {
    id: 3,
    title: 'Plan Your Budget',
    description: 'Track materials, labor costs, and stay within your design budget',
    icon: 'calculator',
    image: 'https://images.unsplash.com/photo-1554224311-beee415c15ee?w=400&h=400&fit=crop',
    color: '#10B981',
  },
  {
    id: 4,
    title: 'Find Your Style',
    description: 'Take our quiz to discover the perfect design style for you',
    icon: 'help-circle',
    image: 'https://images.unsplash.com/photo-1598928506072-7fab3b1d0d90?w=400&h=400&fit=crop',
    color: '#F59E0B',
  },
  {
    id: 5,
    title: 'Explore Materials',
    description: 'Browse colors, textures, and find the perfect materials for your project',
    icon: 'cube',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=400&fit=crop',
    color: '#EC4899',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = ONBOARDING_SLIDES[currentSlide];
  const progress = ((currentSlide + 1) / ONBOARDING_SLIDES.length) * 100;

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    router.replace('/' as any);
  };

  return (
    <View style={[s.safe, { backgroundColor: slide.color }]}>
      {/* PROGRESS BAR */}
      <View style={s.header}>
        <View style={s.progressBar}>
          <Animated.View
            style={[s.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Pressable onPress={handleSkip} style={s.skipBtn}>
          <Text style={s.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      <Animated.View
        key={slide.id}
        entering={FadeInUp.duration(300)}
        exiting={FadeOutDown.duration(200)}
        style={s.content}
      >
        {/* IMAGE */}
        <View style={s.imageContainer}>
          <Image
            source={{ uri: slide.image }}
            style={s.image}
            resizeMode="cover"
          />
          <View style={[s.iconBadge, { backgroundColor: slide.color + '40' }]}>
            <Ionicons name={slide.icon as any} size={40} color="#fff" />
          </View>
        </View>

        {/* TEXT */}
        <View style={s.textContainer}>
          <Text style={s.title}>{slide.title}</Text>
          <Text style={s.description}>{slide.description}</Text>
        </View>

        {/* DOTS */}
        <View style={s.dotsContainer}>
          {ONBOARDING_SLIDES.map((_, idx) => (
            <Pressable
              key={idx}
              style={[
                s.dot,
                idx === currentSlide && s.dotActive,
                { backgroundColor: idx === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)' },
              ]}
              onPress={() => setCurrentSlide(idx)}
            />
          ))}
        </View>

        {/* BUTTONS */}
        <View style={s.buttonContainer}>
          {currentSlide > 0 && (
            <Pressable
              style={[s.secondaryBtn, { borderColor: '#fff' }]}
              onPress={() => setCurrentSlide(currentSlide - 1)}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </Pressable>
          )}

          <AnimatedPressable
            style={[s.primaryBtn, { flex: 1 }]}
            onPress={handleNext}
          >
            <Text style={s.primaryBtnText}>
              {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons
              name={currentSlide === ONBOARDING_SLIDES.length - 1 ? 'arrow-forward' : 'arrow-forward'}
              size={18}
              color={slide.color}
            />
          </AnimatedPressable>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -15,
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  textContainer: {
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  secondaryBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
