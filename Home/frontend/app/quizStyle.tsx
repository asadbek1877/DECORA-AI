import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';

interface Question {
  id: number;
  question: string;
  options: string[];
  category: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'What is your favorite color palette?',
    category: 'color',
    options: ['Warm & Rich', 'Cool & Calm', 'Neutral & Minimal', 'Vibrant & Bold'],
  },
  {
    id: 2,
    question: 'What describes your style best?',
    category: 'style',
    options: ['Modern', 'Classic', 'Eclectic', 'Industrial'],
  },
  {
    id: 3,
    question: 'How much natural light do you prefer?',
    category: 'lighting',
    options: ['Lots of Sunlight', 'Moderate Light', 'Warm Ambient', 'Dark & Cozy'],
  },
  {
    id: 4,
    question: 'What is your priority?',
    category: 'priority',
    options: ['Functionality', 'Aesthetics', 'Comfort', 'Budget-friendly'],
  },
  {
    id: 5,
    question: 'Which material appeals to you most?',
    category: 'material',
    options: ['Wood', 'Metal', 'Natural Fabrics', 'Mixed Materials'],
  },
];

export default function QuizStyleScreen() {
  const { colors, isDark } = useUI();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + answers.length) / QUIZ_QUESTIONS.length) * 100;

  const handleSelectOption = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (newAnswers.length === QUIZ_QUESTIONS.length) {
      generateStyle(newAnswers);
    } else {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const generateStyle = async (selectedAnswers: string[]) => {
    setIsLoading(true);
    // Simulate API call to generate style based on answers
    setTimeout(() => {
      setShowResult(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <View style={[s.safe, { backgroundColor: colors.bg }]}>
        <AppHeader title="Your Style" showBack />

        <ScreenWrapper>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
          >
            <FadeInView delay={0}>
              <View style={[s.resultCard, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={40} color="#fff" />
                <Text style={s.resultTitle}>Your Perfect Style</Text>

                <View style={s.styleGrid}>
                  {answers.map((answer, idx) => (
                    <View
                      key={idx}
                      style={[s.styleTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                    >
                      <Text style={s.styleTagText}>{answer}</Text>
                    </View>
                  ))}
                </View>

                <View style={[s.suggestionBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text style={s.suggestionTitle}>AI Prompt Generated:</Text>
                  <Text style={s.suggestionText}>
                    Create a modern living room with {answers[0]} colors, {answers[1]} style
                    with {answers[4]} materials. Include {answers[2]} lighting with {answers[3]}
                    as the priority.
                  </Text>
                </View>

                <Pressable style={[s.copyBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Ionicons name="copy" size={18} color="#fff" />
                  <Text style={s.copyBtnText}>Copy Prompt</Text>
                </Pressable>

                <AnimatedPressable
                  style={[s.retakeBtn, { backgroundColor: colors.bg, borderColor: colors.primary }]}
                  onPress={handleRestart}
                >
                  <Text style={[s.retakeBtnText, { color: colors.primary }]}>Try Again</Text>
                </AnimatedPressable>
              </View>
            </FadeInView>

            <View style={{ height: 60 }} />
          </ScrollView>
        </ScreenWrapper>

        <BottomNav active="home" />
      </View>
    );
  }

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Find Your Style" showBack />

      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* PROGRESS */}
          <FadeInView delay={0}>
            <View style={s.progressSection}>
              <View style={[s.progressBar, { backgroundColor: colors.surface }]}>
                <Animated.View
                  style={[
                    s.progressFill,
                    { width: `${progress}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={[s.progressText, { color: colors.muted }]}>
                Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
              </Text>
            </View>
          </FadeInView>

          {/* QUESTION */}
          {!isLoading && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              exiting={FadeOutDown.duration(200)}
              style={s.questionContainer}
            >
              <FadeInView delay={100}>
                <Text style={[s.questionText, { color: colors.text }]}>
                  {question.question}
                </Text>
              </FadeInView>

              {/* OPTIONS */}
              <View style={s.optionsGrid}>
                {question.options.map((option, idx) => (
                  <AnimatedPressable
                    key={idx}
                    style={[s.optionCard, { borderColor: colors.border }]}
                    onPress={() => handleSelectOption(option)}
                  >
                    <Text style={[s.optionText, { color: colors.text }]}>
                      {option}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                  </AnimatedPressable>
                ))}
              </View>
            </Animated.View>
          )}

          {isLoading && (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[s.loadingText, { color: colors.text }]}>
                Generating your style...
              </Text>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="home" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40, gap: 24 },
  progressSection: { gap: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  questionContainer: { gap: 24 },
  questionText: { fontSize: 24, fontWeight: '800', lineHeight: 32, letterSpacing: -0.3 },
  optionsGrid: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  optionText: { fontSize: 16, fontWeight: '700', flex: 1 },
  loadingContainer: { alignItems: 'center', gap: 16, paddingVertical: 60 },
  loadingText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  resultCard: { borderRadius: 24, padding: 24, gap: 20, alignItems: 'center' },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center' },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  styleTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  styleTagText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  suggestionBox: { borderRadius: 16, padding: 16, gap: 8 },
  suggestionTitle: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  suggestionText: { color: '#fff', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  copyBtn: { flexDirection: 'row', gap: 8, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  copyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  retakeBtn: { width: '100%', borderWidth: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  retakeBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
