import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => ['view', 'text', 'picker'].includes(tag),
      },
    },
  })],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'cloudfunctions/**/*.test.ts'],
    environment: 'node',
  },
})
