export const colors = {
  // Primary — Modern Teal
  primary: '#1D1D1F',
  primaryLight: 'rgba(0, 0, 0, 0.15)',
  primaryDark: '#000000',
  primaryEnd: '#000000',

  // Secondary — Light Cyan
  secondary: '#3A3A3C',
  secondaryLight: 'rgba(93, 212, 208, 0.15)',
  secondaryDark: '#2C2C2E',

  // Accent — Very Light Cyan
  accent: '#8E8E93',
  accentLight: 'rgba(179, 229, 224, 0.3)',
  accentDark: '#636366',

  // Gold accent
  gold: '#FDB750',
  goldDark: '#F59E0B',

  // Neutrals
  background: '#F8FFFE',
  surface: '#FFFFFF',
  surfaceAlt: '#F0FFFE',
  card: 'rgba(255, 255, 255, 0.9)',

  // Glass
  glass: 'rgba(255, 255, 255, 0.8)',
  glassStrong: 'rgba(0, 0, 0, 0.08)',
  glassBorder: 'rgba(0, 0, 0, 0.12)',
  glassBorderStrong: 'rgba(0, 0, 0, 0.2)',

  // Text
  text: '#1D1D1F',
  textSecondary: 'rgba(29, 29, 31, 0.6)',
  textLight: 'rgba(29, 29, 31, 0.4)',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#1D1D1F',

  // Borders
  border: 'rgba(0, 0, 0, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.06)',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',

  // Dark mode overrides
  dark: {
    background: '#0F1419',
    surface: '#1B1F26',
    surfaceAlt: '#242A31',
    card: 'rgba(27, 31, 38, 0.8)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(93, 212, 208, 0.15)',
  },

  white: '#FFFFFF',

  // Gradients
  gradientPrimary: ['#1D1D1F', '#000000'] as const,
  gradientSecondary: ['#3A3A3C', '#1D1D1F'] as const,
  gradientAccent: ['#8E8E93', '#3A3A3C'] as const,
  gradientDark: ['#F8FFFE', '#E8F7F7'] as const,
};

export { spacing } from './spacing';

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export { typography } from './typography';

export const shadows = {
  soft: {
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  glow: {
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 6,
  },
  glowStrong: {
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 60,
    elevation: 10,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
};
