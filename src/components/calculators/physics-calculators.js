/**
 * Physics Calculators Main Module
 * Orchestrates all physics calculators and provides unified access
 */

import { PHYSICS_CONSTANTS } from './utils/physics-constants.js';
import { roundToDecimal } from './utils/calculator-utilities.js';
import { ProjectileMotionCalculator } from './calculators/projectile-motion.js';
import { EnergyCalculator } from './calculators/energy-calculator.js';
import { MomentumCalculator } from './calculators/momentum-calculator.js';
import { MagnusCalculator } from './calculators/magnus-calculator.js';

// Export all individual calculators for direct use
export { ProjectileMotionCalculator, EnergyCalculator, MomentumCalculator, MagnusCalculator };

// Export constants and utilities for convenience
export { PHYSICS_CONSTANTS, roundToDecimal };

/**
 * Main Physics Calculators Class
 * Provides easy access to all calculator functionality
 */
export class PhysicsCalculators {
    constructor() {
        this.calculators = {};
    }
    
    // Initialize velocity calculator (basic motion calculations)
    initVelocityCalculator() {
        const container = document.querySelector('.physics-calculators .calculator-section');
        if (container) {
            // Simple velocity calculator for Week 1
            this.createVelocityCalculator(container);
        }
    }
    
    createVelocityCalculator(container) {
        container.innerHTML = `
            <h4>Velocity Calculator</h4>
            <div class="calculator-inputs">
                <div class="input-group">
                    <label for="distance">Distance (m):</label>
                    <input type="number" id="distance" value="60.5" min="0" max="200" step="0.1">
                </div>
                <div class="input-group">
                    <label for="time">Time (s):</label>
                    <input type="number" id="time" value="2.0" min="0.1" max="10" step="0.1">
                </div>
                <button id="calculate-velocity" class="btn btn-primary">Calculate</button>
            </div>
            <div class="calculator-results">
                <div class="result-display">
                    <span class="result-label">Average Velocity:</span>
                    <span id="velocity-result" class="result-value">30.25</span>
                    <span class="result-unit">m/s</span>
                </div>
            </div>
        `;
        
        const calculateBtn = document.getElementById('calculate-velocity');
        const distanceInput = document.getElementById('distance');
        const timeInput = document.getElementById('time');
        const velocityResult = document.getElementById('velocity-result');
        
        const calculate = () => {
            const distance = parseFloat(distanceInput.value) || 0;
            const time = parseFloat(timeInput.value) || 1;
            const velocity = distance / time;
            velocityResult.textContent = roundToDecimal(velocity, 2);
        };
        
        calculateBtn.addEventListener('click', calculate);
        distanceInput.addEventListener('input', calculate);
        timeInput.addEventListener('input', calculate);
        
        // Calculate initial value
        calculate();
    }
    
    // Initialize projectile motion calculator
    initProjectileCalculator(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            this.calculators.projectile = new ProjectileMotionCalculator(container);
        }
    }
    
    // Initialize energy calculator
    initEnergyCalculator(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            this.calculators.energy = new EnergyCalculator(container);
        }
    }
    
    // Initialize momentum calculator
    initMomentumCalculator(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            this.calculators.momentum = new MomentumCalculator(container);
        }
    }
    
    // Initialize Magnus effect calculator
    initMagnusCalculator(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            this.calculators.magnus = new MagnusCalculator(container);
        }
    }
    
    // Get specific calculator instance
    getCalculator(type) {
        return this.calculators[type];
    }
}