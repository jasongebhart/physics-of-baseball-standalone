/**
 * Momentum Calculator
 * Interactive calculator for momentum and collision calculations in baseball
 */

import { roundToDecimal, createSlider } from '../utils/calculator-utilities.js';

export class MomentumCalculator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        
        this.mass1 = 0.145; // kg (baseball)
        this.velocity1 = 40; // m/s
        this.mass2 = 0.9; // kg (bat)
        this.velocity2 = 25; // m/s
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'momentum-calculator';
        
        const title = document.createElement('h3');
        title.textContent = '⚾ Momentum & Collision Calculator';
        title.className = 'calculator-title';
        this.container.appendChild(title);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'calculator-controls';
        
        const ballSection = document.createElement('div');
        ballSection.innerHTML = '<h4>Baseball</h4>';
        this.mass1Slider = createSlider(ballSection, 'mass1', 'Mass', 0.1, 0.3, this.mass1, 0.01, ' kg');
        this.velocity1Slider = createSlider(ballSection, 'velocity1', 'Velocity', -50, 50, this.velocity1, 1, ' m/s');
        controlsDiv.appendChild(ballSection);
        
        const batSection = document.createElement('div');
        batSection.innerHTML = '<h4>Bat</h4>';
        this.mass2Slider = createSlider(batSection, 'mass2', 'Mass', 0.5, 1.5, this.mass2, 0.1, ' kg');
        this.velocity2Slider = createSlider(batSection, 'velocity2', 'Velocity', -50, 50, this.velocity2, 1, ' m/s');
        controlsDiv.appendChild(batSection);
        
        this.container.appendChild(controlsDiv);
        
        this.resultsDiv = document.createElement('div');
        this.resultsDiv.className = 'calculation-results';
        this.container.appendChild(this.resultsDiv);
        
        // Add event listeners
        [this.mass1Slider, this.velocity1Slider, this.mass2Slider, this.velocity2Slider]
            .forEach(slider => slider.addEventListener('input', () => this.updateCalculation()));
        
        this.updateCalculation();
    }
    
    updateCalculation() {
        this.mass1 = parseFloat(this.mass1Slider.value);
        this.velocity1 = parseFloat(this.velocity1Slider.value);
        this.mass2 = parseFloat(this.mass2Slider.value);
        this.velocity2 = parseFloat(this.velocity2Slider.value);
        
        const momentum1 = this.mass1 * this.velocity1;
        const momentum2 = this.mass2 * this.velocity2;
        const totalMomentum = momentum1 + momentum2;
        
        // Elastic collision calculation
        const v1Final = ((this.mass1 - this.mass2) * this.velocity1 + 2 * this.mass2 * this.velocity2) / (this.mass1 + this.mass2);
        const v2Final = ((this.mass2 - this.mass1) * this.velocity2 + 2 * this.mass1 * this.velocity1) / (this.mass1 + this.mass2);
        
        this.displayResults({
            momentum1: roundToDecimal(momentum1),
            momentum2: roundToDecimal(momentum2),
            totalMomentum: roundToDecimal(totalMomentum),
            v1Final: roundToDecimal(v1Final),
            v2Final: roundToDecimal(v2Final)
        });
    }
    
    displayResults(results) {
        this.resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-item">
                    <strong>Baseball Momentum:</strong> ${results.momentum1} kg⋅m/s
                </div>
                <div class="result-item">
                    <strong>Bat Momentum:</strong> ${results.momentum2} kg⋅m/s
                </div>
                <div class="result-item">
                    <strong>Total Momentum:</strong> ${results.totalMomentum} kg⋅m/s
                </div>
                <div class="result-item">
                    <strong>After Collision:</strong><br>
                    Ball: ${results.v1Final} m/s<br>
                    Bat: ${results.v2Final} m/s
                </div>
            </div>
        `;
    }
}