import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
    bg: string;
    surface: string;
    surfaceHigh: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryDim: string;
    card: string;
    header: string;
    navBar: string;
    error: string;
    success: string;
}

export const darkColors: ThemeColors = {
    bg: '#0E1518',
    surface: '#152026',
    surfaceHigh: '#1A2830',
    text: '#F5FEFD',
    textSecondary: 'rgba(245, 254, 253, 0.62)',
    border: 'rgba(93, 212, 208, 0.22)',
    primary: '#3A3A3C',
    primaryDim: 'rgba(93, 212, 208, 0.18)',
    card: 'rgba(21, 32, 38, 0.82)',
    header: 'rgba(14, 21, 24, 0.95)',
    navBar: 'rgba(14, 21, 24, 0.98)',
    error: '#ef4444',
    success: '#34d399',
};

export const lightColors: ThemeColors = {
    bg: '#F3FCFB',
    surface: '#FFFFFF',
    surfaceHigh: '#EEFCFB',
    text: '#122024',
    textSecondary: 'rgba(18, 32, 36, 0.62)',
    border: 'rgba(0, 0, 0, 0.2)',
    primary: '#1D1D1F',
    primaryDim: 'rgba(0, 0, 0, 0.14)',
    card: 'rgba(255, 255, 255, 0.9)',
    header: 'rgba(243, 252, 251, 0.95)',
    navBar: 'rgba(243, 252, 251, 0.98)',
    error: '#ef4444',
    success: '#34d399',
};

const THEME_KEY = 'app_theme_mode';

interface ThemeState {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'light',
    colors: lightColors,
    toggleTheme: () =>
        set((s) => {
            const newMode = s.mode === 'dark' ? 'light' : 'dark';
            SecureStore.setItemAsync(THEME_KEY, newMode).catch(() => { });
            return { mode: newMode, colors: newMode === 'dark' ? darkColors : lightColors };
        }),
    setTheme: (mode) =>
        set(() => {
            SecureStore.setItemAsync(THEME_KEY, mode).catch(() => { });
            return { mode, colors: mode === 'dark' ? darkColors : lightColors };
        }),
    loadTheme: async () => {
        try {
            const stored = await SecureStore.getItemAsync(THEME_KEY);
            if (stored === 'dark' || stored === 'light') {
                set({ mode: stored, colors: stored === 'dark' ? darkColors : lightColors });
            }
        } catch {
            // Ignore storage errors and keep defaults.
        }
    },
}));
