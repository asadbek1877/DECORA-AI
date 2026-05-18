import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ─── Build optimization ───
  build: {
    target: 'ES2020',
    rollupOptions: {
      output: {
        // Aggressive code splitting: separate vendor chunks + route chunks
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          'vendor-animation': ['motion', 'framer-motion', 'gsap'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
          'vendor-state': ['zustand'],
        },
      },
    },
    // Enable minification (default) + CSS minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Report compressed size
    reportCompressedSize: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
  },
  
  // ─── Development server ───
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
    // Enable HMR with fast refresh
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  
  // ─── Optimization hints ───
  ssr: false,
});
