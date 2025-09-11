/**
 * Physics Constants for Baseball Calculations
 * Centralized physics constants used across all calculators
 */

export const PHYSICS_CONSTANTS = {
    GRAVITY: 9.81, // m/s²
    AIR_DENSITY: 1.225, // kg/m³ at sea level
    BASEBALL_MASS: 0.145, // kg (5.125 oz)
    BASEBALL_RADIUS: 0.0366, // m (2.9 inches diameter)
    BASEBALL_CIRCUMFERENCE: 0.229, // m (9 inches)
    DRAG_COEFFICIENT: 0.3, // typical for baseball
    MAGNUS_COEFFICIENT: 0.1 // typical for baseball
};

// Individual constant exports for convenience
export const {
    GRAVITY,
    AIR_DENSITY,
    BASEBALL_MASS,
    BASEBALL_RADIUS,
    BASEBALL_CIRCUMFERENCE,
    DRAG_COEFFICIENT,
    MAGNUS_COEFFICIENT
} = PHYSICS_CONSTANTS;