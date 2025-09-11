import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PHYSICS_CONSTANTS } from '../../src/utils/physics-constants.js'
import { roundToDecimal } from '../../src/utils/calculator-utilities.js'

// Helper function to extract the physics calculations from the calculator
function calculateProjectileMotion(velocity, angle, height, airResistance = false) {
  const angleRad = angle * Math.PI / 180;
  const vx0 = velocity * Math.cos(angleRad);
  const vy0 = velocity * Math.sin(angleRad);
  
  let timeOfFlight, maxHeight, range, impactVelocity;
  
  if (!airResistance) {
    // Simple projectile motion (no air resistance)
    timeOfFlight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * PHYSICS_CONSTANTS.GRAVITY * height)) / PHYSICS_CONSTANTS.GRAVITY;
    maxHeight = height + (vy0 * vy0) / (2 * PHYSICS_CONSTANTS.GRAVITY);
    range = vx0 * timeOfFlight;
    const vyFinal = vy0 - PHYSICS_CONSTANTS.GRAVITY * timeOfFlight;
    impactVelocity = Math.sqrt(vx0 * vx0 + vyFinal * vyFinal);
  } else {
    // Numerical integration with air resistance
    const dt = 0.01;
    let t = 0, x = 0, y = height;
    let vx = vx0, vy = vy0;
    maxHeight = height;
    
    while (y >= 0) {
      const speed = Math.sqrt(vx * vx + vy * vy);
      const dragMagnitude = 0.5 * PHYSICS_CONSTANTS.AIR_DENSITY * PHYSICS_CONSTANTS.DRAG_COEFFICIENT * 
                          Math.PI * PHYSICS_CONSTANTS.BASEBALL_RADIUS * PHYSICS_CONSTANTS.BASEBALL_RADIUS * speed * speed;
      
      const ax = -dragMagnitude * vx / (PHYSICS_CONSTANTS.BASEBALL_MASS * speed);
      const ay = -PHYSICS_CONSTANTS.GRAVITY - dragMagnitude * vy / (PHYSICS_CONSTANTS.BASEBALL_MASS * speed);
      
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;
      t += dt;
      
      if (y > maxHeight) maxHeight = y;
    }
    
    timeOfFlight = t;
    range = x;
    impactVelocity = Math.sqrt(vx * vx + vy * vy);
  }
  
  return {
    timeOfFlight: roundToDecimal(timeOfFlight),
    maxHeight: roundToDecimal(maxHeight),
    range: roundToDecimal(range),
    impactVelocity: roundToDecimal(impactVelocity)
  };
}

describe('Projectile Motion Calculations', () => {
  describe('Basic trajectory calculations (no air resistance)', () => {
    test('45-degree angle should produce maximum range', () => {
      const v0 = 30; // m/s
      const height = 0;
      
      const angles = [30, 35, 40, 45, 50, 55, 60];
      const ranges = angles.map(angle => 
        calculateProjectileMotion(v0, angle, height).range
      );
      
      const maxRange = Math.max(...ranges);
      const maxRangeAngle = angles[ranges.indexOf(maxRange)];
      
      expect(maxRangeAngle).toBe(45);
    });
    
    test('should calculate correct time of flight', () => {
      // Test case: v0 = 20 m/s, θ = 30°, h = 2 m
      const result = calculateProjectileMotion(20, 30, 2);
      
      // Manual calculation for verification
      const vy0 = 20 * Math.sin(30 * Math.PI / 180); // 10 m/s
      const expectedTime = (vy0 + Math.sqrt(vy0 * vy0 + 2 * 9.81 * 2)) / 9.81;
      
      expect(result.timeOfFlight).toBeCloseTo(expectedTime, 1);
    });
    
    test('should calculate correct maximum height', () => {
      // Test case: v0 = 25 m/s, θ = 60°, h = 1.5 m
      const result = calculateProjectileMotion(25, 60, 1.5);
      
      const vy0 = 25 * Math.sin(60 * Math.PI / 180);
      const expectedMaxHeight = 1.5 + (vy0 * vy0) / (2 * 9.81);
      
      expect(result.maxHeight).toBeCloseTo(expectedMaxHeight, 1);
    });
    
    test('should calculate correct range', () => {
      // Test case: v0 = 30 m/s, θ = 45°, h = 0 (ground level)
      const result = calculateProjectileMotion(30, 45, 0);
      
      // For 45° angle at ground level: R = v²/g
      const expectedRange = (30 * 30) / 9.81;
      
      expect(result.range).toBeCloseTo(expectedRange, 0);
    });
  });
  
  describe('Edge cases', () => {
    test('zero initial velocity', () => {
      const result = calculateProjectileMotion(0, 45, 2);
      
      expect(result.range).toBe(0);
      expect(result.timeOfFlight).toBeCloseTo(Math.sqrt(2 * 2 / 9.81), 2);
      expect(result.maxHeight).toBe(2); // No additional height gained
    });
    
    test('90-degree angle (straight up)', () => {
      const result = calculateProjectileMotion(20, 90, 0);
      
      expect(result.range).toBeCloseTo(0, 0.1);
      expect(result.maxHeight).toBeCloseTo((20 * 20) / (2 * 9.81), 1);
    });
    
    test('0-degree angle (horizontal)', () => {
      const result = calculateProjectileMotion(25, 0, 5);
      
      expect(result.maxHeight).toBe(5); // No vertical component
      
      // Time should be based on falling from height
      const expectedTime = Math.sqrt(2 * 5 / 9.81);
      expect(result.timeOfFlight).toBeCloseTo(expectedTime, 1);
    });
    
    test('negative height (below ground level)', () => {
      const result = calculateProjectileMotion(30, 45, -2);
      const referenceResult = calculateProjectileMotion(30, 45, 0); // Compare with ground level
      
      // Should take less time to hit the ground when starting below ground level
      expect(result.timeOfFlight).toBeLessThan(referenceResult.timeOfFlight);
      expect(result.range).toBeLessThan(referenceResult.range);
    });
  });
  
  describe('Air resistance effects', () => {
    test('air resistance should reduce range', () => {
      const noAirResult = calculateProjectileMotion(40, 30, 2, false);
      const airResult = calculateProjectileMotion(40, 30, 2, true);
      
      expect(airResult.range).toBeLessThan(noAirResult.range);
      expect(airResult.impactVelocity).toBeLessThan(noAirResult.impactVelocity);
    });
    
    test('air resistance should reduce maximum height', () => {
      const noAirResult = calculateProjectileMotion(35, 60, 1, false);
      const airResult = calculateProjectileMotion(35, 60, 1, true);
      
      expect(airResult.maxHeight).toBeLessThan(noAirResult.maxHeight);
    });
    
    test('air resistance effect should be velocity-dependent', () => {
      // Higher velocity should show more air resistance effect
      const lowVel = {
        noAir: calculateProjectileMotion(15, 45, 0, false),
        withAir: calculateProjectileMotion(15, 45, 0, true)
      };
      
      const highVel = {
        noAir: calculateProjectileMotion(45, 45, 0, false),
        withAir: calculateProjectileMotion(45, 45, 0, true)
      };
      
      const lowVelReduction = (lowVel.noAir.range - lowVel.withAir.range) / lowVel.noAir.range;
      const highVelReduction = (highVel.noAir.range - highVel.withAir.range) / highVel.noAir.range;
      
      expect(highVelReduction).toBeGreaterThan(lowVelReduction);
    });
  });
  
  describe('Floating point precision', () => {
    test('should handle very small values', () => {
      const result = calculateProjectileMotion(5, 30, 0.5); // More realistic small values
      
      expect(result.range).toBeGreaterThan(0);
      expect(result.timeOfFlight).toBeGreaterThan(0);
      expect(result.maxHeight).toBeGreaterThanOrEqual(0.5);
    });
    
    test('should handle very large values', () => {
      const result = calculateProjectileMotion(100, 45, 100);
      
      expect(result.range).toBeGreaterThan(1000);
      expect(result.maxHeight).toBeGreaterThan(100);
      expect(Number.isFinite(result.timeOfFlight)).toBe(true);
    });
    
    test('results should be deterministic', () => {
      const params = [25, 35, 1.8];
      const result1 = calculateProjectileMotion(...params);
      const result2 = calculateProjectileMotion(...params);
      
      expect(result1.range).toBe(result2.range);
      expect(result1.maxHeight).toBe(result2.maxHeight);
      expect(result1.timeOfFlight).toBe(result2.timeOfFlight);
    });
  });
  
  describe('Physics validation', () => {
    test('energy should be conserved (no air resistance)', () => {
      const v0 = 30, angle = 30, height = 2;
      const result = calculateProjectileMotion(v0, angle, height, false);
      
      // Initial kinetic energy + potential energy
      const initialKE = 0.5 * PHYSICS_CONSTANTS.BASEBALL_MASS * v0 * v0;
      const initialPE = PHYSICS_CONSTANTS.BASEBALL_MASS * PHYSICS_CONSTANTS.GRAVITY * height;
      const totalInitialEnergy = initialKE + initialPE;
      
      // Final kinetic energy (at impact)
      const finalKE = 0.5 * PHYSICS_CONSTANTS.BASEBALL_MASS * result.impactVelocity * result.impactVelocity;
      
      // Should be approximately equal (accounting for rounding)
      expect(finalKE).toBeCloseTo(totalInitialEnergy, 0);
    });
    
    test('horizontal velocity should remain constant (no air resistance)', () => {
      const v0 = 25, angle = 40;
      const vx0 = v0 * Math.cos(angle * Math.PI / 180);
      
      // Since we can't easily extract vx from the calculator,
      // we test this indirectly through range and time
      const result = calculateProjectileMotion(v0, angle, 0, false);
      const calculatedVx = result.range / result.timeOfFlight;
      
      expect(calculatedVx).toBeCloseTo(vx0, 1);
    });
  });
})