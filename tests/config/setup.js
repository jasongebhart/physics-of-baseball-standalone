// Test setup for Vitest
import { vi } from 'vitest'

// Mock browser APIs that might not be available in Node environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
}

// Mock console methods in test environment (optional)
// global.console = {
//   ...console,
//   log: vi.fn(),
//   error: vi.fn(),
//   warn: vi.fn(),
// }

// Custom matchers will be added when expect is available
import { expect } from 'vitest'

// Custom matchers for floating point comparisons
expect.extend({
  toBeCloseToWithPrecision(received, expected, precision = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision)
    
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be close to ${expected} within ${precision} decimal places`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be close to ${expected} within ${precision} decimal places`,
        pass: false,
      }
    }
  },
})

// Test utilities
export const createMockCanvas = () => {
  const mockContext = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
  }
  
  const mockCanvas = {
    getContext: vi.fn(() => mockContext),
    width: 500,
    height: 350,
  }
  
  return { mockCanvas, mockContext }
}