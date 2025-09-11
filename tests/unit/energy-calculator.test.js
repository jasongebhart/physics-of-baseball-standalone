import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PHYSICS_CONSTANTS } from '../../src/utils/physics-constants.js'
import { roundToDecimal } from '../../src/utils/calculator-utilities.js'

// Extract the physics calculations for testing
function calculateEnergy(mass, velocity, height, force, distance) {
  const kineticEnergy = 0.5 * mass * velocity * velocity;
  const potentialEnergy = mass * PHYSICS_CONSTANTS.GRAVITY * height;
  const workDone = force * distance;
  const totalEnergy = kineticEnergy + potentialEnergy;
  
  return {
    kineticEnergy: roundToDecimal(kineticEnergy),
    potentialEnergy: roundToDecimal(potentialEnergy),
    workDone: roundToDecimal(workDone),
    totalEnergy: roundToDecimal(totalEnergy)
  };
}

describe('Energy Calculator Physics', () => {
  describe('Kinetic Energy Calculations', () => {
    test('should calculate kinetic energy correctly', () => {
      // KE = ½mv²
      const mass = 0.145; // baseball mass in kg
      const velocity = 40; // m/s
      
      const result = calculateEnergy(mass, velocity, 0, 0, 0);
      const expectedKE = 0.5 * mass * velocity * velocity;
      
      expect(result.kineticEnergy).toBeCloseTo(expectedKE, 2);
      expect(result.kineticEnergy).toBe(roundToDecimal(116)); // 0.5 * 0.145 * 40² = 116 J
    });
    
    test('should handle zero velocity', () => {
      const result = calculateEnergy(0.145, 0, 2, 0, 0);
      expect(result.kineticEnergy).toBe(0);
    });
    
    test('should scale quadratically with velocity', () => {
      const mass = 0.145;
      const v1 = 20, v2 = 40;
      
      const result1 = calculateEnergy(mass, v1, 0, 0, 0);
      const result2 = calculateEnergy(mass, v2, 0, 0, 0);
      
      // Doubling velocity should quadruple kinetic energy
      expect(result2.kineticEnergy).toBeCloseTo(result1.kineticEnergy * 4, 1);
    });
  });
  
  describe('Potential Energy Calculations', () => {
    test('should calculate potential energy correctly', () => {
      // PE = mgh
      const mass = 0.145;
      const height = 2;
      
      const result = calculateEnergy(mass, 0, height, 0, 0);
      const expectedPE = mass * PHYSICS_CONSTANTS.GRAVITY * height;
      
      expect(result.potentialEnergy).toBeCloseTo(expectedPE, 2);
      expect(result.potentialEnergy).toBe(2.84); // 0.145 * 9.81 * 2 = 2.8449 -> rounds to 2.84
    });
    
    test('should handle zero height', () => {
      const result = calculateEnergy(0.145, 40, 0, 0, 0);
      expect(result.potentialEnergy).toBe(0);
    });
    
    test('should handle negative height', () => {
      const mass = 0.145;
      const height = -1;
      
      const result = calculateEnergy(mass, 0, height, 0, 0);
      expect(result.potentialEnergy).toBeLessThan(0);
      expect(result.potentialEnergy).toBeCloseTo(mass * PHYSICS_CONSTANTS.GRAVITY * height, 2);
    });
    
    test('should scale linearly with height', () => {
      const mass = 0.145;
      const h1 = 1, h2 = 3;
      
      const result1 = calculateEnergy(mass, 0, h1, 0, 0);
      const result2 = calculateEnergy(mass, 0, h2, 0, 0);
      
      expect(result2.potentialEnergy).toBeCloseTo(result1.potentialEnergy * 3, 1);
    });
  });
  
  describe('Work Calculations', () => {
    test('should calculate work done correctly', () => {
      // W = F⋅d
      const force = 50; // N
      const distance = 0.5; // m
      
      const result = calculateEnergy(0.145, 0, 0, force, distance);
      const expectedWork = force * distance;
      
      expect(result.workDone).toBe(expectedWork);
      expect(result.workDone).toBe(25); // 50 * 0.5
    });
    
    test('should handle zero force or distance', () => {
      const result1 = calculateEnergy(0.145, 0, 0, 0, 0.5);
      const result2 = calculateEnergy(0.145, 0, 0, 50, 0);
      
      expect(result1.workDone).toBe(0);
      expect(result2.workDone).toBe(0);
    });
    
    test('should handle negative work', () => {
      const result = calculateEnergy(0.145, 0, 0, -30, 0.2);
      expect(result.workDone).toBe(-6);
    });
  });
  
  describe('Total Energy Calculations', () => {
    test('should sum kinetic and potential energy correctly', () => {
      const mass = 0.145;
      const velocity = 30;
      const height = 1.5;
      
      const result = calculateEnergy(mass, velocity, height, 0, 0);
      
      const expectedKE = 0.5 * mass * velocity * velocity;
      const expectedPE = mass * PHYSICS_CONSTANTS.GRAVITY * height;
      const expectedTotal = expectedKE + expectedPE;
      
      expect(result.totalEnergy).toBeCloseTo(expectedTotal, 2);
      expect(result.totalEnergy).toBe(result.kineticEnergy + result.potentialEnergy);
    });
    
    test('should handle energy conservation scenarios', () => {
      // Ball at rest at height vs ball in motion at ground level
      const mass = 0.145;
      const height = 5;
      const velocity = Math.sqrt(2 * PHYSICS_CONSTANTS.GRAVITY * height); // v from free fall
      
      const atRest = calculateEnergy(mass, 0, height, 0, 0);
      const inMotion = calculateEnergy(mass, velocity, 0, 0, 0);
      
      // Total energies should be approximately equal
      expect(atRest.totalEnergy).toBeCloseTo(inMotion.totalEnergy, 1);
    });
  });
  
  describe('Baseball-specific scenarios', () => {
    test('should calculate energy for typical pitched baseball', () => {
      // Fastball: ~95 mph = 42.5 m/s from pitcher's mound height ~0.25m above batter
      const mass = PHYSICS_CONSTANTS.BASEBALL_MASS;
      const velocity = 42.5;
      const height = 0.25;
      
      const result = calculateEnergy(mass, velocity, height, 0, 0);
      
      expect(result.kineticEnergy).toBeGreaterThan(100); // Should be significant
      expect(result.potentialEnergy).toBeLessThan(1); // Minimal compared to KE
      expect(result.kineticEnergy).toBeGreaterThan(result.potentialEnergy * 100);
    });
    
    test('should calculate work done by bat on baseball', () => {
      // Typical bat-ball contact: ~8000N over ~1.5mm
      const force = 8000; // N (peak contact force)
      const distance = 0.0015; // m (contact distance)
      
      const result = calculateEnergy(0, 0, 0, force, distance);
      
      expect(result.workDone).toBe(12); // 8000 * 0.0015 = 12 J
    });
    
    test('should handle energy transfer in collision', () => {
      // Before collision: pitched ball
      const pitchedBall = calculateEnergy(PHYSICS_CONSTANTS.BASEBALL_MASS, 40, 1, 0, 0);
      
      // Work done by bat
      const batWork = calculateEnergy(0, 0, 0, 5000, 0.002);
      
      // Energy available after collision
      const availableEnergy = pitchedBall.totalEnergy + batWork.workDone;
      
      expect(availableEnergy).toBeGreaterThan(pitchedBall.totalEnergy);
      expect(availableEnergy).toBeGreaterThan(100); // Realistic energy scale
    });
  });
  
  describe('Edge cases and error handling', () => {
    test('should handle very small values', () => {
      const result = calculateEnergy(0.01, 1, 0.1, 1, 0.1);
      
      expect(result.kineticEnergy).toBeGreaterThan(0);
      expect(result.potentialEnergy).toBeGreaterThan(0);
      expect(result.workDone).toBeGreaterThan(0);
      expect(Number.isFinite(result.totalEnergy)).toBe(true);
    });
    
    test('should handle large values', () => {
      const result = calculateEnergy(1000, 100, 100, 10000, 10);
      
      expect(Number.isFinite(result.kineticEnergy)).toBe(true);
      expect(Number.isFinite(result.potentialEnergy)).toBe(true);
      expect(Number.isFinite(result.workDone)).toBe(true);
      expect(Number.isFinite(result.totalEnergy)).toBe(true);
    });
  });
})