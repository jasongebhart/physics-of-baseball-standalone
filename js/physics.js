/**
 * Physics Calculations for Baseball
 * Core physics equations and constants for educational simulations
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

// Utility function for rounding
export function roundToDecimal(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calculate projectile motion for baseball trajectory
 * @param {number} velocity - Initial velocity in m/s
 * @param {number} angle - Launch angle in degrees
 * @param {number} height - Initial height in meters
 * @param {boolean} airResistance - Include air resistance calculation
 * @returns {Object} Motion parameters (time, range, max height, impact velocity)
 */
export function calculateProjectileMotion(velocity, angle, height, airResistance = false) {
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
        impactVelocity: roundToDecimal(impactVelocity),
        initialVelocity: velocity,
        launchAngle: angle,
        releaseHeight: height
    };
}

/**
 * Calculate kinetic energy
 * @param {number} mass - Mass in kg
 * @param {number} velocity - Velocity in m/s
 * @returns {number} Kinetic energy in Joules
 */
export function calculateKineticEnergy(mass, velocity) {
    return 0.5 * mass * velocity * velocity;
}

/**
 * Calculate potential energy
 * @param {number} mass - Mass in kg
 * @param {number} height - Height in meters
 * @returns {number} Potential energy in Joules
 */
export function calculatePotentialEnergy(mass, height) {
    return mass * PHYSICS_CONSTANTS.GRAVITY * height;
}

/**
 * Calculate work done by force
 * @param {number} force - Force in Newtons
 * @param {number} distance - Distance in meters
 * @returns {number} Work in Joules
 */
export function calculateWork(force, distance) {
    return force * distance;
}

/**
 * Calculate Magnus force effect on baseball
 * @param {number} velocity - Ball velocity in m/s
 * @param {number} spinRate - Spin rate in RPM
 * @param {number} spinAxis - Spin axis angle in degrees
 * @returns {Object} Magnus force components and trajectory deviation
 */
export function calculateMagnusEffect(velocity, spinRate, spinAxis) {
    const spinRateRad = (spinRate * 2 * Math.PI) / 60; // Convert RPM to rad/s
    const spinAxisRad = spinAxis * Math.PI / 180;
    
    // Magnus force magnitude
    const magnusForce = PHYSICS_CONSTANTS.MAGNUS_COEFFICIENT * 
                       PHYSICS_CONSTANTS.AIR_DENSITY * 
                       Math.PI * PHYSICS_CONSTANTS.BASEBALL_RADIUS * PHYSICS_CONSTANTS.BASEBALL_RADIUS *
                       velocity * spinRateRad;
    
    // Force components
    const forceX = magnusForce * Math.sin(spinAxisRad);
    const forceY = magnusForce * Math.cos(spinAxisRad);
    
    return {
        magnusForce: roundToDecimal(magnusForce),
        forceX: roundToDecimal(forceX),
        forceY: roundToDecimal(forceY),
        acceleration: roundToDecimal(magnusForce / PHYSICS_CONSTANTS.BASEBALL_MASS),
        spinRate,
        spinAxis
    };
}

/**
 * Calculate momentum and collision physics
 * @param {number} mass - Mass in kg
 * @param {number} velocity - Velocity in m/s
 * @returns {number} Momentum in kg⋅m/s
 */
export function calculateMomentum(mass, velocity) {
    return mass * velocity;
}

/**
 * Calculate elastic collision between bat and ball
 * @param {number} ballMass - Ball mass in kg
 * @param {number} batMass - Bat effective mass in kg
 * @param {number} ballVelocity - Ball initial velocity in m/s
 * @param {number} batVelocity - Bat velocity in m/s
 * @param {number} restitution - Coefficient of restitution (0-1)
 * @returns {Object} Final velocities after collision
 */
export function calculateCollision(ballMass, batMass, ballVelocity, batVelocity, restitution = 0.5) {
    const totalMass = ballMass + batMass;
    
    // Conservation of momentum and energy with restitution
    const ballFinalVelocity = ((ballMass - restitution * batMass) * ballVelocity + 
                              (1 + restitution) * batMass * batVelocity) / totalMass;
    
    const batFinalVelocity = ((batMass - restitution * ballMass) * batVelocity + 
                             (1 + restitution) * ballMass * ballVelocity) / totalMass;
    
    return {
        ballFinalVelocity: roundToDecimal(ballFinalVelocity),
        batFinalVelocity: roundToDecimal(batFinalVelocity),
        energyLoss: roundToDecimal(
            0.5 * ballMass * ballVelocity * ballVelocity + 0.5 * batMass * batVelocity * batVelocity -
            (0.5 * ballMass * ballFinalVelocity * ballFinalVelocity + 0.5 * batMass * batFinalVelocity * batFinalVelocity)
        )
    };
}