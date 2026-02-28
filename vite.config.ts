/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { devGeoProxy } from './vite/dev-proxy';

export default defineConfig({
  plugins: [vue(), tailwindcss(), devGeoProxy()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'api/**/*.test.ts', 'lib/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
