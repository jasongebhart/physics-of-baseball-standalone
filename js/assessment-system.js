
/**
 * Assessment System for Physics of Baseball Course
 * Interactive quizzes, lab reports, and practice problems
 */

export class AssessmentSystem {
    constructor() {
        this.currentQuiz = null;
        this.quizData = null;
        this.userProgress = this.loadProgress();
    }

    async init() {
        await this.loadQuizData();
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('physics-baseball-progress', JSON.stringify(this.userProgress));
    }

    async loadQuizData() {
        try {
            const response = await fetch('../data/quizzes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.quizData = await response.json();
        } catch (error) {
            console.error("Could not load quiz data:", error);
        }
    }

    createQuiz(weekId, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.quizData || !this.quizData[weekId]) return;

        const quiz = this.quizData[weekId];
        this.currentQuiz = weekId;

        // Render the actual quiz questions
        container.innerHTML = `
            <form id="quiz-form">
                ${this.renderQuestions(quiz.questions)}
            </form>
        `;

        this.setupQuizEventListeners();
    }

    renderQuestions(questions) {
        return questions.map((q, index) => {
            switch (q.type) {
                case 'multiple-choice':
                    return this.renderMultipleChoice(q, index);
                case 'short-answer':
                    return this.renderShortAnswer(q, index);
                case 'calculation':
                    return this.renderCalculation(q, index);
                default:
                    return '';
            }
        }).join('');
    }

    renderMultipleChoice(question, index) {
        return `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="question-type">Multiple Choice</span>
                </div>
                <div class="question-text">${question.question}</div>
                <div class="options-container">
                    ${question.options.map((option, i) => `
                        <label class="option-label">
                            <input type="radio" name="q${question.id}" value="${i}" class="option-input">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderShortAnswer(question, index) {
        return `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="question-type">Short Answer (${question.points} pts)</span>
                </div>
                <div class="question-text">${question.question}</div>
                <textarea name="q${question.id}" class="short-answer-input" 
                         placeholder="Enter your answer here..." rows="4"></textarea>
            </div>
        `;
    }

    renderCalculation(question, index) {
        return `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="question-type">Calculation (${question.points} pts)</span>
                </div>
                <div class="question-text">${question.question}</div>
                <div class="formula-hint">💡 Formula: ${question.formula}</div>
                <div class="calculation-workspace">
                    <textarea name="q${question.id}_work" placeholder="Show your work here..." 
                             class="work-area" rows="3"></textarea>
                    <input type="text" name="q${question.id}" placeholder="Final Answer" 
                           class="answer-input">
                </div>
            </div>
        `;
    }

    setupQuizEventListeners() {
        const form = document.getElementById('quiz-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuiz();
            });

            // Programmatic event listener for reset button
            const resetButton = document.getElementById('reset-quiz-btn');
            if (resetButton) {
                resetButton.addEventListener('click', () => this.resetQuiz());
            }

            // Track progress
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('change', () => this.updateProgress());
            });
        }
    }

    updateProgress() {
        const form = document.getElementById('quiz-form');
        const questions = this.quizData[this.currentQuiz].questions;
        let answered = 0;

        questions.forEach((q, index) => {
            const inputs = form.querySelectorAll(`[name^="q${q.id}"]`);
            const hasAnswer = Array.from(inputs).some(input => input.value.trim() !== '');
            if (hasAnswer) answered++;
        });

        const progressBar = document.getElementById('quiz-progress');
        const progressText = document.querySelector('.progress-text');
        const percentage = (answered / questions.length) * 100;

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${answered} / ${questions.length}`;
    }

    submitQuiz() {
        const form = document.getElementById('quiz-form');
        const formData = new FormData(form);
        const quiz = this.quizData[this.currentQuiz];
        let score = 0;
        let totalPoints = 0;
        const results = [];

        quiz.questions.forEach(q => {
            const answer = formData.get(`q${q.id}`);
            let isCorrect = false;
            let points = 0;

            if (q.type === 'multiple-choice') {
                isCorrect = parseInt(answer) === q.correct;
                points = isCorrect ? 1 : 0;
                totalPoints += 1;
            } else {
                totalPoints += q.points;
                // For short-answer and calculation, give partial credit
                points = answer && answer.trim() ? q.points * 0.8 : 0;
            }

            score += points;
            results.push({
                question: q,
                answer: answer,
                isCorrect: isCorrect,
                points: points
            });
        });

        this.displayResults(score, totalPoints, results);
        this.saveQuizResult(this.currentQuiz, score, totalPoints);
    }

    displayResults(score, totalPoints, results) {
        const resultsContainer = document.getElementById('quiz-results');
        const percentage = Math.round((score / totalPoints) * 100);
        
        let grade = 'F';
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';

        const feedback = this.getGradeFeedback(percentage);

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4>Quiz Results</h4>
                <div class="score-display">
                    <div class="score-circle ${grade.toLowerCase()}">
                        <span class="score-percentage">${percentage}%</span>
                        <span class="score-grade">${grade}</span>
                    </div>
                    <div class="score-details">
                        <p>Score: ${score.toFixed(1)} / ${totalPoints}</p>
                        <p class="feedback">${feedback}</p>
                    </div>
                </div>
            </div>
            <div class="detailed-results">
                <h5>Question Review</h5>
                ${this.renderDetailedResults(results)}
            </div>
        `;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    renderDetailedResults(results) {
        return results.map((result, index) => {
            const q = result.question;
            const statusIcon = result.isCorrect ? '✅' : '❌';
            
            return `
                <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-header">
                        ${statusIcon} Question ${index + 1} (${result.points}/${q.points || 1} pts)
                    </div>
                    <div class="result-question">${q.question}</div>
                    ${q.type === 'multiple-choice' ? `
                        <div class="result-answer">
                            Your answer: ${q.options[parseInt(result.answer)] || 'Not answered'}
                        </div>
                        <div class="result-correct">
                            Correct answer: ${q.options[q.correct]}
                        </div>
                        <div class="result-explanation">${q.explanation}</div>
                    ` : `
                        <div class="result-answer">Your answer: ${result.answer || 'Not answered'}</div>
                        ${q.sampleAnswer ? `<div class="sample-answer">Sample answer: ${q.sampleAnswer}</div>` : ''}
                        ${q.solution ? `<div class="solution">${this.renderSolution(q.solution)}</div>` : ''}
                    `}
                </div>
            `;
        }).join('');
    }

    renderSolution(solution) {
        if (typeof solution === 'string') return solution;
        
        return Object.entries(solution).map(([key, value]) => 
            `<div class="solution-step"><strong>${key}:</strong> ${value}</div>`
        ).join('');
    }

    getGradeFeedback(percentage) {
        if (percentage >= 90) return "Excellent work! You have a strong understanding of the physics concepts.";
        if (percentage >= 80) return "Good job! You understand most concepts well.";
        if (percentage >= 70) return "You're on the right track. Review the explanations for improvement.";
        if (percentage >= 60) return "You have some understanding but need more practice.";
        return "Please review the material and try again. Don't hesitate to ask for help!";
    }

    saveQuizResult(weekId, score, totalPoints) {
        if (!this.userProgress[weekId]) {
            this.userProgress[weekId] = {};
        }
        
        this.userProgress[weekId].quiz = {
            score: score,
            totalPoints: totalPoints,
            percentage: Math.round((score / totalPoints) * 100),
            completed: new Date().toISOString()
        };
        
        this.saveProgress();
    }

    resetQuiz() {
        const form = document.getElementById('quiz-form');
        const resultsContainer = document.getElementById('quiz-results');
        
        if (form) form.reset();
        if (resultsContainer) resultsContainer.style.display = 'none';
        
        this.updateProgress();
        
        // Scroll back to top of quiz
        document.querySelector('.quiz-header').scrollIntoView({ behavior: 'smooth' });
    }

    // Lab Report Template Generator
    createLabReport(weekId, experimentTitle, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="lab-report-container">
                <div class="lab-header">
                    <h3>🔬 Lab Report: ${experimentTitle}</h3>
                    <div class="lab-info">
                        <span>Week ${weekId.replace('week', '')}</span>
                        <span>Physics of Baseball</span>
                    </div>
                </div>
                
                <form class="lab-report-form" id="lab-report-${weekId}">
                    <div class="lab-section">
                        <h4>1. Objective</h4>
                        <textarea name="objective" placeholder="State the purpose of this experiment..." rows="3"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>2. Hypothesis</h4>
                        <textarea name="hypothesis" placeholder="What do you predict will happen and why?" rows="3"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>3. Materials & Equipment</h4>
                        <textarea name="materials" placeholder="List all materials and equipment used..." rows="4"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>4. Procedure</h4>
                        <textarea name="procedure" placeholder="Describe the steps you followed..." rows="6"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>5. Data Collection</h4>
                        <div class="data-table">
                            <table id="data-table-${weekId}">
                                <thead>
                                    <tr>
                                        <th>Trial</th>
                                        <th>Measurement 1</th>
                                        <th>Measurement 2</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Array(5).fill().map((_, i) => `
                                        <tr>
                                            <td>${i + 1}</td>
                                            <td><input type="text" name="data_${i}_1"></td>
                                            <td><input type="text" name="data_${i}_2"></td>
                                            <td><input type="text" name="data_${i}_notes"></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <button type="button" class="btn btn-small" onclick="assessmentSystem.addDataRow('${weekId}')">Add Row</button>
                    </div>
                    
                    <div class="lab-section">
                        <h4>6. Analysis & Calculations</h4>
                        <textarea name="analysis" placeholder="Show your calculations and data analysis..." rows="6"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>7. Results</h4>
                        <textarea name="results" placeholder="Summarize your findings..." rows="4"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>8. Conclusion</h4>
                        <textarea name="conclusion" placeholder="Was your hypothesis correct? What did you learn?" rows="4"></textarea>
                    </div>
                    
                    <div class="lab-section">
                        <h4>9. Sources of Error</h4>
                        <textarea name="errors" placeholder="What factors might have affected your results?" rows="3"></textarea>
                    </div>
                    
                    <div class="lab-actions">
                        <button type="button" class="btn btn-primary" id="save-lab-report-btn-${weekId}">Save Report</button>
                        <button type="button" class="btn btn-secondary" id="print-lab-report-btn-${weekId}">Print</button>
                        <button type="button" class="btn btn-secondary" id="export-lab-report-btn-${weekId}">Export PDF</button>
                    </div>
                </form>
            </div>
        `;
        this.setupLabReportEventListeners(containerId, weekId);
    }

    setupLabReportEventListeners(containerId, weekId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const saveBtn = container.querySelector(`#save-lab-report-btn-${weekId}`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveLabReport(weekId));
        }

        const printBtn = container.querySelector(`#print-lab-report-btn-${weekId}`);
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printLabReport(weekId));
        }

        const exportBtn = container.querySelector(`#export-lab-report-btn-${weekId}`);
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportLabReport(weekId));
        }

        const addRowBtn = container.querySelector(`button[onclick*="addDataRow('${weekId}')"]`);
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => this.addDataRow(weekId));
        }
    }
}
