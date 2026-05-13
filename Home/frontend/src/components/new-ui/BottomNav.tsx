import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useUI } from './designSystem';

type Tab = 'home' | 'create' | 'gallery' | 'profile' | 'design';

const TABS: Array<{
  key: Tab;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  path: '/' | '/createDesign' | '/gallery' | '/settings';
}> = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home', path: '/' },
  { key: 'design', icon: 'sparkles-outline', activeIcon: 'sparkles', path: '/createDesign' },
  { key: 'gallery', icon: 'image-outline', activeIcon: 'image', path: '/gallery' },
  { key: 'profile', icon: 'person-outline', activeIcon: 'person', path: '/settings' },
];

function NavItem({ tab, isActive, onPress, isDark }: {
  tab: typeof TABS[0]; isActive: boolean; onPress: () => void; isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const active = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [isActive, active]);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.85, { duration: 80, easing: Easing.out(Easing.cubic) });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
  }, [scale]);

  const activeBg = isDark 
    ? 'rgba(108, 92, 231, 0.8)' 
    : 'rgba(53, 37, 205, 0.85)';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      active.value,
      [0, 1],
      ['transparent', activeBg],
    ),
  }), [active.value]);

  const iconColor = isActive ? '#FFFFFF' : (isDark ? '#555872' : '#9CA3AF');

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.item, animatedStyle]}>
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={iconColor}
        />
      </Animated.View>
    </Pressable>
  );
}

export function BottomNav({ 
  active, 
  animatedStyle 
}: { 
  active: Tab | 'result';
  animatedStyle?: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useUI();

  const handleNav = useCallback((path: string) => {
    try {
      if (pathname !== path) {
        router.replace(path as any);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [pathname, router]);

  return (
    <Animated.View style={[styles.outer, animatedStyle]}>
      <BlurView
        intensity={isDark ? 70 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[styles.glassOverlay, {
          backgroundColor: isDark
            ? 'rgba(20, 22, 34, 0.4)'
            : 'rgba(255, 255, 255, 0.4)',
          borderColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.7)',
        }]}>
          <View style={[styles.shimmerLine, {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.5)',
          }]} />

          <View style={styles.navContent}>
            {TABS.map((tab) => {
              const isActive = active === tab.key || (active === 'result' && tab.key === 'design');
              return (
                <NavItem
                  key={tab.key}
                  tab={tab}
                  isActive={isActive}
                  isDark={isDark}
                  onPress={() => handleNav(tab.path)}
                />
              );
            })}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingHorizontal: 40,
  },
  blurContainer: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  glassOverlay: {
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  shimmerLine: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 1,
    borderRadius: 1,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  item: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    position: 'relative',
  },
});
