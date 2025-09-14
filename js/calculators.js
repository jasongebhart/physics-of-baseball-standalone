/**
 * Interactive Calculator Components
 * Simple, reusable calculators for physics education
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
} from './physics.js';

/**
 * Create a slider input with live updates
 */
export function createSlider(container, id, label, min, max, value, step = 1, unit = '') {
    const div = document.createElement('div');
    div.className = 'slider-container';
    
    div.innerHTML = `
        <label for="${id}">${label}:</label>
        <input type="range" id="${id}" min="${min}" max="${max}" value="${value}" step="${step}">
        <span class="slider-value">${value}${unit}</span>
    `;
    
    const slider = div.querySelector('input');
    const valueSpan = div.querySelector('.slider-value');
    
    slider.addEventListener('input', () => {
        valueSpan.textContent = slider.value + unit;
    });
    
    container.appendChild(div);
    return slider;
}

/**
 * Create a canvas for trajectory visualization
 */
export function createCanvas(container, width = 500, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '1px solid #ccc';
    canvas.style.backgroundColor = '#f9f9f9';
    container.appendChild(canvas);
    return canvas;
}

/**
 * Projectile Motion Calculator
 */
export class ProjectileCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`ProjectileCalculator: Container with id '${containerId}' not found`);
            return;
        }
        
        this.velocity = 30; // m/s
        this.angle = 25; // degrees
        this.height = 1.8; // meters
        this.airResistance = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h3>⚾ Projectile Motion Calculator</h3>
            <div class="controls"></div>
            <canvas id="trajectory-canvas" width="500" height="350"></canvas>
            <div class="results"></div>
        `;
        
        const controls = this.container.querySelector('.controls');
        
        // Create sliders
        this.velocitySlider = createSlider(controls, 'velocity', 'Initial Velocity', 10, 50, this.velocity, 1, ' m/s');
        this.angleSlider = createSlider(controls, 'angle', 'Launch Angle', 0, 90, this.angle, 1, '°');
        this.heightSlider = createSlider(controls, 'height', 'Release Height', 0, 5, this.height, 0.1, ' m');
        
        // Air resistance checkbox
        const airDiv = document.createElement('div');
        airDiv.innerHTML = `
            <label>
                <input type="checkbox" id="air-resistance"> Include Air Resistance
            </label>
        `;
        controls.appendChild(airDiv);
        
        this.canvas = this.container.querySelector('#trajectory-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.results = this.container.querySelector('.results');
        
        // Add event listeners
        this.velocitySlider.addEventListener('input', () => this.update());
        this.angleSlider.addEventListener('input', () => this.update());
        this.heightSlider.addEventListener('input', () => this.update());
        this.container.querySelector('#air-resistance').addEventListener('change', (e) => {
            this.airResistance = e.target.checked;
            this.update();
        });
        
        this.update();
    }
    
    update() {
        this.velocity = parseFloat(this.velocitySlider.value);
        this.angle = parseFloat(this.angleSlider.value);
        this.height = parseFloat(this.heightSlider.value);
        
        const result = calculateProjectileMotion(this.velocity, this.angle, this.height, this.airResistance);
        this.displayResults(result);
        this.drawTrajectory(result);
    }
    
    displayResults(result) {
        this.results.innerHTML = `
            <div class="result-grid">
                <div><strong>Time of Flight:</strong> ${result.timeOfFlight}s</div>
                <div><strong>Maximum Height:</strong> ${result.maxHeight}m</div>
                <div><strong>Range:</strong> ${result.range}m</div>
                <div><strong>Impact Velocity:</strong> ${result.impactVelocity} m/s</div>
            </div>
        `;
    }
    
    drawTrajectory(result) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw trajectory
        const maxX = Math.max(result.range * 1.1, 50);
        const maxY = Math.max(result.maxHeight * 1.2, 10);
        
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const angleRad = this.angle * Math.PI / 180;
        const vx0 = this.velocity * Math.cos(angleRad);
        const vy0 = this.velocity * Math.sin(angleRad);
        
        for (let i = 0; i <= 100; i++) {
            const t = (result.timeOfFlight * i) / 100;
            const x = vx0 * t;
            const y = this.height + vy0 * t - 0.5 * PHYSICS_CONSTANTS.GRAVITY * t * t;
            
            if (y < 0) break;
            
            const pixelX = 40 + (x / maxX) * (canvas.width - 80);
            const pixelY = canvas.height - 40 - (y / maxY) * (canvas.height - 80);
            
            if (i === 0) ctx.moveTo(pixelX, pixelY);
            else ctx.lineTo(pixelX, pixelY);
        }
        
        ctx.stroke();
        
        // Draw ground
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(40, canvas.height - 40);
        ctx.lineTo(canvas.width - 40, canvas.height - 40);
        ctx.stroke();
    }
}

/**
 * Energy Calculator
 */
export class EnergyCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`EnergyCalculator: Container with id '${containerId}' not found`);
            return;
        }
        
        this.mass = PHYSICS_CONSTANTS.BASEBALL_MASS;
        this.velocity = 40;
        this.height = 2;
        this.force = 50;
        this.distance = 0.5;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h3>⚡ Energy & Work Calculator</h3>
            <div class="controls"></div>
            <div class="results"></div>
        `;
        
        const controls = this.container.querySelector('.controls');
        
        this.massSlider = createSlider(controls, 'mass', 'Mass', 0.1, 1, this.mass, 0.01, ' kg');
        this.velocitySlider = createSlider(controls, 'velocity-e', 'Velocity', 0, 50, this.velocity, 1, ' m/s');
        this.heightSlider = createSlider(controls, 'height-e', 'Height', 0, 10, this.height, 0.1, ' m');
        this.forceSlider = createSlider(controls, 'force', 'Applied Force', 0, 200, this.force, 1, ' N');
        this.distanceSlider = createSlider(controls, 'distance', 'Distance', 0, 2, this.distance, 0.1, ' m');
        
        this.results = this.container.querySelector('.results');
        
        // Add event listeners
        [this.massSlider, this.velocitySlider, this.heightSlider, this.forceSlider, this.distanceSlider]
            .forEach(slider => slider.addEventListener('input', () => this.update()));
        
        this.update();
    }
    
    update() {
        this.mass = parseFloat(this.massSlider.value);
        this.velocity = parseFloat(this.velocitySlider.value);
        this.height = parseFloat(this.heightSlider.value);
        this.force = parseFloat(this.forceSlider.value);
        this.distance = parseFloat(this.distanceSlider.value);
        
        const kineticEnergy = calculateKineticEnergy(this.mass, this.velocity);
        const potentialEnergy = calculatePotentialEnergy(this.mass, this.height);
        const work = calculateWork(this.force, this.distance);
        const totalEnergy = kineticEnergy + potentialEnergy;
        
        this.results.innerHTML = `
            <div class="result-grid">
                <div><strong>Kinetic Energy:</strong> ${roundToDecimal(kineticEnergy)} J</div>
                <div><strong>Potential Energy:</strong> ${roundToDecimal(potentialEnergy)} J</div>
                <div><strong>Work Done:</strong> ${roundToDecimal(work)} J</div>
                <div><strong>Total Energy:</strong> ${roundToDecimal(totalEnergy)} J</div>
            </div>
            <div class="formulas">
                <div>KE = ½mv² = ½(${this.mass})(${this.velocity})²</div>
                <div>PE = mgh = (${this.mass})(${PHYSICS_CONSTANTS.GRAVITY})(${this.height})</div>
                <div>W = F⋅d = (${this.force})(${this.distance})</div>
            </div>
        `;
    }
}

/**
 * Simple Velocity Calculator
 */
export class VelocityCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`VelocityCalculator: Container with id '${containerId}' not found`);
            return;
        }
        this.init();
    }

    init() {
        if (!this.container) return;

        this.container.className = 'velocity-calculator';
        this.container.innerHTML = `
            <h4>🧮 Velocity Calculator</h4>
            <div class="calculator-inputs">
                <div class="input-group">
                    <label for="distance">
                        Distance (meters):
                        <small>Distance from pitcher's mound to home plate</small>
                    </label>
                    <input type="number" id="distance" value="18.44" min="0.1" step="0.01"
                           placeholder="Enter distance in meters (e.g., 18.44)">
                    <small class="input-hint">Enter distance in meters (e.g., 18.44)</small>
                </div>
                <div class="input-group">
                    <label for="time">
                        Time (seconds):
                        <small>Time for ball to travel the distance</small>
                    </label>
                    <input type="number" id="time" value="0.4" min="0.01" step="0.01"
                           placeholder="Enter time in seconds (e.g., 0.4)">
                    <small class="input-hint">Enter time in seconds (e.g., 0.4)</small>
                </div>
            </div>
            <div class="calculator-results">
                <h5>Results:</h5>
                <p>Velocity: <span class="result-value" id="velocity-ms">46.1</span> m/s</p>
                <p>Velocity: <span class="result-value" id="velocity-mph">103.1</span> mph</p>
            </div>
            <div class="calculation-breakdown">
                <details>
                    <summary>Show calculation steps</summary>
                    <div class="formula">
                        <p><strong>Formula:</strong> v = d ÷ t</p>
                        <p id="calculation-step">v = 18.44 m ÷ 0.4 s = 46.1 m/s</p>
                        <p><small>To convert to mph: multiply by 2.237</small></p>
                    </div>
                </details>
            </div>
        `;

        const distanceInput = this.container.querySelector('#distance');
        const timeInput = this.container.querySelector('#time');
        const resultMs = this.container.querySelector('#velocity-ms');
        const resultMph = this.container.querySelector('#velocity-mph');
        const calculationStep = this.container.querySelector('#calculation-step');

        const update = () => {
            const distance = parseFloat(distanceInput.value) || 0;
            const time = parseFloat(timeInput.value) || 0.1;

            if (time === 0) {
                resultMs.textContent = '∞';
                resultMph.textContent = '∞';
                calculationStep.textContent = 'Cannot divide by zero';
                return;
            }

            const velocityMs = roundToDecimal(distance / time, 1);
            const velocityMph = roundToDecimal(velocityMs * 2.237, 1);

            resultMs.textContent = velocityMs;
            resultMph.textContent = velocityMph;
            calculationStep.textContent = `v = ${distance} m ÷ ${time} s = ${velocityMs} m/s`;

            // Add visual feedback based on velocity range
            this.addVisualFeedback(velocityMph);
        };

        const validateInput = (input) => {
            const value = parseFloat(input.value);
            if (isNaN(value) || value <= 0) {
                input.style.borderColor = '#ef4444';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
            } else {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }
        };

        distanceInput.addEventListener('input', () => {
            validateInput(distanceInput);
            update();
        });

        timeInput.addEventListener('input', () => {
            validateInput(timeInput);
            update();
        });

        // Add focus effects
        [distanceInput, timeInput].forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });

        update();
    }

    addVisualFeedback(velocityMph) {
        const results = this.container.querySelector('.calculator-results');
        results.classList.remove('slow-pitch', 'fastball', 'very-fast');

        if (velocityMph < 70) {
            results.classList.add('slow-pitch');
        } else if (velocityMph > 100) {
            results.classList.add('very-fast');
        } else {
            results.classList.add('fastball');
        }
    }
}