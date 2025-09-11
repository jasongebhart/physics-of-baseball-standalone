import { ProjectileMotionCalculator, EnergyCalculator, MomentumCalculator, MagnusCalculator } from './physics-calculators.js';
import { AssessmentSystem } from './assessment-system.js';
import { PracticeProblems } from './practice-problems.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the assessment system
    const assessmentSystem = new AssessmentSystem();
    await assessmentSystem.init(); // This loads the quiz data

    // Initialize the practice problems system
    const practiceProblems = new PracticeProblems();
    await practiceProblems.init(); // This loads the practice problems data

    // Auto-initialize quizzes if containers exist
    const quizContainers = document.querySelectorAll('[data-quiz]');
    quizContainers.forEach(container => {
        const weekId = container.getAttribute('data-quiz');
        assessmentSystem.createQuiz(weekId, container.id);
    });

    // Auto-initialize practice problems if containers exist
    const practiceContainers = document.querySelectorAll('[id$="-practice-container"]');
    practiceContainers.forEach(container => {
        const weekId = container.id.replace('-practice-container', '');
        practiceProblems.createPracticeSet(weekId, container.id);
    });

    // Initialize all calculator widgets
    const calculatorWidgets = {
        'projectile-calculator': ProjectileMotionCalculator,
        'energy-calculator': EnergyCalculator,
        'momentum-calculator': MomentumCalculator,
        'magnus-calculator': MagnusCalculator
    };
    
    Object.keys(calculatorWidgets).forEach(className => {
        const elements = document.getElementsByClassName(className);
        Array.from(elements).forEach(element => {
            if (!element.hasAttribute('data-initialized')) {
                new calculatorWidgets[className](element);
                element.setAttribute('data-initialized', 'true');
            }
        });
    });
});