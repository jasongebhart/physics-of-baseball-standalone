import { 
    ProjectileCalculator,
    VelocityCalculator, 
    EnergyCalculator
} from './calculators.js';

import { QuizSystem, PracticeProblems } from './assessment.js';
import { ProgressTracker } from './progress.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress tracking
    const progressTracker = new ProgressTracker();
    window.progressTracker = progressTracker;
    
    // Initialize calculator widgets
    const calculatorWidgets = {
        'projectile-calculator': ProjectileCalculator,
        'velocity-calculator': VelocityCalculator,
        'energy-calculator': EnergyCalculator
    };
    
    Object.keys(calculatorWidgets).forEach(className => {
        const elements = document.getElementsByClassName(className);
        Array.from(elements).forEach(element => {
            if (!element.hasAttribute('data-initialized')) {
                try {
                    new calculatorWidgets[className](element);
                    element.setAttribute('data-initialized', 'true');
                } catch (error) {
                    console.warn(`Failed to initialize ${className}:`, error);
                }
            }
        });
    });

    // Make systems available globally
    if (typeof window.QuizSystem === 'undefined') {
        window.QuizSystem = QuizSystem;
        window.PracticeProblems = PracticeProblems;
    }
});