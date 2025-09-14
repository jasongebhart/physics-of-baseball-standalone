# Physics of Baseball - Educational Web Application

## Overview
A modern vanilla JavaScript educational web application that explores physics concepts through baseball scenarios. The project provides interactive calculators, quizzes, and week-by-week learning modules to teach physics fundamentals using America's favorite pastime as a teaching tool.

## Core Components
- **index.html**: Main landing page with course overview and 13-week curriculum navigation
- **weeks/**: Directory containing 13 individual lesson HTML files (week-01.html through week-13.html)
- **js/physics.js**: Core physics calculation engine with projectile motion, energy, momentum, and collision physics
- **js/calculators.js**: Interactive calculator components with sliders, canvas visualizations, and real-time calculations
- **js/assessment.js**: Quiz and assessment system with scoring and progress tracking
- **js/interactive-learning.js**: Modal dialogs and interactive learning elements for physics terms
- **js/improved-ux.js**: Course progress management, accessibility enhancements, and user experience features
- **css/main.css**: Core stylesheet with modern CSS Grid/Flexbox layouts and custom properties
- **css/calculators.css**: Specialized styling for interactive calculator components
- **css/improved.css**: Enhanced UX styling with accessibility and responsive design features
- **data/quizzes.json**: Structured quiz questions, explanations, and scoring data
- **data/practice-problems.json**: Physics practice problems with step-by-step solutions
- **tests/physics.test.js**: Browser-based physics calculation validation tests
- **tests/regression/**: Playwright end-to-end test suite for user interface and functionality testing

## Execution Flow
1. **Application Startup**: User opens index.html which loads the main stylesheet and JavaScript modules
2. **Course Navigation**: Interactive week cards display course content with progress tracking via localStorage
3. **Weekly Content**: Each week HTML file imports shared JS modules and presents physics concepts with embedded calculators
4. **Calculator Interaction**: Physics calculators use real-time input validation, perform calculations via physics.js, and display visual results on HTML5 canvas
5. **Assessment System**: Quiz components load questions from JSON data, track user responses, and provide immediate feedback with explanations
6. **Progress Management**: LocalStorage persists user progress, completed assessments, and course advancement state
7. **Testing Validation**: Physics calculations are validated through browser-based unit tests and Playwright regression tests

### Execution Example
```bash
# Start local development server
python -m http.server 8080

# Open in browser
http://localhost:8080

# Run physics validation tests
http://localhost:8080/tests/test-runner.html

# Run full regression test suite
npm test
```

## External Dependencies
- **Requirements:**
  - Python 3.x (for local HTTP server)
  - Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
  - Node.js 18+ (for Playwright testing only)
- **Dev Dependencies:**
  - @playwright/test: End-to-end testing framework
  - cross-env: Cross-platform environment variables
  - wait-on: Service availability testing
- **Inputs:**
  - User interactions via form inputs, sliders, and buttons
  - JSON data files for quizzes and practice problems
  - LocalStorage for progress persistence
  - Physics parameters for calculations (velocity, angle, mass, etc.)
- **Outputs:**
  - Real-time physics calculations and visualizations
  - Interactive trajectory plots on HTML5 canvas
  - Quiz scores and feedback
  - Progress tracking data stored in browser LocalStorage
  - Test reports via Playwright HTML reporter