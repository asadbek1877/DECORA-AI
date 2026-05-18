import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useUI } from './designSystem';
import { AnimatedPressable } from './AnimatedPressable';

type UploadSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
};

function OptionCard({
  icon,
  title,
  description,
  accent,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.optionCard} pressScale={0.97}>
      <View style={[styles.iconBubble, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]}>
        <MaterialCommunityIcons name={icon as any} size={34} color={accent} />
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </AnimatedPressable>
  );
}

export function UploadSourceSheet({
  visible,
  onClose,
  onCameraPress,
  onGalleryPress,
}: UploadSourceSheetProps) {
  const { colors } = useUI();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(180)} style={styles.overlayWrap}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose} />

        <Animated.View
          entering={FadeInUp.duration(260)}
          style={[styles.sheet, { backgroundColor: colors.surface }]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Upload your room photo</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Choose how you want to add an image to start your design.</Text>
          </View>

          <View style={styles.optionsRow}>
            <OptionCard
              icon="camera-iris"
              title="Capture Photo"
              description="Use your camera to snap a new picture."
              accent={colors.primary}
              onPress={onCameraPress}
            />

            <OptionCard
              icon="image-multiple"
              title="Choose from Gallery"
              description="Select a pre-existing image from your device."
              accent={colors.secondary || colors.primary2}
              onPress={onGalleryPress}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 24,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 10,
  },
  handle: {
    width: 56,
    height: 5,
    borderRadius: 999,
    opacity: 0.8,
  },
  header: {
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  optionCard: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    minHeight: 186,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  iconBubble: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
});