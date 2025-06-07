/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({}) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
  },
  base: '',
  test: {
    environment: 'jsdom', // or happy-dom, must support window
    setupFiles: ['./model/test/setup.ts'],
  },
  server: {
    proxy: {
      '/otp': {
        target: 'https://trainkid.boston',
        changeOrigin: true,
      },
    },
  }
}));
