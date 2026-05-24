import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore } from '../../store/languageStore';

// Static fallback for StyleSheet.create (used in initial render)
export const ui = {
  colors: {
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSoft: '#F3F4F5',
    text: '#191C1D',
    muted: '#6B7280',
    primary: '#3525CD',
    primary2: '#4F46E5',
    secondary: '#712AE2',
    border: 'rgba(0,0,0,0.08)',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

// Dark theme colors
const darkUI = {
  bg: '#0E1117',
  surface: '#1A1D27',
  surfaceSoft: '#252836',
  text: '#F5F5F7',
  muted: '#9CA3AF',
  primary: '#6C5CE7',
  primary2: '#7C6DF0',
  secondary: '#8B5CF6',
  border: 'rgba(255,255,255,0.08)',
  card: '#1A1D27',
  inputBg: '#252836',
  overlay: 'rgba(0,0,0,0.6)',
  navBg: 'rgba(14,17,23,0.95)',
};

// Light theme colors
const lightUI = {
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSoft: '#F3F4F5',
  text: '#191C1D',
  muted: '#6B7280',
  primary: '#3525CD',
  primary2: '#4F46E5',
  secondary: '#712AE2',
  border: 'rgba(0,0,0,0.08)',
  card: '#FFFFFF',
  inputBg: '#F3F3F4',
  overlay: 'rgba(0,0,0,0.4)',
  navBg: 'rgba(255,255,255,0.95)',
};

export function useUI() {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const colors = isDark ? darkUI : lightUI;
  return {
    colors,
    isDark,
    spacing: ui.spacing,
    radius: ui.radius,
  };
}
