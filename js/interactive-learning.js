/**
 * Interactive Learning Elements - Phase 2
 * Expandable sections, tooltips, concept cards, and interactive content
 */

export class InteractiveLearningSystem {
    constructor() {
        this.expandedSections = new Set();
        this.tooltipVisible = null;
        this.conceptCards = new Map();
        this.progressTracker = this.loadProgressTracker();
        this.currentEscapeListener = null;
        this.isInitializing = true;

        // Prevent auto-modal opening for 2 seconds after initialization
        setTimeout(() => {
            this.isInitializing = false;
        }, 2000);

        this.init();
    }

    loadProgressTracker() {
        try {
            return JSON.parse(localStorage.getItem('interactive-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveProgressTracker() {
        localStorage.setItem('interactive-progress', JSON.stringify(this.progressTracker));
    }

    init() {
        // Skip expandable sections for Week 1 since it has good static organization
        const isWeek1 = document.title.includes('Week 1') || 
                       document.querySelector('.week-title')?.textContent.includes('Week 1');
        
        if (!isWeek1) {
            this.initializeExpandableSections();
        }
        
        this.initializeTooltips();
        
        // Skip concept cards for Week 1 since it has manual concept sections
        if (!isWeek1) {
            this.initializeConceptCards();
        }
        
        this.initializeInteractiveElements();
        this.initializeProgressIndicators();
        this.setupKeyboardNavigation();
    }

    initializeExpandableSections() {
        // Convert existing content sections to expandable format (selectively)
        const sections = document.querySelectorAll('.day-content, .activity-item, .learning-objective');
        
        sections.forEach((section, index) => {
            if (!section.classList.contains('expandable-section') && this.shouldMakeExpandable(section)) {
                this.makeExpandable(section, index);
            }
        });
    }

    shouldMakeExpandable(section) {
        // Only make sections expandable if they meet certain criteria
        const content = section.textContent.trim();
        const hasComplexContent = section.querySelector('ul, ol, table, .formula, .calculation, .example');
        const hasMultipleParagraphs = section.querySelectorAll('p').length > 2;
        const hasLongContent = content.length > 500; // More than 500 characters
        const hasSubheadings = section.querySelectorAll('h4, h5, h6').length > 0;
        
        // Don't make simple intro sections or navigation sections expandable
        const isIntroSection = section.classList.contains('intro') || 
                              section.querySelector('h3, h4')?.textContent.toLowerCase().includes('introduction');
        const isNavSection = section.classList.contains('navigation') || 
                            section.querySelector('.nav-links, .week-nav');
        const isAssessmentSection = section.classList.contains('assessment') ||
                                  section.querySelector('.assessment-cta, .quiz-container');
        
        if (isIntroSection || isNavSection || isAssessmentSection) {
            return false;
        }
        
        // Make expandable if it has complex content OR is lengthy
        return hasComplexContent || hasMultipleParagraphs || hasLongContent || hasSubheadings;
    }

    makeExpandable(section, index) {
        const header = section.querySelector('h3, h4, .activity-icon + .activity-content h4');
        if (!header) return;

        const sectionId = `expandable-${index}`;
        const content = section.querySelector('.activity-content, p, ul, .topics-grid');
        
        if (!content) return;

        // Wrap content in expandable container
        const expandableContainer = document.createElement('div');
        expandableContainer.className = 'expandable-container';
        expandableContainer.id = sectionId;

        const expandableHeader = document.createElement('div');
        expandableHeader.className = 'expandable-header';
        expandableHeader.innerHTML = `
            <div class="header-content">
                ${header.outerHTML}
            </div>
            <div class="expand-controls">
                <button class="expand-btn" aria-expanded="false" aria-controls="${sectionId}-content">
                    <span class="expand-icon">▼</span>
                    <span class="sr-only">Expand section</span>
                </button>
                <div class="section-progress">
                    <span class="progress-indicator" id="progress-${sectionId}">○</span>
                </div>
            </div>
        `;

        const expandableContent = document.createElement('div');
        expandableContent.className = 'expandable-content';
        expandableContent.id = `${sectionId}-content`;
        expandableContent.setAttribute('aria-hidden', 'true');
        
        // Move original content
        while (content.firstChild) {
            expandableContent.appendChild(content.firstChild);
        }

        // Add reading time estimate
        const readingTime = this.estimateReadingTime(expandableContent.textContent);
        const readingTimeElement = document.createElement('div');
        readingTimeElement.className = 'reading-time';
        readingTimeElement.innerHTML = `⏱️ Est. reading time: ${readingTime} min`;
        expandableContent.prepend(readingTimeElement);

        // Add completion tracking
        const completionTracker = document.createElement('div');
        completionTracker.className = 'completion-tracker';
        completionTracker.innerHTML = `
            <button class="mark-complete-btn" data-section="${sectionId}">
                ✓ Mark as Complete
            </button>
        `;
        expandableContent.appendChild(completionTracker);

        expandableContainer.appendChild(expandableHeader);
        expandableContainer.appendChild(expandableContent);

        // Replace original content
        section.appendChild(expandableContainer);
        header.remove();
        content.remove();

        // Setup event listeners
        this.setupExpandableListeners(expandableContainer, sectionId);
        
        // Check if previously completed
        if (this.progressTracker[sectionId]?.completed) {
            this.markSectionComplete(sectionId);
        }
    }

    setupExpandableListeners(container, sectionId) {
        const expandBtn = container.querySelector('.expand-btn');
        const content = container.querySelector('.expandable-content');
        const completeBtn = container.querySelector('.mark-complete-btn');

        expandBtn.addEventListener('click', () => {
            this.toggleSection(sectionId);
        });

        completeBtn.addEventListener('click', () => {
            this.markSectionComplete(sectionId);
            this.trackCompletion(sectionId);
        });

        // Track reading progress
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.trackSectionView(sectionId);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(content);
    }

    toggleSection(sectionId) {
        const container = document.getElementById(sectionId);
        const expandBtn = container.querySelector('.expand-btn');
        const content = container.querySelector('.expandable-content');
        const icon = expandBtn.querySelector('.expand-icon');
        
        const isExpanded = expandBtn.getAttribute('aria-expanded') === 'true';
        
        expandBtn.setAttribute('aria-expanded', !isExpanded);
        content.setAttribute('aria-hidden', isExpanded);
        icon.textContent = isExpanded ? '▼' : '▲';
        
        if (isExpanded) {
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            this.expandedSections.delete(sectionId);
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            this.expandedSections.add(sectionId);
            this.trackSectionExpansion(sectionId);
        }

        // Smooth scroll to section if expanding
        if (!isExpanded) {
            setTimeout(() => {
                container.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 300);
        }
    }

    initializeTooltips() {
        // Find physics terms and add tooltips
        const physicsTerms = this.getPhysicsGlossary();
        
        document.body.addEventListener('mouseover', (e) => {
            const text = e.target.textContent;
            if (e.target.tagName === 'SPAN' || e.target.tagName === 'P' || e.target.tagName === 'LI') {
                this.checkForPhysicsTerms(e.target, physicsTerms);
            }
        });

        // Create tooltip container
        this.createTooltipContainer();
    }

    getPhysicsGlossary() {
        return {
            'velocity': 'A vector quantity that describes the rate of change of position with respect to time, including both speed and direction.',
            'acceleration': 'The rate of change of velocity with respect to time. Can be positive (speeding up) or negative (slowing down).',
            'displacement': 'A vector quantity representing the change in position of an object, measured as the straight-line distance from start to end point.',
            'projectile motion': 'The motion of an object thrown or projected into the air, subject to only the acceleration of gravity.',
            'kinetic energy': 'The energy an object possesses due to its motion, calculated as KE = ½mv².',
            'momentum': 'The quantity of motion of a moving body, calculated as the product of mass and velocity (p = mv).',
            'force': 'An interaction that, when unopposed, will change the motion of an object. Measured in Newtons (N).',
            'friction': 'A force that opposes the relative motion or tendency of motion between two surfaces in contact.',
            'trajectory': 'The path followed by a projectile flying through space.',
            'vector': 'A quantity having both magnitude and direction, such as velocity or force.',
            'scalar': 'A quantity having only magnitude, such as speed or mass.',
            'gravity': 'The force of attraction between any two masses. On Earth, approximately 9.8 m/s² downward.'
        };
    }

    checkForPhysicsTerms(element, glossary) {
        if (element.dataset.tooltipProcessed) return;
        
        const text = element.textContent.toLowerCase();
        
        for (const [term, definition] of Object.entries(glossary)) {
            if (text.includes(term.toLowerCase())) {
                this.addTooltipToTerm(element, term, definition);
                break; // Only add one tooltip per element
            }
        }
        
        element.dataset.tooltipProcessed = 'true';
    }

    addTooltipToTerm(element, term, definition) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const originalHTML = element.innerHTML;
        
        if (originalHTML.includes('<span class="physics-term"')) return; // Already processed
        
        const newHTML = originalHTML.replace(regex, (match) => {
            return `<span class="physics-term" data-term="${term}" data-definition="${definition}" tabindex="0">${match}</span>`;
        });
        
        if (newHTML !== originalHTML) {
            element.innerHTML = newHTML;
            this.setupTermTooltips(element);
        }
    }

    setupTermTooltips(container) {
        const terms = container.querySelectorAll('.physics-term');
        
        terms.forEach(term => {
            term.addEventListener('mouseenter', (e) => this.showTooltip(e));
            term.addEventListener('mouseleave', () => this.hideTooltip());
            term.addEventListener('focus', (e) => this.showTooltip(e));
            term.addEventListener('blur', () => this.hideTooltip());
            term.addEventListener('click', (e) => {
                e.preventDefault();
                // Only allow user-initiated clicks (not programmatic ones)
                if (e.isTrusted !== false) {
                    this.showDetailedDefinition(term.dataset.term, term.dataset.definition);
                }
            });
        });
    }

    createTooltipContainer() {
        if (document.getElementById('physics-tooltip')) return;
        
        const tooltip = document.createElement('div');
        tooltip.id = 'physics-tooltip';
        tooltip.className = 'physics-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
    }

    showTooltip(event) {
        const tooltip = document.getElementById('physics-tooltip');
        const term = event.target.dataset.term;
        const definition = event.target.dataset.definition;
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${term}</strong>
                <button class="tooltip-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="tooltip-content">
                ${definition}
            </div>
            <div class="tooltip-footer">
                <small>Click for detailed explanation</small>
            </div>
        `;
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = rect.bottom + 10 + 'px';
        tooltip.style.display = 'block';
        
        this.tooltipVisible = tooltip;
        
        // Track tooltip usage
        this.trackTooltipUsage(term);
    }

    hideTooltip() {
        if (this.tooltipVisible) {
            this.tooltipVisible.style.display = 'none';
            this.tooltipVisible = null;
        }
    }

    showDetailedDefinition(term, definition) {
        // Prevent auto-modal opening during initialization
        if (this.isInitializing) {
            console.log('Blocked modal during initialization:', term);
            return;
        }

        // Remove any existing modals first
        const existingModals = document.querySelectorAll('.definition-modal');
        existingModals.forEach(modal => modal.remove());

        // Clean up any existing escape key listeners
        document.removeEventListener('keydown', this.currentEscapeListener);

        const modal = document.createElement('div');
        modal.className = 'definition-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${term}</h3>
                    <button class="modal-close" type="button">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>Definition:</strong> ${definition}</p>
                    <div class="related-concepts">
                        <h4>Related Concepts:</h4>
                        ${this.getRelatedConcepts(term)}
                    </div>
                    <div class="examples">
                        <h4>Baseball Examples:</h4>
                        ${this.getBaseballExamples(term)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" type="button">Got it!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners with proper cleanup
        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', this.currentEscapeListener);
            this.currentEscapeListener = null;
        };

        // Close button
        modal.querySelector('.modal-close').addEventListener('click', closeModal);

        // Got it button
        modal.querySelector('.btn-primary').addEventListener('click', closeModal);

        // Overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        // Escape key to close
        this.currentEscapeListener = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        document.addEventListener('keydown', this.currentEscapeListener);

        // Focus management
        modal.querySelector('.modal-close').focus();
    }

    getRelatedConcepts(term) {
        const relations = {
            'velocity': ['speed', 'acceleration', 'displacement'],
            'acceleration': ['velocity', 'force', 'momentum'],
            'displacement': ['velocity', 'vector', 'distance'],
            'projectile motion': ['trajectory', 'velocity', 'acceleration', 'gravity'],
            'kinetic energy': ['momentum', 'velocity', 'mass'],
            'momentum': ['velocity', 'kinetic energy', 'force'],
            'force': ['acceleration', 'momentum', 'friction'],
            'friction': ['force', 'kinetic energy'],
            'trajectory': ['projectile motion', 'velocity', 'acceleration'],
            'vector': ['velocity', 'displacement', 'acceleration'],
            'scalar': ['speed', 'distance', 'mass'],
            'gravity': ['projectile motion', 'acceleration', 'force']
        };
        
        const related = relations[term] || [];
        return related.length > 0 
            ? `<ul>${related.map(concept => `<li>${concept}</li>`).join('')}</ul>`
            : '<p>No directly related concepts listed.</p>';
    }

    getBaseballExamples(term) {
        const examples = {
            'velocity': 'A fastball thrown at 95 mph toward home plate has both speed (95 mph) and direction (toward home plate).',
            'acceleration': 'A baseball accelerates from 0 to 95 mph in the 0.1 seconds it takes to leave the pitcher\'s hand.',
            'displacement': 'The displacement of a home run ball is the straight-line distance from home plate to where it lands, not the curved path it follows.',
            'projectile motion': 'Once a baseball leaves the pitcher\'s hand, it follows projectile motion until it\'s caught or hits the ground.',
            'kinetic energy': 'A 95 mph fastball has significantly more kinetic energy than a 75 mph curveball of the same mass.',
            'momentum': 'A heavy baseball moving at high speed has more momentum and is harder to stop than a lighter ball at the same speed.',
            'force': 'The pitcher applies force to the baseball to accelerate it toward home plate.',
            'friction': 'Air resistance (friction) slows down a baseball in flight and causes it to curve.',
            'trajectory': 'The curved path of a home run ball from bat to stands is its trajectory.',
            'vector': 'Wind velocity affecting a fly ball has both magnitude (speed) and direction.',
            'scalar': 'The speed of a pitch (95 mph) is a scalar - it doesn\'t specify direction.',
            'gravity': 'Gravity constantly pulls a baseball downward at 9.8 m/s², causing its curved flight path.'
        };
        
        return examples[term] || 'Example not available for this term.';
    }

    initializeConceptCards() {
        // Create concept cards for key physics principles
        this.createConceptCardsContainer();
        this.addConceptCards();
    }

    createConceptCardsContainer() {
        const container = document.createElement('div');
        container.id = 'concept-cards-container';
        container.className = 'concept-cards-container';
        container.innerHTML = `
            <div class="concept-cards-header">
                <h3>🧠 Key Concepts</h3>
                <button class="toggle-cards-btn" id="toggle-concept-cards">
                    <span class="toggle-text">Show Cards</span>
                    <span class="toggle-icon">📚</span>
                </button>
            </div>
            <div class="concept-cards-grid" id="concept-cards-grid" style="display: none;">
                <!-- Cards will be added here -->
            </div>
        `;
        
        // Insert after the week header
        const weekHeader = document.querySelector('.week-header, .day-header');
        if (weekHeader) {
            weekHeader.after(container);
            this.setupConceptCardsToggle();
        }
    }

    addConceptCards() {
        const grid = document.getElementById('concept-cards-grid');
        if (!grid) return;
        
        // Extract key concepts from the current page
        const concepts = this.extractPageConcepts();
        
        concepts.forEach((concept, index) => {
            const card = this.createConceptCard(concept, index);
            grid.appendChild(card);
        });
    }

    extractPageConcepts() {
        // This would typically be more sophisticated, parsing the actual content
        // For now, return some sample concepts based on the week
        const weekTitle = document.querySelector('.week-title, .day-title')?.textContent || '';
        
        if (weekTitle.includes('Motion')) {
            return [
                {
                    title: 'Distance vs Displacement',
                    description: 'Distance is total path traveled; displacement is straight-line change in position.',
                    formula: 'd = total path, Δx = xf - xi',
                    example: 'Running the bases vs direct line from home to second'
                },
                {
                    title: 'Speed vs Velocity',
                    description: 'Speed is magnitude only; velocity includes direction.',
                    formula: 'speed = distance/time, velocity = displacement/time',
                    example: 'Pitch speed: 95 mph. Pitch velocity: 95 mph toward home plate'
                },
                {
                    title: 'Acceleration',
                    description: 'Rate of change of velocity over time.',
                    formula: 'a = Δv/Δt',
                    example: 'Ball accelerates from 0 to 95 mph in 0.1 seconds'
                }
            ];
        }
        
        return [];
    }

    createConceptCard(concept, index) {
        const card = document.createElement('div');
        card.className = 'concept-card';
        card.dataset.concept = index;
        
        card.innerHTML = `
            <div class="card-front">
                <div class="card-header">
                    <h4>${concept.title}</h4>
                    <button class="flip-card-btn" onclick="this.closest('.concept-card').classList.toggle('flipped')">
                        🔄
                    </button>
                </div>
                <div class="card-content">
                    <p>${concept.description}</p>
                    <div class="card-formula">
                        <code>${concept.formula}</code>
                    </div>
                </div>
                <div class="card-footer">
                    <small>Click to flip for example</small>
                </div>
            </div>
            <div class="card-back">
                <div class="card-header">
                    <h4>Baseball Example</h4>
                    <button class="flip-card-btn" onclick="this.closest('.concept-card').classList.toggle('flipped')">
                        🔄
                    </button>
                </div>
                <div class="card-content">
                    <p>${concept.example}</p>
                </div>
                <div class="card-footer">
                    <button class="mastery-btn" onclick="this.closest('.concept-card').classList.add('mastered')">
                        ✓ I understand this
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    setupConceptCardsToggle() {
        const toggleBtn = document.getElementById('toggle-concept-cards');
        const grid = document.getElementById('concept-cards-grid');
        
        if (toggleBtn && grid) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = grid.style.display !== 'none';
                grid.style.display = isVisible ? 'none' : 'grid';
                toggleBtn.querySelector('.toggle-text').textContent = isVisible ? 'Show Cards' : 'Hide Cards';
                toggleBtn.querySelector('.toggle-icon').textContent = isVisible ? '📚' : '📖';
            });
        }
    }

    initializeInteractiveElements() {
        this.addInteractiveCalculators();
        this.addProgressCheckpoints();
        this.addCollaborativeElements();
    }

    addInteractiveCalculators() {
        const calculatorContainers = document.querySelectorAll('.calculator-section, .formula-hint');
        
        calculatorContainers.forEach((container, index) => {
            if (container.classList.contains('interactive-calculator')) return;
            
            const calculator = this.createMiniCalculator(container, index);
            container.appendChild(calculator);
            container.classList.add('interactive-calculator');
        });
    }

    createMiniCalculator(context, index) {
        const calculator = document.createElement('div');
        calculator.className = 'mini-calculator';
        calculator.innerHTML = `
            <div class="calculator-header">
                <h5>🧮 Quick Calculator</h5>
                <button class="calculator-toggle" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Toggle
                </button>
            </div>
            <div class="calculator-body">
                <div class="calculator-inputs">
                    <input type="number" placeholder="Value 1" id="calc-input1-${index}">
                    <select id="calc-operation-${index}">
                        <option value="add">+</option>
                        <option value="subtract">-</option>
                        <option value="multiply">×</option>
                        <option value="divide">÷</option>
                        <option value="power">^</option>
                    </select>
                    <input type="number" placeholder="Value 2" id="calc-input2-${index}">
                    <button onclick="this.closest('.mini-calculator').calculate()">Calculate</button>
                </div>
                <div class="calculator-result" id="calc-result-${index}">
                    Result will appear here
                </div>
            </div>
        `;
        
        // Add calculation method
        calculator.calculate = function() {
            const val1 = parseFloat(this.querySelector(`#calc-input1-${index}`).value);
            const val2 = parseFloat(this.querySelector(`#calc-input2-${index}`).value);
            const operation = this.querySelector(`#calc-operation-${index}`).value;
            const resultDiv = this.querySelector(`#calc-result-${index}`);
            
            if (isNaN(val1) || isNaN(val2)) {
                resultDiv.textContent = 'Please enter valid numbers';
                return;
            }
            
            let result;
            switch (operation) {
                case 'add': result = val1 + val2; break;
                case 'subtract': result = val1 - val2; break;
                case 'multiply': result = val1 * val2; break;
                case 'divide': result = val2 !== 0 ? val1 / val2 : 'Cannot divide by zero'; break;
                case 'power': result = Math.pow(val1, val2); break;
                default: result = 'Unknown operation';
            }
            
            resultDiv.textContent = typeof result === 'number' ? result.toFixed(3) : result;
        };
        
        return calculator;
    }

    addProgressCheckpoints() {
        const majorSections = document.querySelectorAll('.day-section, .activity-item');
        
        majorSections.forEach((section, index) => {
            if (section.querySelector('.progress-checkpoint')) return;
            
            const checkpoint = document.createElement('div');
            checkpoint.className = 'progress-checkpoint';
            checkpoint.innerHTML = `
                <div class="checkpoint-indicator" data-checkpoint="${index}">
                    <div class="checkpoint-icon">○</div>
                    <div class="checkpoint-label">Section ${index + 1}</div>
                </div>
            `;
            
            section.appendChild(checkpoint);
            
            // Setup intersection observer for automatic progress tracking
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.markCheckpointReached(index);
                    }
                });
            }, { threshold: 0.7 });
            
            observer.observe(section);
        });
    }

    markCheckpointReached(index) {
        const checkpoint = document.querySelector(`[data-checkpoint="${index}"]`);
        if (checkpoint && !checkpoint.classList.contains('reached')) {
            checkpoint.classList.add('reached');
            checkpoint.querySelector('.checkpoint-icon').textContent = '✓';
            
            // Save progress
            if (!this.progressTracker.checkpoints) {
                this.progressTracker.checkpoints = [];
            }
            if (!this.progressTracker.checkpoints.includes(index)) {
                this.progressTracker.checkpoints.push(index);
                this.saveProgressTracker();
            }
        }
    }

    initializeProgressIndicators() {
        // Skip progress indicators for Week 1 to avoid visual clutter
        const isWeek1 = document.title.includes('Week 1') || 
                       document.querySelector('.week-title')?.textContent.includes('Week 1');
        
        if (isWeek1) {
            console.log('Progress indicators disabled for Week 1 to maintain clean design');
            return;
        }
        
        this.createOverallProgressBar();
        this.updateProgressIndicators();
    }

    createOverallProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'overall-progress-bar';
        progressBar.className = 'overall-progress-bar';
        progressBar.innerHTML = `
            <div class="progress-header">
                <span class="progress-label">Page Progress</span>
                <span class="progress-percentage" id="overall-percentage">0%</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" id="overall-progress-fill"></div>
            </div>
            <div class="progress-milestones">
                <div class="milestone" data-milestone="25">25%</div>
                <div class="milestone" data-milestone="50">50%</div>
                <div class="milestone" data-milestone="75">75%</div>
                <div class="milestone" data-milestone="100">100%</div>
            </div>
        `;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content, main');
        if (mainContent) {
            mainContent.insertBefore(progressBar, mainContent.firstChild);
        }
    }

    updateProgressIndicators() {
        const totalSections = document.querySelectorAll('.expandable-section').length;
        const completedSections = Object.keys(this.progressTracker).filter(key => 
            this.progressTracker[key]?.completed
        ).length;
        
        const percentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
        
        const percentageDisplay = document.getElementById('overall-percentage');
        const progressFill = document.getElementById('overall-progress-fill');
        
        if (percentageDisplay) percentageDisplay.textContent = `${percentage}%`;
        if (progressFill) progressFill.style.width = `${percentage}%`;
        
        // Update milestones
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(milestone => {
            const milestoneValue = parseInt(milestone.dataset.milestone);
            if (percentage >= milestoneValue) {
                milestone.classList.add('reached');
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + E to expand/collapse all sections
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                this.toggleAllSections();
            }
            
            // Alt + N for next section
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.navigateToNextSection();
            }
            
            // Alt + P for previous section
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                this.navigateToPreviousSection();
            }
            
            // Escape to close any open modals/tooltips
            if (e.key === 'Escape') {
                this.hideTooltip();
                const modals = document.querySelectorAll('.definition-modal');
                modals.forEach(modal => modal.remove());
            }
        });
    }

    toggleAllSections() {
        const expandBtns = document.querySelectorAll('.expand-btn');
        const hasExpanded = this.expandedSections.size > 0;
        
        expandBtns.forEach(btn => {
            const sectionId = btn.getAttribute('aria-controls').replace('-content', '');
            if (hasExpanded) {
                if (this.expandedSections.has(sectionId)) {
                    this.toggleSection(sectionId);
                }
            } else {
                if (!this.expandedSections.has(sectionId)) {
                    this.toggleSection(sectionId);
                }
            }
        });
    }

    navigateToNextSection() {
        const sections = document.querySelectorAll('.expandable-section');
        const currentScroll = window.scrollY;
        
        for (let section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top > 100) { // 100px threshold
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            }
        }
    }

    navigateToPreviousSection() {
        const sections = Array.from(document.querySelectorAll('.expandable-section')).reverse();
        const currentScroll = window.scrollY;
        
        for (let section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top < -100) { // 100px threshold
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            }
        }
    }

    // Tracking methods
    trackSectionView(sectionId) {
        if (!this.progressTracker[sectionId]) {
            this.progressTracker[sectionId] = {};
        }
        this.progressTracker[sectionId].viewed = new Date().toISOString();
        this.saveProgressTracker();
    }

    trackSectionExpansion(sectionId) {
        if (!this.progressTracker[sectionId]) {
            this.progressTracker[sectionId] = {};
        }
        this.progressTracker[sectionId].expanded = new Date().toISOString();
        this.saveProgressTracker();
    }

    trackCompletion(sectionId) {
        if (!this.progressTracker[sectionId]) {
            this.progressTracker[sectionId] = {};
        }
        this.progressTracker[sectionId].completed = new Date().toISOString();
        this.saveProgressTracker();
        this.updateProgressIndicators();
    }

    trackTooltipUsage(term) {
        if (!this.progressTracker.tooltips) {
            this.progressTracker.tooltips = {};
        }
        if (!this.progressTracker.tooltips[term]) {
            this.progressTracker.tooltips[term] = 0;
        }
        this.progressTracker.tooltips[term]++;
        this.saveProgressTracker();
    }

    markSectionComplete(sectionId) {
        // Skip section completion for Week 1 to maintain clean design
        const isWeek1 = document.title.includes('Week 1') || 
                       document.querySelector('.week-title')?.textContent.includes('Week 1');
        
        if (isWeek1) {
            return;
        }
        
        const progressIndicator = document.getElementById(`progress-${sectionId}`);
        const completeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (progressIndicator) {
            progressIndicator.textContent = '✓';
            progressIndicator.classList.add('completed');
        }
        
        if (completeBtn) {
            completeBtn.textContent = '✓ Completed';
            completeBtn.disabled = true;
            completeBtn.classList.add('completed');
        }
    }

    estimateReadingTime(text) {
        const wordsPerMinute = 200; // Average reading speed
        const words = text.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / wordsPerMinute));
    }

    addCollaborativeElements() {
        // Placeholder method for collaborative features
        // This would include features like:
        // - Study group formation
        // - Peer review capabilities
        // - Shared notes and annotations
        // - Discussion threads
        console.log('Collaborative elements placeholder - not yet implemented');
    }
}

// Note: InteractiveLearningSystem is initialized manually in each week's HTML file
// to allow for week-specific configurations and avoid duplicate instances

export default InteractiveLearningSystem;