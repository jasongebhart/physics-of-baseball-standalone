import { describe, test, expect, vi } from 'vitest'
import { roundToDecimal } from '../../src/utils/calculator-utilities.js'

// Mock DOM elements for testing utility functions
const createMockElement = (tagName = 'div') => {
  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    innerHTML: '',
    appendChild: vi.fn(),
    addEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    style: {},
    textContent: '',
    value: '',
    children: [],
    // Add properties for specific elements
    ...(tagName === 'input' && {
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
      value: 50
    }),
    ...(tagName === 'canvas' && {
      width: 400,
      height: 300,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn()
      }))
    })
  };
  
  return element;
};

// Mock document.createElement
global.document = {
  createElement: vi.fn((tagName) => createMockElement(tagName))
};

describe('Calculator Utilities', () => {
  describe('roundToDecimal', () => {
    test('should round to 2 decimal places by default', () => {
      expect(roundToDecimal(3.14159)).toBe(3.14);
      expect(roundToDecimal(2.718281)).toBe(2.72);
      expect(roundToDecimal(1.999)).toBe(2);
    });
    
    test('should round to specified decimal places', () => {
      expect(roundToDecimal(3.14159, 0)).toBe(3);
      expect(roundToDecimal(3.14159, 1)).toBe(3.1);
      expect(roundToDecimal(3.14159, 3)).toBe(3.142);
      expect(roundToDecimal(3.14159, 4)).toBe(3.1416);
    });
    
    test('should handle negative numbers', () => {
      expect(roundToDecimal(-3.14159)).toBe(-3.14);
      expect(roundToDecimal(-2.718281, 1)).toBe(-2.7);
    });
    
    test('should handle zero and very small numbers', () => {
      expect(roundToDecimal(0)).toBe(0);
      expect(roundToDecimal(0.001, 2)).toBe(0);
      expect(roundToDecimal(0.001, 3)).toBe(0.001);
      expect(roundToDecimal(0.0015, 3)).toBe(0.002);
    });
    
    test('should handle large numbers', () => {
      expect(roundToDecimal(1234567.89123, 2)).toBe(1234567.89);
      expect(roundToDecimal(999.999, 2)).toBe(1000);
    });
    
    test('should handle edge cases', () => {
      expect(roundToDecimal(NaN)).toBeNaN();
      expect(roundToDecimal(Infinity)).toBe(Infinity);
      expect(roundToDecimal(-Infinity)).toBe(-Infinity);
    });
  });
  
  describe('floating point precision edge cases', () => {
    test('should handle floating point arithmetic issues', () => {
      // Classic floating point issue: 0.1 + 0.2 = 0.30000000000000004
      const result = 0.1 + 0.2;
      expect(roundToDecimal(result, 1)).toBe(0.3);
      expect(roundToDecimal(result, 2)).toBe(0.3);
    });
    
    test('should maintain precision for physics calculations', () => {
      // Common physics values that might have precision issues
      const g = 9.81;
      const result = g * 1.5 / 2; // 7.3575
      expect(roundToDecimal(result, 2)).toBe(7.36);
      expect(roundToDecimal(result, 3)).toBe(7.358);
    });
  });
})