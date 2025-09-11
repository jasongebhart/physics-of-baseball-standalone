/**
 * Energy Calculator
 * Interactive calculator for work and energy calculations in baseball
 */

import { PHYSICS_CONSTANTS } from '../utils/physics-constants.js';
import { roundToDecimal, createSlider } from '../utils/calculator-utilities.js';

export class EnergyCalculator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            theme: 'auto',
            showVisualization: true,
            showTransformations: true,
            precision: 2,
            ...options
        };
        
        this.mass = 0.145; // kg (baseball)
        this.velocity = 40; // m/s
        this.height = 2; // meters
        this.force = 50; // N
        this.distance = 0.5; // meters
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'energy-calculator';
        
        const title = document.createElement('h3');
        title.textContent = '⚡ Work & Energy Calculator';
        title.className = 'calculator-title';
        this.container.appendChild(title);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'calculator-controls';
        
        this.massSlider = createSlider(controlsDiv, 'mass', 'Mass', 0.1, 1, this.mass, 0.01, ' kg');
        this.velocitySlider = createSlider(controlsDiv, 'velocity', 'Velocity', 0, 50, this.velocity, 1, ' m/s');
        this.heightSlider = createSlider(controlsDiv, 'height', 'Height', 0, 10, this.height, 0.1, ' m');
        this.forceSlider = createSlider(controlsDiv, 'force', 'Applied Force', 0, 200, this.force, 1, ' N');
        this.distanceSlider = createSlider(controlsDiv, 'distance', 'Distance', 0, 2, this.distance, 0.1, ' m');
        
        this.container.appendChild(controlsDiv);
        
        this.resultsDiv = document.createElement('div');
        this.resultsDiv.className = 'calculation-results';
        this.container.appendChild(this.resultsDiv);
        
        // Add event listeners
        [this.massSlider, this.velocitySlider, this.heightSlider, this.forceSlider, this.distanceSlider]
            .forEach(slider => slider.addEventListener('input', () => this.updateCalculation()));
        
        this.updateCalculation();
    }
    
    updateCalculation() {
        this.mass = parseFloat(this.massSlider.value);
        this.velocity = parseFloat(this.velocitySlider.value);
        this.height = parseFloat(this.heightSlider.value);
        this.force = parseFloat(this.forceSlider.value);
        this.distance = parseFloat(this.distanceSlider.value);
        
        const kineticEnergy = 0.5 * this.mass * this.velocity * this.velocity;
        const potentialEnergy = this.mass * PHYSICS_CONSTANTS.GRAVITY * this.height;
        const workDone = this.force * this.distance;
        const totalEnergy = kineticEnergy + potentialEnergy;
        
        this.displayResults({
            kineticEnergy: roundToDecimal(kineticEnergy),
            potentialEnergy: roundToDecimal(potentialEnergy),
            workDone: roundToDecimal(workDone),
            totalEnergy: roundToDecimal(totalEnergy)
        });
    }
    
    displayResults(results) {
        this.resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-item">
                    <strong>Kinetic Energy (KE):</strong> ${results.kineticEnergy} J
                    <div class="formula">KE = ½mv² = ½(${this.mass})(${this.velocity})²</div>
                </div>
                <div class="result-item">
                    <strong>Potential Energy (PE):</strong> ${results.potentialEnergy} J
                    <div class="formula">PE = mgh = (${this.mass})(${PHYSICS_CONSTANTS.GRAVITY})(${this.height})</div>
                </div>
                <div class="result-item">
                    <strong>Work Done (W):</strong> ${results.workDone} J
                    <div class="formula">W = F⋅d = (${this.force})(${this.distance})</div>
                </div>
                <div class="result-item">
                    <strong>Total Mechanical Energy:</strong> ${results.totalEnergy} J
                    <div class="formula">E = KE + PE</div>
                </div>
            </div>
        `;
    }
}