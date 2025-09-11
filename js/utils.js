/**
 * Utility Functions
 * Common helper functions for the Physics of Baseball application
 */

/**
 * Format numbers for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return value.toFixed(decimals);
}

/**
 * Convert units
 */
export const units = {
    metersToFeet: (m) => m * 3.28084,
    feetToMeters: (ft) => ft / 3.28084,
    mpsToMph: (mps) => mps * 2.237,
    mphToMps: (mph) => mph / 2.237,
    kgToPounds: (kg) => kg * 2.20462,
    poundsToKg: (lbs) => lbs / 2.20462
};

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Simple event emitter for component communication
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

/**
 * Simple animation helpers
 */
export const animate = {
    /**
     * Linear interpolation
     */
    lerp: (start, end, progress) => start + (end - start) * progress,

    /**
     * Easing functions
     */
    easing: {
        linear: t => t,
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeOut: t => t * (2 - t)
    },

    /**
     * Simple animation loop
     */
    tween: (duration, callback, easing = 'linear') => {
        const start = performance.now();
        const easingFunc = animate.easing[easing] || animate.easing.linear;

        function frame(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunc(progress);

            callback(easedProgress);

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    }
};

/**
 * Local storage helpers
 */
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

/**
 * DOM helpers
 */
export const dom = {
    /**
     * Create element with attributes and content
     */
    create: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.textContent = content;
        }

        return element;
    },

    /**
     * Wait for element to appear
     */
    waitForElement: (selector, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    },

    /**
     * Smooth scroll to element
     */
    scrollTo: (element, offset = 0) => {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
};

/**
 * Simple validation helpers
 */
export const validate = {
    isNumber: (value) => typeof value === 'number' && !isNaN(value),
    isPositive: (value) => validate.isNumber(value) && value > 0,
    inRange: (value, min, max) => validate.isNumber(value) && value >= min && value <= max,
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
};

/**
 * Loading state management
 */
export class LoadingManager {
    constructor() {
        this.loadingStates = new Set();
        this.callbacks = [];
    }

    start(key) {
        this.loadingStates.add(key);
        this.notify();
    }

    end(key) {
        this.loadingStates.delete(key);
        this.notify();
    }

    isLoading(key = null) {
        if (key) return this.loadingStates.has(key);
        return this.loadingStates.size > 0;
    }

    onStateChange(callback) {
        this.callbacks.push(callback);
    }

    notify() {
        this.callbacks.forEach(callback => callback(this.isLoading()));
    }
}

// Create global loading manager
export const loading = new LoadingManager();