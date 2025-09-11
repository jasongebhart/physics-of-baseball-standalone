import { describe, test, expect } from 'vitest'
import { PHYSICS_CONSTANTS } from '../../src/utils/physics-constants.js'

describe('Physics Constants', () => {
  test('should have correct gravitational acceleration', () => {
    expect(PHYSICS_CONSTANTS.GRAVITY).toBe(9.81)
  })
  
  test('should have realistic baseball properties', () => {
    expect(PHYSICS_CONSTANTS.BASEBALL_MASS).toBeCloseTo(0.145, 3) // MLB regulation
    expect(PHYSICS_CONSTANTS.BASEBALL_RADIUS).toBeCloseTo(0.0366, 4) // ~2.9 inches
    expect(PHYSICS_CONSTANTS.BASEBALL_CIRCUMFERENCE).toBeCloseTo(0.229, 3) // ~9 inches
  })
  
  test('should have reasonable aerodynamic coefficients', () => {
    expect(PHYSICS_CONSTANTS.DRAG_COEFFICIENT).toBeGreaterThan(0.1)
    expect(PHYSICS_CONSTANTS.DRAG_COEFFICIENT).toBeLessThan(0.5)
    expect(PHYSICS_CONSTANTS.MAGNUS_COEFFICIENT).toBeGreaterThan(0.05)
    expect(PHYSICS_CONSTANTS.MAGNUS_COEFFICIENT).toBeLessThan(0.2)
  })
  
  test('should maintain physical relationships', () => {
    // Circumference should approximately equal 2πr
    const calculatedCircumference = 2 * Math.PI * PHYSICS_CONSTANTS.BASEBALL_RADIUS
    expect(calculatedCircumference).toBeCloseTo(PHYSICS_CONSTANTS.BASEBALL_CIRCUMFERENCE, 2)
  })
})