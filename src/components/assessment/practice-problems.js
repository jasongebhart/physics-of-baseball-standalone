/**
 * Practice Problems System
 * Interactive practice problems with step-by-step solutions
 */

export class PracticeProblems {
    constructor() {
        this.problems = null; // Will be loaded asynchronously
        this.userProgress = this.loadProgress();
    }

    async init() {
        await this.loadProblems();
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-practice-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('physics-baseball-practice-progress', JSON.stringify(this.userProgress));
    }

    async loadProblems() {
        try {
            const response = await fetch('/data/practice-problems.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.problems = await response.json();
        } catch (error) {
            console.error("Could not load practice problems data:", error);
        }
    }

    createPracticeSet(weekId, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.problems || !this.problems[weekId]) return;

        const practiceSet = this.problems[weekId];
        
        container.innerHTML = `
            <div class=\"practice-container\">
                <div class=\"practice-header\">
                    <h3>🎯 ${practiceSet.title}</h3>
                    <div class=\"problem-count\">${practiceSet.problems.length} Problems</div>
                </div>
                <div class=\"practice-intro\">
                    <p>Work through these practice problems to reinforce your understanding of the physics concepts. Each problem includes step-by-step solutions.</p>
                    <div class=\"difficulty-legend\">
                        <span class=\"difficulty-badge easy\">Easy</span>
                        <span class=\"difficulty-badge medium\">Medium</span>
                        <span class=\"difficulty-badge hard\">Hard</span>
                    </div>
                </div>
                <div class=\"problems-container\">
                    ${this.renderProblems(practiceSet.problems, weekId)}
                </div>
            </div>
        `;
        this.setupEventListeners(containerId);
    }

    renderProblems(problems, weekId) {
        return problems.map((problem, index) => {
            const solutionId = `solution-${weekId}-${problem.id}`;
            return `
                <div class=\"problem-container\" data-problem-id=\"${problem.id}\">
                    <div class=\"problem-header\">
                        <span class=\"problem-number\">Problem ${problem.id}</span>
                        <span class=\"difficulty-badge ${problem.difficulty}\">${problem.difficulty}</span>
                    </div>
                    
                    <div class=\"problem-statement\">${problem.statement}</div>
                    
                    <div class=\"problem-given\">
                        <h5>📋 Given:</h5>
                        <ul>
                            ${problem.given.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class=\"problem-find\">
                        <h5>🎯 Find:</h5>
                        <p>${problem.find}</p>
                    </div>
                    
                    <div class=\"solution-toggle\">
                        <button class=\"btn btn-secondary show-solution-btn\" data-solution-id=\"${solutionId}\">
                            Show Solution 👁️
                        </button>
                    </div>
                    
                    <div id=\"${solutionId}\" class=\"solution-content\">
                        ${this.renderSolution(problem.solution)}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSolution(solution) {
        return `
            <div class=\"solution-header\">
                <h5>💡 Solution Approach</h5>
                <p>${solution.approach}</p>
            </div>
            
            <div class=\"solution-steps\">
                <h5>📝 Step-by-Step Solution</h5>
                ${solution.steps.map(step => `
                    <div class=\"solution-step\">
                        <div class=\"step-title\">${step.step}</div>
                        <div class=\"step-content\">${step.content.replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class=\"solution-answer\">
                <h5>✅ Final Answer</h5>
                <div class=\"final-answer\">${solution.answer}</div>
            </div>
            
            <div class=\"solution-explanation\">
                <h5>🔍 Explanation</h5>
                <p>${solution.explanation}</p>
            </div>
        `;
    }

    setupEventListeners(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Event listeners for show/hide solution buttons
        container.querySelectorAll('.show-solution-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const solutionId = event.target.dataset.solutionId;
                this.toggleSolution(solutionId);
            });
        });

        // Event listener for new random set button (if quick practice)
        const newRandomSetButton = container.querySelector('.new-random-set-btn');
        if (newRandomSetButton) {
            newRandomSetButton.addEventListener('click', () => {
                this.createQuickPractice(containerId);
            });
        }
    }

    toggleSolution(solutionId) {
        const solutionElement = document.getElementById(solutionId);
        const button = document.querySelector(`button[data-solution-id="${solutionId}"]`);
        
        if (solutionElement.classList.contains('show')) {
            solutionElement.classList.remove('show');
            button.textContent = 'Show Solution 👁️';
        } else {
            solutionElement.classList.add('show');
            button.textContent = 'Hide Solution 🙈';
            this.trackSolutionViewed(solutionId);
        }
    }

    trackSolutionViewed(solutionId) {
        const [, weekId, problemId] = solutionId.split('-');
        const key = `${weekId}-${problemId}`;
        
        if (!this.userProgress.solutionsViewed) {
            this.userProgress.solutionsViewed = [];
        }
        
        if (!this.userProgress.solutionsViewed.includes(key)) {
            this.userProgress.solutionsViewed.push(key);
            this.saveProgress();
        }
    }

    // Additional utility methods
    getProblemsByDifficulty(weekId, difficulty) {
        if (!this.problems[weekId]) return [];
        return this.problems[weekId].problems.filter(p => p.difficulty === difficulty);
    }

    getRandomProblem(weekId) {
        if (!this.problems[weekId]) return null;
        const problems = this.problems[weekId].problems;
        return problems[Math.floor(Math.random() * problems.length)];
    }

    getUserProgress(weekId) {
        return this.userProgress[weekId] || {
            solutionsViewed: [],
            problemsCompleted: []
        };
    }

    // Create a quick practice mode
    createQuickPractice(containerId, weekIds = ['week1', 'week2', 'week3']) {
        const container = document.getElementById(containerId);
        if (!container || !this.problems) return;

        const allProblems = [];
        weekIds.forEach(weekId => {
            if (this.problems[weekId]) {
                allProblems.push(...this.problems[weekId].problems.map(p => ({
                    ...p,
                    week: weekId
                })));
            }
        });

        // Shuffle problems
        const shuffledProblems = allProblems.sort(() => Math.random() - 0.5);
        const selectedProblems = shuffledProblems.slice(0, 5); // Take 5 random problems

        container.innerHTML = `
            <div class=\"practice-container\">
                <div class=\"practice-header\">
                    <h3>⚡ Quick Practice</h3>
                    <div class=\"problem-count\">${selectedProblems.length} Random Problems</div>
                </div>
                <div class=\"practice-intro\">
                    <p>Work through these practice problems to reinforce your understanding of the physics concepts. Each problem includes step-by-step solutions.</p>
                </div>
                <div class=\"problems-container\">
                    ${selectedProblems.map((problem, index) => {
                        const solutionId = `quick-solution-${index}`;
                        return `
                            <div class=\"problem-container\" data-problem-id=\"${problem.id}\">
                                <div class=\"problem-header\">
                                    <span class=\"problem-number\">Problem ${index + 1} (Week ${problem.week.replace('week', '')})</span>
                                    <span class=\"difficulty-badge ${problem.difficulty}\">${problem.difficulty}</span>
                                </div>
                                
                                <div class=\"problem-statement\">${problem.statement}</div>
                                
                                <div class=\"problem-given\">
                                    <h5>📋 Given:</h5>
                                    <ul>
                                        ${problem.given.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div class=\"problem-find\">
                                    <h5>🎯 Find:</h5>
                                    <p>${problem.find}</p>
                                </div>
                                
                                <div class=\"solution-toggle\">
                                    <button class=\"btn btn-secondary show-solution-btn\" data-solution-id=\"${solutionId}\">
                                        Show Solution 👁️
                                    </button>
                                </div>
                                
                                <div id=\"${solutionId}\" class=\"solution-content\">
                                    ${this.renderSolution(problem.solution)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class=\"practice-actions\">
                    <button class=\"btn btn-primary new-random-set-btn\">
                        🎲 New Random Set
                    </button>
                </div>
            </div>
        `;
        this.setupEventListeners(containerId);
    }
}