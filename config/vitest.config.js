import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable browser-like environment for DOM testing
    environment: 'jsdom',
    
    // Test file patterns
    include: ['tests/**/*.{test,spec}.{js,ts}', 'js/**/*.{test,spec}.{js,ts}'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['js/**/*.js'],
      exclude: ['js/**/*.test.js', 'js/**/*.spec.js'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Global test timeout
    testTimeout: 10000,
    
    // Setup files
    setupFiles: ['./tests/setup.js']
  },
  
  // Resolve paths for imports
  resolve: {
    alias: {
      '@': new URL('./js', import.meta.url).pathname
    }
  }
})