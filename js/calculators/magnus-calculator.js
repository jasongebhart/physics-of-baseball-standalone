/**
 * Magnus Effect Calculator
 * Interactive calculator for Magnus effect calculations in baseball
 */

import { PHYSICS_CONSTANTS } from '../utils/physics-constants.js';
import { roundToDecimal, createSlider, createCanvas } from '../utils/calculator-utilities.js';

export class MagnusCalculator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        
        this.velocity = 40; // m/s
        this.spinRate = 2000; // RPM
        this.spinAxis = 0; // degrees (0 = backspin, 90 = sidespin)
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'magnus-calculator';
        
        const title = document.createElement('h3');
        title.textContent = '🌪️ Magnus Effect Calculator';
        title.className = 'calculator-title';
        this.container.appendChild(title);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'calculator-controls';
        
        this.velocitySlider = createSlider(controlsDiv, 'velocity', 'Ball Velocity', 10, 50, this.velocity, 1, ' m/s');
        this.spinSlider = createSlider(controlsDiv, 'spinRate', 'Spin Rate', 0, 4000, this.spinRate, 100, ' RPM');
        this.axisSlider = createSlider(controlsDiv, 'spinAxis', 'Spin Axis', 0, 360, this.spinAxis, 15, '°');
        
        this.container.appendChild(controlsDiv);
        
        this.canvas = createCanvas(this.container, 400, 300);
        this.ctx = this.canvas.getContext('2d');
        
        this.resultsDiv = document.createElement('div');
        this.resultsDiv.className = 'calculation-results';
        this.container.appendChild(this.resultsDiv);
        
        // Add event listeners
        [this.velocitySlider, this.spinSlider, this.axisSlider]
            .forEach(slider => slider.addEventListener('input', () => this.updateCalculation()));
        
        this.updateCalculation();
    }
    
    updateCalculation() {
        this.velocity = parseFloat(this.velocitySlider.value);
        this.spinRate = parseFloat(this.spinSlider.value);
        this.spinAxis = parseFloat(this.axisSlider.value);
        
        // Convert RPM to rad/s
        const omega = this.spinRate * 2 * Math.PI / 60;
        
        // Magnus force calculation (simplified)
        const magnusForce = PHYSICS_CONSTANTS.MAGNUS_COEFFICIENT * omega * this.velocity;
        
        // Decompose into vertical and horizontal components
        const axisRad = this.spinAxis * Math.PI / 180;
        const verticalForce = magnusForce * Math.cos(axisRad);
        const horizontalForce = magnusForce * Math.sin(axisRad);
        
        // Calculate deflection over typical flight time (2 seconds)
        const flightTime = 2; // seconds
        const verticalDeflection = 0.5 * (verticalForce / PHYSICS_CONSTANTS.BASEBALL_MASS) * flightTime * flightTime;
        const horizontalDeflection = 0.5 * (horizontalForce / PHYSICS_CONSTANTS.BASEBALL_MASS) * flightTime * flightTime;
        
        this.displayResults({
            magnusForce: roundToDecimal(magnusForce),
            verticalForce: roundToDecimal(verticalForce),
            horizontalForce: roundToDecimal(horizontalForce),
            verticalDeflection: roundToDecimal(verticalDeflection),
            horizontalDeflection: roundToDecimal(horizontalDeflection)
        });
        
        this.drawSpinVisualization();
    }
    
    displayResults(results) {
        this.resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-item">
                    <strong>Magnus Force:</strong> ${results.magnusForce} N
                </div>
                <div class="result-item">
                    <strong>Vertical Component:</strong> ${results.verticalForce} N
                </div>
                <div class="result-item">
                    <strong>Horizontal Component:</strong> ${results.horizontalForce} N
                </div>
                <div class="result-item">
                    <strong>Ball Movement:</strong><br>
                    Vertical: ${results.verticalDeflection} m<br>
                    Horizontal: ${results.horizontalDeflection} m
                </div>
            </div>
        `;
    }
    
    drawSpinVisualization() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw baseball
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50;
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw spin axis
        const axisRad = this.spinAxis * Math.PI / 180;
        const axisLength = radius * 0.8;
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(
            centerX - axisLength * Math.cos(axisRad),
            centerY - axisLength * Math.sin(axisRad)
        );
        ctx.lineTo(
            centerX + axisLength * Math.cos(axisRad),
            centerY + axisLength * Math.sin(axisRad)
        );
        ctx.stroke();
        
        // Draw seams
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        let pitchType = '';
        if (this.spinAxis >= -15 && this.spinAxis <= 15) pitchType = 'Fastball (Backspin)';
        else if (this.spinAxis >= 165 && this.spinAxis <= 195) pitchType = 'Curveball (Topspin)';
        else if (this.spinAxis >= 75 && this.spinAxis <= 105) pitchType = 'Slider (Sidespin)';
        else if (this.spinAxis >= 255 && this.spinAxis <= 285) pitchType = 'Cutter (Sidespin)';
        else pitchType = 'Mixed Spin';
        
        ctx.fillText(pitchType, centerX, 30);
        ctx.fillText(`${this.spinRate} RPM`, centerX, canvas.height - 20);
    }
}