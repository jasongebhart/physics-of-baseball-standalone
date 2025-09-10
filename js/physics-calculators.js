
/**
 * Physics of Baseball - Interactive Calculators
 * Comprehensive JavaScript library for all physics calculators used in the course
 */

// Physics constants
export const PHYSICS_CONSTANTS = {
    GRAVITY: 9.81, // m/s²
    AIR_DENSITY: 1.225, // kg/m³ at sea level
    BASEBALL_MASS: 0.145, // kg (5.125 oz)
    BASEBALL_RADIUS: 0.0366, // m (2.9 inches diameter)
    BASEBALL_CIRCUMFERENCE: 0.229, // m (9 inches)
    DRAG_COEFFICIENT: 0.3, // typical for baseball
    MAGNUS_COEFFICIENT: 0.1 // typical for baseball
};

// Utility functions
function roundToDecimal(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function createSlider(container, id, label, min, max, value, step, unit = '') {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    
    const labelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    labelElement.setAttribute('for', id);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;
    slider.className = 'physics-slider';
    
    const display = document.createElement('span');
    display.className = 'slider-value';
    display.textContent = `${value}${unit}`;
    
    slider.addEventListener('input', function() {
        display.textContent = `${this.value}${unit}`;
    });
    
    sliderContainer.appendChild(labelElement);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(display);
    container.appendChild(sliderContainer);
    
    return slider;
}

function createCanvas(container, width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'physics-canvas';
    container.appendChild(canvas);
    return canvas;
}

/**
 * Projectile Motion Calculator
 */
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

/**
 * Energy Calculator
 */
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

/**
 * Momentum Calculator
 */
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

/**
 * Magnus Effect Calculator
 */
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
