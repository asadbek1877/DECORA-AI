import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useCallback } from 'react';

/**
 * Hook for scroll-based bottom navigation show/hide
 * Hides nav when scrolling DOWN, shows when scrolling UP
 */
export function useScrollNavigation() {
  const isVisible = useSharedValue(true);
  let lastScrollY = 0;

  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // Scrolling down (positive delta) → hide nav
    // Scrolling up (negative delta) → show nav
    const shouldHide = scrollDelta > 50; // 50px threshold
    const shouldShow = scrollDelta < -50;

    if (shouldHide && isVisible.value === true) {
      isVisible.value = withTiming(false, { duration: 200 });
    } else if (shouldShow && isVisible.value === false) {
      isVisible.value = withTiming(true, { duration: 200 });
    }

    lastScrollY = currentScrollY;
  }, []);

  const bottomNavStyle = useAnimatedStyle(() => ({
    opacity: isVisible.value ? 1 : 0,
    pointerEvents: isVisible.value ? 'auto' : 'none',
  }));

  return {
    handleScroll,
    bottomNavStyle,
    isVisible,
  };
}
