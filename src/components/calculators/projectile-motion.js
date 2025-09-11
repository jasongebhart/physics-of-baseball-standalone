/**
 * Projectile Motion Calculator
 * Interactive calculator for baseball trajectory analysis with optional air resistance
 */

import { PHYSICS_CONSTANTS } from '../../utils/physics-constants.js';
import { roundToDecimal, createSlider, createCanvas } from '../../utils/calculator-utilities.js';

export class ProjectileMotionCalculator {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            theme: 'auto',
            enableAnimation: true,
            showEquations: true,
            ...options
        };
        
        this.velocity = 30; // m/s
        this.angle = 25; // degrees
        this.height = 1.8; // meters
        this.airResistance = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'projectile-calculator';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = '⚾ Projectile Motion Calculator';
        title.className = 'calculator-title';
        this.container.appendChild(title);
        
        // Create controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'calculator-controls';
        
        this.velocitySlider = createSlider(controlsDiv, 'velocity', 'Initial Velocity', 10, 50, this.velocity, 1, ' m/s');
        this.angleSlider = createSlider(controlsDiv, 'angle', 'Launch Angle', 0, 90, this.angle, 1, '°');
        this.heightSlider = createSlider(controlsDiv, 'height', 'Release Height', 0, 5, this.height, 0.1, ' m');
        
        // Air resistance checkbox
        const airDiv = document.createElement('div');
        airDiv.className = 'checkbox-container';
        const airCheck = document.createElement('input');
        airCheck.type = 'checkbox';
        airCheck.id = 'air-resistance';
        airCheck.checked = this.airResistance;
        const airLabel = document.createElement('label');
        airLabel.setAttribute('for', 'air-resistance');
        airLabel.textContent = 'Include Air Resistance';
        airDiv.appendChild(airCheck);
        airDiv.appendChild(airLabel);
        controlsDiv.appendChild(airDiv);
        
        this.container.appendChild(controlsDiv);
        
        // Create canvas for trajectory
        this.canvas = createCanvas(this.container, 500, 350);
        this.ctx = this.canvas.getContext('2d');
        
        // Create results display
        this.resultsDiv = document.createElement('div');
        this.resultsDiv.className = 'calculation-results';
        this.container.appendChild(this.resultsDiv);
        
        // Add event listeners
        this.velocitySlider.addEventListener('input', () => this.updateCalculation());
        this.angleSlider.addEventListener('input', () => this.updateCalculation());
        this.heightSlider.addEventListener('input', () => this.updateCalculation());
        airCheck.addEventListener('change', () => {
            this.airResistance = airCheck.checked;
            this.updateCalculation();
        });
        
        this.updateCalculation();
    }
    
    updateCalculation() {
        this.velocity = parseFloat(this.velocitySlider.value);
        this.angle = parseFloat(this.angleSlider.value);
        this.height = parseFloat(this.heightSlider.value);
        
        const results = this.calculateTrajectory();
        this.displayResults(results);
        this.drawTrajectory(results);
    }
    
    calculateTrajectory() {
        const angleRad = this.angle * Math.PI / 180;
        const vx0 = this.velocity * Math.cos(angleRad);
        const vy0 = this.velocity * Math.sin(angleRad);
        
        let timeOfFlight, maxHeight, range, impactVelocity;
        
        if (!this.airResistance) {
            // Simple projectile motion (no air resistance)
            timeOfFlight = (vy0 + Math.sqrt(vy0 * vy0 + 2 * PHYSICS_CONSTANTS.GRAVITY * this.height)) / PHYSICS_CONSTANTS.GRAVITY;
            maxHeight = this.height + (vy0 * vy0) / (2 * PHYSICS_CONSTANTS.GRAVITY);
            range = vx0 * timeOfFlight;
            const vyFinal = vy0 - PHYSICS_CONSTANTS.GRAVITY * timeOfFlight;
            impactVelocity = Math.sqrt(vx0 * vx0 + vyFinal * vyFinal);
        } else {
            // Numerical integration with air resistance
            const dt = 0.01;
            let t = 0, x = 0, y = this.height;
            let vx = vx0, vy = vy0;
            maxHeight = this.height;
            
            const trajectory = [{x: 0, y: this.height}];
            
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
                trajectory.push({x, y});
            }
            
            timeOfFlight = t;
            range = x;
            impactVelocity = Math.sqrt(vx * vx + vy * vy);
        }
        
        return {
            timeOfFlight: roundToDecimal(timeOfFlight),
            maxHeight: roundToDecimal(maxHeight),
            range: roundToDecimal(range),
            impactVelocity: roundToDecimal(impactVelocity),
            initialVelocity: this.velocity,
            launchAngle: this.angle,
            releaseHeight: this.height
        };
    }
    
    displayResults(results) {
        this.resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-item">
                    <strong>Time of Flight:</strong> ${results.timeOfFlight} seconds
                </div>
                <div class="result-item">
                    <strong>Maximum Height:</strong> ${results.maxHeight} meters
                </div>
                <div class="result-item">
                    <strong>Horizontal Range:</strong> ${results.range} meters
                </div>
                <div class="result-item">
                    <strong>Impact Velocity:</strong> ${results.impactVelocity} m/s
                </div>
            </div>
        `;
    }
    
    drawTrajectory(results) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up coordinate system
        const margin = 40;
        const plotWidth = canvas.width - 2 * margin;
        const plotHeight = canvas.height - 2 * margin;
        const maxX = Math.max(results.range * 1.1, 50);
        const maxY = Math.max(results.maxHeight * 1.2, 10);
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.moveTo(margin, canvas.height - margin);
        ctx.lineTo(margin, margin);
        ctx.stroke();
        
        // Draw trajectory
        const angleRad = this.angle * Math.PI / 180;
        const vx0 = this.velocity * Math.cos(angleRad);
        const vy0 = this.velocity * Math.sin(angleRad);
        
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        let firstPoint = true;
        const numPoints = 100;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = (results.timeOfFlight * i) / numPoints;
            let x, y;
            
            if (!this.airResistance) {
                x = vx0 * t;
                y = this.height + vy0 * t - 0.5 * PHYSICS_CONSTANTS.GRAVITY * t * t;
            } else {
                // For air resistance, use simplified approximation for drawing
                x = vx0 * t * (1 - 0.1 * t);
                y = this.height + vy0 * t - 0.5 * PHYSICS_CONSTANTS.GRAVITY * t * t - 0.05 * t * t;
            }
            
            if (y < 0) break;
            
            const pixelX = margin + (x / maxX) * plotWidth;
            const pixelY = canvas.height - margin - (y / maxY) * plotHeight;
            
            if (firstPoint) {
                ctx.moveTo(pixelX, pixelY);
                firstPoint = false;
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        ctx.stroke();
        
        // Draw ground
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.stroke();
        
        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Distance (m)', canvas.width / 2 - 30, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Height (m)', -30, 0);
        ctx.restore();
    }
}