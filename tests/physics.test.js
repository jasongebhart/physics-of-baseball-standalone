/**
 * Physics Tests - Simple Browser-Based Testing
 * Lightweight tests for physics calculations without frameworks
 */

import { 
    calculateProjectileMotion, 
    calculateKineticEnergy, 
    calculatePotentialEnergy,
    calculateWork,
    calculateMagnusEffect,
    calculateMomentum,
    calculateCollision,
    PHYSICS_CONSTANTS,
    roundToDecimal
} from '../js/physics.js';

// Simple test framework
class SimpleTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    assertEqual(actual, expected, tolerance = 0.01) {
        if (typeof expected === 'number') {
            return Math.abs(actual - expected) <= tolerance;
        }
        return actual === expected;
    }

    assertTrue(condition) {
        return condition === true;
    }

    assertFalse(condition) {
        return condition === false;
    }

    async run() {
        console.log('🧪 Running Physics Tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.fn(this);
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }

        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        return { passed: this.passed, failed: this.failed };
    }
}

// Create test instance
const test = new SimpleTest();

// Physics Constants Tests
test.test('Physics constants are defined', (t) => {
    if (!t.assertTrue(PHYSICS_CONSTANTS.GRAVITY === 9.81)) {
        throw new Error('Gravity constant incorrect');
    }
    if (!t.assertTrue(PHYSICS_CONSTANTS.BASEBALL_MASS === 0.145)) {
        throw new Error('Baseball mass incorrect');
    }
});

// Utility Function Tests
test.test('Round to decimal works correctly', (t) => {
    if (!t.assertEqual(roundToDecimal(3.14159, 2), 3.14)) {
        throw new Error('Decimal rounding failed');
    }
    if (!t.assertEqual(roundToDecimal(0, 2), 0)) {
        throw new Error('Zero rounding failed');
    }
});

test.test('Round to decimal handles edge cases', (t) => {
    if (!t.assertEqual(roundToDecimal(NaN, 2), 0)) {
        throw new Error('NaN handling failed');
    }
    if (!t.assertEqual(roundToDecimal('invalid', 2), 0)) {
        throw new Error('Invalid input handling failed');
    }
});

// Projectile Motion Tests
test.test('45-degree angle produces maximum range', (t) => {
    const angles = [30, 35, 40, 45, 50, 55, 60];
    const ranges = angles.map(angle => 
        calculateProjectileMotion(30, angle, 0).range
    );
    
    const maxRange = Math.max(...ranges);
    const maxRangeAngle = angles[ranges.indexOf(maxRange)];
    
    if (!t.assertEqual(maxRangeAngle, 45)) {
        throw new Error(`Max range at ${maxRangeAngle}°, expected 45°`);
    }
});

test.test('Projectile motion basic calculations', (t) => {
    const result = calculateProjectileMotion(30, 45, 0);
    
    // Theoretical range for 45° without air resistance
    const expectedRange = (30 * 30) / 9.81; // v²sin(2θ)/g for θ=45°
    
    if (!t.assertEqual(result.range, expectedRange, 0.1)) {
        throw new Error(`Range ${result.range}, expected ~${expectedRange}`);
    }
});

test.test('Zero initial velocity edge case', (t) => {
    const result = calculateProjectileMotion(0, 45, 2);
    
    if (!t.assertEqual(result.range, 0)) {
        throw new Error('Range should be 0 for zero velocity');
    }
    if (!t.assertTrue(result.timeOfFlight > 0)) {
        throw new Error('Should still have flight time due to height');
    }
});

test.test('Negative height handling', (t) => {
    const result = calculateProjectileMotion(30, 45, -2);
    const reference = calculateProjectileMotion(30, 45, 0);
    
    if (!t.assertTrue(result.timeOfFlight < reference.timeOfFlight)) {
        throw new Error('Negative height should reduce flight time');
    }
});

test.test('Air resistance reduces range', (t) => {
    const withoutAir = calculateProjectileMotion(30, 45, 0, false);
    const withAir = calculateProjectileMotion(30, 45, 0, true);
    
    if (!t.assertTrue(withAir.range < withoutAir.range)) {
        throw new Error('Air resistance should reduce range');
    }
});

// Energy Calculation Tests
test.test('Kinetic energy calculation', (t) => {
    const ke = calculateKineticEnergy(0.145, 30);
    const expected = 0.5 * 0.145 * 30 * 30; // ½mv²
    
    if (!t.assertEqual(ke, expected, 0.01)) {
        throw new Error(`KE ${ke}, expected ${expected}`);
    }
});

test.test('Potential energy calculation', (t) => {
    const pe = calculatePotentialEnergy(0.145, 10);
    const expected = 0.145 * 9.81 * 10; // mgh
    
    if (!t.assertEqual(pe, expected, 0.01)) {
        throw new Error(`PE ${pe}, expected ${expected}`);
    }
});

test.test('Work calculation', (t) => {
    const work = calculateWork(100, 5);
    const expected = 100 * 5; // F⋅d
    
    if (!t.assertEqual(work, expected)) {
        throw new Error(`Work ${work}, expected ${expected}`);
    }
});

test.test('Energy conservation in projectile motion', (t) => {
    const result = calculateProjectileMotion(30, 45, 5);
    const initialKE = calculateKineticEnergy(0.145, 30);
    const initialPE = calculatePotentialEnergy(0.145, 5);
    const finalKE = calculateKineticEnergy(0.145, result.impactVelocity);
    const finalPE = 0; // At ground level
    
    const initialTotal = initialKE + initialPE;
    const finalTotal = finalKE + finalPE;
    
    // Small tolerance for air resistance effects
    if (!t.assertEqual(initialTotal, finalTotal, 1)) {
        throw new Error(`Energy not conserved: initial ${initialTotal}, final ${finalTotal}`);
    }
});

// Magnus Effect Tests
test.test('Magnus effect calculation', (t) => {
    const result = calculateMagnusEffect(30, 2000, 90);
    
    if (!t.assertTrue(result.magnusForce > 0)) {
        throw new Error('Magnus force should be positive');
    }
    if (!t.assertEqual(result.spinRate, 2000)) {
        throw new Error('Spin rate not preserved');
    }
});

// Momentum Tests
test.test('Momentum calculation', (t) => {
    const momentum = calculateMomentum(0.145, 30);
    const expected = 0.145 * 30;
    
    if (!t.assertEqual(momentum, expected)) {
        throw new Error(`Momentum ${momentum}, expected ${expected}`);
    }
});

test.test('Collision calculation', (t) => {
    const result = calculateCollision(0.145, 1.0, 30, -40, 0.5);
    
    // Momentum should be conserved
    const initialMomentum = 0.145 * 30 + 1.0 * (-40);
    const finalMomentum = 0.145 * result.ballFinalVelocity + 1.0 * result.batFinalVelocity;
    
    if (!t.assertEqual(initialMomentum, finalMomentum, 0.1)) {
        throw new Error(`Momentum not conserved: ${initialMomentum} vs ${finalMomentum}`);
    }
});

// Realistic Baseball Scenarios
test.test('Typical home run trajectory', (t) => {
    // Typical home run: 110 mph exit velocity, 25° launch angle
    const exitVelocity = 110 * 0.44704; // Convert mph to m/s
    const result = calculateProjectileMotion(exitVelocity, 25, 1);
    
    // Should travel approximately 400+ feet (120+ meters)
    if (!t.assertTrue(result.range > 120)) {
        throw new Error(`Home run range too short: ${result.range}m`);
    }
});

test.test('Line drive trajectory', (t) => {
    // Line drive: 100 mph, 10° launch angle
    const velocity = 100 * 0.44704;
    const result = calculateProjectileMotion(velocity, 10, 1);
    
    // Should have lower max height than home run
    if (!t.assertTrue(result.maxHeight < 15)) {
        throw new Error(`Line drive too high: ${result.maxHeight}m`);
    }
});

test.test('Pop fly trajectory', (t) => {
    // Pop fly: 80 mph, 60° launch angle
    const velocity = 80 * 0.44704;
    const result = calculateProjectileMotion(velocity, 60, 1);
    
    // Should have high max height, short range
    if (!t.assertTrue(result.maxHeight > 30)) {
        throw new Error(`Pop fly not high enough: ${result.maxHeight}m`);
    }
    if (!t.assertTrue(result.range < 100)) {
        throw new Error(`Pop fly range too long: ${result.range}m`);
    }
});

// Export for browser use
window.runPhysicsTests = () => test.run();

// Auto-run if in test environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { test, SimpleTest };
} else if (window.location.pathname.includes('test')) {
    test.run();
}

export { test, SimpleTest };