/**
 * Calculator Utilities
 * Common utility functions used across all physics calculators
 */

/**
 * Round a number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded value
 */
export function roundToDecimal(value, decimals = 2) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Create an interactive slider element
 * @param {HTMLElement} container - Container to append slider to
 * @param {string} id - Unique ID for the slider
 * @param {string} label - Display label for the slider
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} value - Initial value
 * @param {number} step - Step increment
 * @param {string} unit - Unit to display (optional)
 * @returns {HTMLInputElement} The created slider element
 */
export function createSlider(container, id, label, min, max, value, step, unit = '') {
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

/**
 * Create a canvas element for visualizations
 * @param {HTMLElement} container - Container to append canvas to
 * @param {number} width - Canvas width (default: 400)
 * @param {number} height - Canvas height (default: 300)
 * @returns {HTMLCanvasElement} The created canvas element
 */
export function createCanvas(container, width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = 'physics-canvas';
    container.appendChild(canvas);
    return canvas;
}