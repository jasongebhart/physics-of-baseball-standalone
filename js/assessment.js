/**
 * Assessment System
 * Simple quizzes and practice problems for physics education
 */

export class QuizSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentQuiz = null;
        this.userAnswers = {};
        this.progress = this.loadProgress();
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveProgress() {
        localStorage.setItem('physics-baseball-progress', JSON.stringify(this.progress));
    }

    async loadQuiz(weekId) {
        try {
            const response = await fetch(`/data/quizzes.json`);
            const data = await response.json();
            return data[weekId];
        } catch (error) {
            console.error('Could not load quiz data:', error);
            return null;
        }
    }

    async createQuiz(weekId) {
        const quiz = await this.loadQuiz(weekId);
        if (!quiz) return;

        this.currentQuiz = quiz;
        this.userAnswers = {};

        this.container.innerHTML = `
            <div class="quiz-container">
                <h3>${quiz.title}</h3>
                <div class="quiz-progress">
                    <div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>
                    <span class="progress-text">0 / ${quiz.questions.length}</span>
                </div>
                <form id="quiz-form">
                    ${this.renderQuestions(quiz.questions)}
                    <button type="submit" class="submit-btn">Submit Quiz</button>
                </form>
                <div id="quiz-results" class="quiz-results" style="display: none;"></div>
            </div>
        `;

        this.setupEventListeners();
    }

    renderQuestions(questions) {
        return questions.map((q, index) => {
            switch (q.type) {
                case 'multiple-choice':
                    return `
                        <div class="question" data-question="${index}">
                            <h4>Question ${index + 1}</h4>
                            <p>${q.question}</p>
                            <div class="options">
                                ${q.options.map((option, i) => `
                                    <label>
                                        <input type="radio" name="q${index}" value="${i}">
                                        ${option}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                case 'short-answer':
                    return `
                        <div class="question" data-question="${index}">
                            <h4>Question ${index + 1} (${q.points} points)</h4>
                            <p>${q.question}</p>
                            <textarea name="q${index}" rows="3" placeholder="Enter your answer..."></textarea>
                        </div>
                    `;
                case 'calculation':
                    return `
                        <div class="question" data-question="${index}">
                            <h4>Question ${index + 1} (${q.points} points)</h4>
                            <p>${q.question}</p>
                            <div class="formula-hint">💡 ${q.formula}</div>
                            <textarea name="q${index}_work" rows="2" placeholder="Show your work..."></textarea>
                            <input type="text" name="q${index}" placeholder="Final answer">
                        </div>
                    `;
                default:
                    return '';
            }
        }).join('');
    }

    setupEventListeners() {
        const form = this.container.querySelector('#quiz-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuiz();
        });

        // Track progress
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateProgress());
        });
    }

    updateProgress() {
        const questions = this.currentQuiz.questions;
        const answered = questions.filter((_, i) => {
            const inputs = this.container.querySelectorAll(`[name^="q${i}"]:not([name*="_work"])`);
            return Array.from(inputs).some(input => input.value.trim());
        }).length;

        const percentage = (answered / questions.length) * 100;
        const progressFill = this.container.querySelector('.progress-fill');
        const progressText = this.container.querySelector('.progress-text');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${answered} / ${questions.length}`;
    }

    submitQuiz() {
        const form = this.container.querySelector('#quiz-form');
        const formData = new FormData(form);
        let score = 0;
        let totalPoints = 0;
        const results = [];

        this.currentQuiz.questions.forEach((q, index) => {
            const answer = formData.get(`q${index}`);
            let isCorrect = false;
            let points = 0;

            if (q.type === 'multiple-choice') {
                isCorrect = parseInt(answer) === q.correct;
                points = isCorrect ? 1 : 0;
                totalPoints += 1;
            } else {
                totalPoints += q.points;
                // Simple grading for text answers
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
        this.saveQuizResult(score, totalPoints);
    }

    displayResults(score, totalPoints, results) {
        const percentage = Math.round((score / totalPoints) * 100);
        let grade = 'F';
        if (percentage >= 90) grade = 'A';
        else if (percentage >= 80) grade = 'B';
        else if (percentage >= 70) grade = 'C';
        else if (percentage >= 60) grade = 'D';

        const resultsContainer = this.container.querySelector('#quiz-results');
        resultsContainer.innerHTML = `
            <h4>Quiz Results</h4>
            <div class="score-display">
                <div class="score-circle grade-${grade.toLowerCase()}">
                    <span class="percentage">${percentage}%</span>
                    <span class="grade">${grade}</span>
                </div>
                <div class="score-details">
                    <p>Score: ${score.toFixed(1)} / ${totalPoints}</p>
                    <p>${this.getGradeFeedback(percentage)}</p>
                </div>
            </div>
            <div class="detailed-results">
                ${results.map((result, index) => `
                    <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                        <strong>Question ${index + 1}: ${result.isCorrect ? '✅' : '❌'}</strong>
                        <p>${result.question.question}</p>
                        ${result.question.type === 'multiple-choice' ? `
                            <p>Your answer: ${result.question.options[parseInt(result.answer)] || 'Not answered'}</p>
                            <p>Correct answer: ${result.question.options[result.question.correct]}</p>
                            ${result.question.explanation ? `<p class="explanation">${result.question.explanation}</p>` : ''}
                        ` : `
                            <p>Your answer: ${result.answer || 'Not answered'}</p>
                        `}
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    getGradeFeedback(percentage) {
        if (percentage >= 90) return "Excellent! You have a strong understanding of the physics concepts.";
        if (percentage >= 80) return "Good job! You understand most concepts well.";
        if (percentage >= 70) return "You're on the right track. Review the explanations for improvement.";
        if (percentage >= 60) return "You have some understanding but need more practice.";
        return "Please review the material and try again.";
    }

    saveQuizResult(score, totalPoints) {
        const weekId = 'current'; // You'd pass this in
        if (!this.progress[weekId]) this.progress[weekId] = {};
        
        this.progress[weekId].quiz = {
            score: score,
            totalPoints: totalPoints,
            percentage: Math.round((score / totalPoints) * 100),
            completed: new Date().toISOString()
        };
        
        this.saveProgress();
    }
}

/**
 * Practice Problems System
 */
export class PracticeProblems {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.problems = null;
    }

    async loadProblems(weekId) {
        try {
            const response = await fetch(`/data/practice-problems.json`);
            const data = await response.json();
            this.problems = data[weekId];
            return this.problems;
        } catch (error) {
            console.error('Could not load practice problems:', error);
            return null;
        }
    }

    async createPracticeSet(weekId) {
        const problems = await this.loadProblems(weekId);
        if (!problems) return;

        this.container.innerHTML = `
            <div class="practice-container">
                <h3>${problems.title}</h3>
                <p>${problems.description || 'Work through these practice problems to reinforce your understanding.'}</p>
                <div class="problems">
                    ${problems.problems.map((problem, index) => this.renderProblem(problem, index)).join('')}
                </div>
            </div>
        `;

        this.setupPracticeListeners();
    }

    renderProblem(problem, index) {
        return `
            <div class="problem" data-problem="${index}">
                <div class="problem-header">
                    <h4>Problem ${problem.id} <span class="difficulty ${problem.difficulty}">${problem.difficulty}</span></h4>
                </div>
                <div class="problem-statement">${problem.statement}</div>
                <div class="problem-given">
                    <h5>Given:</h5>
                    <ul>${problem.given.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
                <div class="problem-find">
                    <h5>Find:</h5>
                    <p>${problem.find}</p>
                </div>
                <button class="show-solution-btn" data-problem="${index}">Show Solution 👁️</button>
                <div class="solution" id="solution-${index}" style="display: none;">
                    <h5>Solution:</h5>
                    <p><strong>Approach:</strong> ${problem.solution.approach}</p>
                    <div class="solution-steps">
                        ${problem.solution.steps.map((step, i) => `
                            <div class="step">
                                <strong>Step ${i + 1}:</strong> ${step.step}
                                <div class="step-content">${step.content}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="final-answer">
                        <strong>Answer:</strong> ${problem.solution.answer}
                    </div>
                    <p class="explanation">${problem.solution.explanation}</p>
                </div>
            </div>
        `;
    }

    setupPracticeListeners() {
        this.container.querySelectorAll('.show-solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const problemIndex = e.target.dataset.problem;
                const solution = this.container.querySelector(`#solution-${problemIndex}`);
                
                if (solution.style.display === 'none') {
                    solution.style.display = 'block';
                    btn.textContent = 'Hide Solution 🙈';
                } else {
                    solution.style.display = 'none';
                    btn.textContent = 'Show Solution 👁️';
                }
            });
        });
    }
}