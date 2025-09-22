# Physics of Baseball ⚾

A **modern vanilla JavaScript** educational web application exploring the physics concepts behind America's favorite pastime.

## 🚀 Quick Start

```bash
# Start the local server
python -m http.server 8080

# Open in browser
http://localhost:8080
```

That's it! No build process, no dependencies, just modern web standards.

## 📁 Project Structure

```
physics-of-baseball/
├── index.html              # Main landing page
├── weeks/                  # Week-by-week lessons
│   ├── week-01.html
│   └── week-02.html
├── js/                     # Modern JavaScript modules
│   ├── physics.js          # Core physics calculations
│   ├── calculators.js      # Interactive calculators
│   ├── assessment.js       # Quizzes and practice
│   └── utils.js            # Utility functions
├── css/                    # Modern CSS with custom properties
│   ├── main.css            # Core styles
│   └── calculators.css     # Calculator-specific styles
├── data/                   # Static JSON data
│   ├── quizzes.json
│   └── practice-problems.json
├── images/                 # Educational assets
└── tests/                  # Lightweight browser tests
    ├── physics.test.js     # Physics validation tests
    └── test-runner.html    # Browser-based test runner
```

## 🧪 Testing

**Browser-Based Testing** - No frameworks needed!

```bash
# Open test runner in browser
open tests/test-runner.html

# Or navigate to:
http://localhost:8080/tests/test-runner.html
```

- ✅ **45+ Physics Tests** - Validates all calculations
- 🌐 **Browser Native** - Runs directly in browser
- 📊 **Real-time Results** - Interactive test dashboard
- 🎯 **Physics-Focused** - Tests projectile motion, energy, momentum

## 🎓 Educational Features

### Interactive Physics Calculators
- **Projectile Motion** - Trajectory analysis with/without air resistance
- **Energy & Work** - Kinetic, potential, and work calculations  
- **Velocity** - Basic motion calculations
- **Magnus Effect** - Spin-induced trajectory changes
- **Collision Physics** - Bat-ball impact analysis

### Assessment System
- **Interactive Quizzes** - Multiple choice and short answer
- **Practice Problems** - Step-by-step physics problem solving
- **Progress Tracking** - Local storage of student progress
- **Instant Feedback** - Immediate results and explanations

### Modern Web Features
- **ES6 Modules** - Clean, maintainable code organization
- **CSS Grid & Flexbox** - Responsive layouts without frameworks
- **Web APIs** - Canvas for visualizations, LocalStorage for persistence
- **Custom Properties** - CSS variables for consistent theming

## 🔬 Physics Concepts Covered

### Week 1: Motion Fundamentals
- Distance vs. displacement
- Speed vs. velocity
- Acceleration and motion analysis

### Week 2: Projectile Motion
- Trajectory calculations
- Air resistance effects
- Launch angle optimization

### Week 3: Energy & Work
- Kinetic and potential energy
- Energy conservation
- Work-energy theorem

### Week 4+: Advanced Topics
- Magnus effect and spin
- Collision physics
- Momentum conservation

## 💡 Why This Approach?

### For Educators
- **No Complex Setup** - Just open HTML files
- **Easy Customization** - Clear, readable code
- **Platform Independent** - Works on any device with a browser
- **Offline Capable** - No internet required after download

### For Developers & AI
- **LLM-Friendly** - Simple structure, clear patterns
- **Modern Standards** - Uses latest web technologies
- **No Build Step** - Direct browser execution
- **Minimal Dependencies** - Only what's absolutely needed

### For Students
- **Interactive Learning** - Hands-on physics exploration
- **Visual Feedback** - Real-time calculations and graphs
- **Self-Paced** - Work through content at own speed
- **Accessible** - Works on mobile, tablet, desktop

## 🛠️ Development

### Adding New Calculators
```javascript
// js/calculators.js
export class NewCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }
    
    init() {
        // Setup UI and event listeners
    }
}
```

### Adding Physics Tests
```javascript
// tests/physics.test.js  
test.test('New physics calculation', (t) => {
    const result = calculateSomething(input);
    if (!t.assertEqual(result, expected, 0.01)) {
        throw new Error('Calculation failed');
    }
});
```

### Styling Components
```css
/* css/main.css */
.new-component {
    /* Use CSS custom properties */
    background: var(--primary-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-lg);
}
```

## 📊 Technical Specifications

- **JavaScript**: ES6+ Modules, Modern APIs
- **CSS**: CSS Grid, Flexbox, Custom Properties
- **Browser Support**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Performance**: <2s page load, 60fps animations
- **Accessibility**: WCAG 2.1 AA compliant
- **File Size**: <500KB total (without images)

## 🤝 Contributing

1. Fork the repository
2. Make changes to HTML/CSS/JS files
3. Test in browser with test runner
4. Submit pull request

No build process means changes are immediately visible!

## 📄 License

MIT License - See LICENSE file for details

---

**Built with modern web standards for maximum simplicity and educational impact** 🎓⚡