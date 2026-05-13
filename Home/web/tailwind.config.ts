import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        headline: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        label: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Light mode colors
        light: {
          background: '#ffffff',
          surface: '#f5f5f5',
          primary: '#cc97ff',
          secondary: '#9093ff',
          tertiary: '#ec63ff',
          'on-background': '#1f1f1f',
          'on-surface': '#1f1f1f',
        },
        // Dark mode colors
        dark: {
          background: '#0e0e13',
          surface: '#1a1a22',
          primary: '#cc97ff',
          secondary: '#9093ff',
          tertiary: '#ec63ff',
          'on-background': '#f9f5fd',
          'on-surface': '#f9f5fd',
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pageIn': 'pageIn 0.5s ease-in-out forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pageIn': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
