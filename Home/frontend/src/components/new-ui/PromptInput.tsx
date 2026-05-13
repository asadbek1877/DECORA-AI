import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useUI } from './designSystem';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PromptInputProps {
  mode: 'AUTO' | 'MANUAL';
  onModeChange: (mode: 'AUTO' | 'MANUAL') => void;
  customPrompt: string;
  onPromptChange: (prompt: string) => void;
  generatedPrompt?: string;
  onGenerateWithAI?: () => Promise<void>;
  isGenerating?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  mode,
  onModeChange,
  customPrompt,
  onPromptChange,
  generatedPrompt,
  onGenerateWithAI,
  isGenerating = false,
}) => {
  const { colors, isDark } = useUI();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💬 Prompt</Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          onPress={() => onModeChange('AUTO')}
          style={[
            styles.modeButton,
            {
              backgroundColor: mode === 'AUTO' ? colors.primary : isDark ? '#1a1a1a' : '#f5f5f5',
              borderColor: mode === 'AUTO' ? colors.primary : colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="robot"
            size={18}
            color={mode === 'AUTO' ? '#ffffff' : colors.muted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.modeButtonText,
              { color: mode === 'AUTO' ? '#ffffff' : colors.text },
            ]}
          >
            AUTO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onModeChange('MANUAL')}
          style={[
            styles.modeButton,
            {
              backgroundColor: mode === 'MANUAL' ? colors.primary : isDark ? '#1a1a1a' : '#f5f5f5',
              borderColor: mode === 'MANUAL' ? colors.primary : colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={18}
            color={mode === 'MANUAL' ? '#ffffff' : colors.muted}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.modeButtonText,
              { color: mode === 'MANUAL' ? '#ffffff' : colors.text },
            ]}
          >
            MANUAL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auto Mode: Generate Button & Display */}
      {mode === 'AUTO' && (
        <View style={styles.autoModeContainer}>
          {generatedPrompt ? (
            <View
              style={[
                styles.generatedPromptBox,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <Text style={[styles.generatedLabel, { color: colors.primary }]}>
                ✨ Generated Prompt
              </Text>
              <Text
                style={[styles.generatedText, { color: colors.text }]}
                numberOfLines={5}
              >
                {generatedPrompt}
              </Text>
            </View>
          ) : (
            <Text style={[styles.helpText, { color: colors.muted }]}>
              Click "Generate with AI" to create a smart prompt based on your settings
            </Text>
          )}

          <TouchableOpacity
            onPress={onGenerateWithAI}
            disabled={isGenerating}
            style={[
              styles.generateButton,
              {
                backgroundColor: colors.primary,
                opacity: isGenerating ? 0.7 : 1,
              },
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={16}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.generateButtonText}>Generate with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Mode: Text Input */}
      {mode === 'MANUAL' && (
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
            },
          ]}
          placeholder="Write your custom prompt here..."
          placeholderTextColor={colors.muted}
          value={customPrompt}
          onChangeText={onPromptChange}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      )}

      {/* Helpful hints */}
      <View style={styles.hints}>
        <Text style={[styles.hintsTitle, { color: colors.muted }]}>💡 Tip:</Text>
        <Text style={[styles.hintsText, { color: colors.muted }]}>
          {mode === 'AUTO'
            ? 'The AI will combine your style, intensity, colors, and removal choices'
            : 'Describe exactly what you want: furniture, colors, mood, and style details'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  autoModeContainer: {
    gap: 12,
  },
  generatedPromptBox: {
    padding: 12,
    borderRadius: 8,
  },
  generatedLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  generatedText: {
    fontSize: 12,
    lineHeight: 18,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  generateButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: 'system',
    minHeight: 120,
  },
  hints: {
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  hintsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  hintsText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
