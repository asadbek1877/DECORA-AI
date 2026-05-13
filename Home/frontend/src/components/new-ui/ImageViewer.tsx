import React, { useRef, useEffect } from 'react';
import { Image, Modal, Pressable, StyleSheet, View, Dimensions, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ImageViewerProps {
  visible: boolean;
  uri: string;
  onClose: () => void;
}

export function ImageViewer({ visible, uri, onClose }: ImageViewerProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
        {/* Backdrop — tap to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </Animated.View>
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

// For local require() images
export function ImageViewerLocal({ visible, source, onClose }: { visible: boolean; source: any; onClose: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 100 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!source) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
        {/* Backdrop — tap to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image source={source} style={styles.image} resizeMode="contain" />
        </Animated.View>
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.8,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
