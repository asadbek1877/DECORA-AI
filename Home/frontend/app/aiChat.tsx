import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { ScreenWrapper } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';
import { useScrollStore } from '../src/store/scrollStore';
import { BottomNav } from '../src/components/new-ui/BottomNav';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const params = useLocalSearchParams<{ photo?: string }>();
  const { updateScroll } = useScrollStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I can help you design your space. Share your ideas or describe what you want to change, and I\'ll provide design suggestions and custom prompts for AI image generation.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response with timeout
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Great idea! Here\'s a suggested design prompt for AI generation:\n\n"Modern minimalist living room with warm wood furniture, geometric patterns, and soft lighting."',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScroll(scrollY);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppHeader title="AI Design Chat" showBack />

      {/* Photo Preview */}
      {params.photo && (
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.photoPreview, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: params.photo }} style={styles.photo} resizeMode="cover" />
          <Text style={[styles.photoLabel, { color: colors.muted }]}>Your reference image</Text>
        </Animated.View>
      )}

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map((msg) => (
          <Animated.View
            key={msg.id}
            entering={FadeInDown.duration(300)}
            style={[
              styles.messageBubble,
              msg.isUser ? styles.userMessage : styles.aiMessage,
              msg.isUser ? { alignSelf: 'flex-end', backgroundColor: colors.primary } : { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.messageText, msg.isUser ? { color: '#fff' } : { color: colors.text }]}>
              {msg.text}
            </Text>
          </Animated.View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: colors.surface }]}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholder="Ask about design ideas, styles, materials..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <AnimatedPressable
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: !inputText.trim() || isLoading ? 0.5 : 1 }]}
          pressScale={0.9}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </AnimatedPressable>
      </View>

      <BottomNav active="create" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  photoPreview: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
  },
  photo: { width: '100%', height: 120 },
  photoLabel: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 11, fontWeight: '600' },

  chatContainer: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },

  messageBubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  userMessage: { alignSelf: 'flex-end' },
  aiMessage: { alignSelf: 'flex-start' },
  messageText: { fontSize: 14, lineHeight: 20 },

  loadingDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  inputArea: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 44, maxHeight: 100, fontSize: 14 },
  sendButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
