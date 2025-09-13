/**
 * Enhanced Assessment System - Phase 2
 * Advanced quizzes with detailed feedback, progress tracking, and personalization
 */

export class EnhancedQuizSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentQuiz = null;
        this.userAnswers = {};
        this.progress = this.loadProgress();
        this.attempts = this.loadAttempts();
        this.currentAttempt = 1;
        this.hintLevel = 0;
        this.startTime = null;
        this.questionTimes = {};
        this.personalityProfile = this.loadPersonalityProfile();
    }

    loadProgress() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-progress') || '{}');
        } catch (e) {
            return {};
        }
    }

    loadAttempts() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-attempts') || '{}');
        } catch (e) {
            return {};
        }
    }

    loadPersonalityProfile() {
        try {
            return JSON.parse(localStorage.getItem('physics-baseball-personality') || '{}');
        } catch (e) {
            return {
                learningStyle: 'mixed', // visual, auditory, kinesthetic, mixed
                difficultyPreference: 'adaptive', // easy, medium, hard, adaptive
                feedbackPreference: 'detailed', // minimal, standard, detailed
                conceptualStrength: [], // areas where user excels
                needsReinforcement: [] // areas needing more work
            };
        }
    }

    saveProgress() {
        localStorage.setItem('physics-baseball-progress', JSON.stringify(this.progress));
    }

    saveAttempts() {
        localStorage.setItem('physics-baseball-attempts', JSON.stringify(this.attempts));
    }

    savePersonalityProfile() {
        localStorage.setItem('physics-baseball-personality', JSON.stringify(this.personalityProfile));
    }

    async loadQuiz(weekId) {
        try {
            const response = await fetch(`../data/quizzes.json`);
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
        this.startTime = Date.now();
        this.questionTimes = {};
        
        // Track attempts for this quiz
        if (!this.attempts[weekId]) {
            this.attempts[weekId] = [];
        }
        this.currentAttempt = this.attempts[weekId].length + 1;

        this.container.innerHTML = `
            <div class="enhanced-quiz-container">
                ${this.renderQuizHeader(quiz)}
                ${this.renderProgressIndicator()}
                ${this.renderPersonalizationPanel()}
                <form id="quiz-form">
                    ${this.renderQuestions(quiz.questions)}
                    <div class="quiz-navigation">
                        <button type="button" class="quiz-btn quiz-btn-secondary" id="save-progress-btn">
                            💾 Save Progress
                        </button>
                        <button type="button" class="quiz-btn quiz-btn-hint" id="get-hint-btn" style="display: none;">
                            💡 Get Hint
                        </button>
                        <button type="submit" class="quiz-btn quiz-btn-primary">
                            🚀 Submit Quiz
                        </button>
                    </div>
                </form>
                <div id="quiz-results" class="enhanced-quiz-results" style="display: none;"></div>
                <div id="learning-recommendations" class="learning-recommendations" style="display: none;"></div>
            </div>
        `;

        this.setupEnhancedEventListeners();
        this.loadSavedProgress(weekId);
    }

    renderQuizHeader(quiz) {
        const previousAttempts = this.attempts[quiz.weekId] || [];
        const bestScore = previousAttempts.length > 0 ? 
            Math.max(...previousAttempts.map(a => a.percentage)) : 0;

        return `
            <div class="enhanced-quiz-header">
                <div class="quiz-title-section">
                    <h3>${quiz.title}</h3>
                    <p class="quiz-description">${quiz.description || 'Test your understanding with this interactive quiz'}</p>
                </div>
                <div class="quiz-attempt-info">
                    <div class="attempt-counter">
                        <span class="attempt-label">Attempt</span>
                        <span class="attempt-number">${this.currentAttempt}</span>
                    </div>
                    ${previousAttempts.length > 0 ? `
                        <div class="best-score">
                            <span class="score-label">Best Score</span>
                            <span class="score-value">${bestScore}%</span>
                        </div>
                    ` : ''}
                    <div class="quiz-timer">
                        <span class="timer-label">Time</span>
                        <span class="timer-value" id="quiz-timer">00:00</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderProgressIndicator() {
        return `
            <div class="enhanced-progress-container">
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" id="quiz-progress"></div>
                    </div>
                    <div class="progress-indicators">
                        ${this.currentQuiz.questions.map((_, index) => 
                            `<div class="progress-dot" data-question="${index}"></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="progress-stats">
                    <span class="progress-text">0 / ${this.currentQuiz.questions.length}</span>
                    <span class="progress-percentage">0%</span>
                </div>
            </div>
        `;
    }

    renderPersonalizationPanel() {
        return `
            <div class="personalization-panel" id="personalization-panel">
                <button class="panel-toggle" id="personalization-toggle">
                    ⚙️ Customize Learning
                </button>
                <div class="panel-content" style="display: none;">
                    <div class="setting-group">
                        <label for="feedback-level">Feedback Level:</label>
                        <select id="feedback-level">
                            <option value="minimal">Minimal</option>
                            <option value="standard" selected>Standard</option>
                            <option value="detailed">Detailed</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label for="hint-availability">Hints:</label>
                        <select id="hint-availability">
                            <option value="none">No Hints</option>
                            <option value="after-attempt">After Wrong Answer</option>
                            <option value="always" selected>Always Available</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="show-formulas" checked>
                            Show relevant formulas
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuestions(questions) {
        return questions.map((q, index) => {
            const questionStartTime = Date.now();
            this.questionTimes[index] = { start: questionStartTime, duration: 0 };

            switch (q.type) {
                case 'multiple-choice':
                    return this.renderMultipleChoice(q, index);
                case 'short-answer':
                    return this.renderShortAnswer(q, index);
                case 'calculation':
                    return this.renderCalculation(q, index);
                case 'interactive':
                    return this.renderInteractive(q, index);
                default:
                    return '';
            }
        }).join('');
    }

    renderMultipleChoice(q, index) {
        return `
            <div class="enhanced-question" data-question="${index}" data-type="multiple-choice">
                <div class="question-header">
                    <h4>Question ${index + 1}</h4>
                    <div class="question-meta">
                        <span class="question-type">Multiple Choice</span>
                        <span class="question-points">${q.points || 1} point${q.points !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="question-content">
                    <p class="question-text">${q.question}</p>
                    ${q.context ? `<div class="question-context">${q.context}</div>` : ''}
                    ${q.formula && document.getElementById('show-formulas')?.checked !== false ? 
                        `<div class="formula-hint">📐 ${q.formula}</div>` : ''}
                    <div class="options">
                        ${q.options.map((option, i) => `
                            <label class="option-label">
                                <input type="radio" name="q${index}" value="${i}" data-question="${index}">
                                <span class="option-text">${option}</span>
                                <span class="option-indicator"></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="question-feedback" id="feedback-${index}" style="display: none;"></div>
                <div class="question-hints" id="hints-${index}" style="display: none;"></div>
            </div>
        `;
    }

    renderShortAnswer(q, index) {
        return `
            <div class="enhanced-question" data-question="${index}" data-type="short-answer">
                <div class="question-header">
                    <h4>Question ${index + 1}</h4>
                    <div class="question-meta">
                        <span class="question-type">Short Answer</span>
                        <span class="question-points">${q.points} points</span>
                    </div>
                </div>
                <div class="question-content">
                    <p class="question-text">${q.question}</p>
                    ${q.context ? `<div class="question-context">${q.context}</div>` : ''}
                    <textarea 
                        name="q${index}" 
                        rows="4" 
                        placeholder="Enter your answer here..." 
                        data-question="${index}"
                        class="enhanced-textarea"
                    ></textarea>
                    <div class="character-count">
                        <span id="char-count-${index}">0</span> characters
                    </div>
                </div>
                <div class="question-feedback" id="feedback-${index}" style="display: none;"></div>
                <div class="question-hints" id="hints-${index}" style="display: none;"></div>
            </div>
        `;
    }

    renderCalculation(q, index) {
        return `
            <div class="enhanced-question" data-question="${index}" data-type="calculation">
                <div class="question-header">
                    <h4>Question ${index + 1}</h4>
                    <div class="question-meta">
                        <span class="question-type">Calculation</span>
                        <span class="question-points">${q.points} points</span>
                    </div>
                </div>
                <div class="question-content">
                    <p class="question-text">${q.question}</p>
                    ${q.context ? `<div class="question-context">${q.context}</div>` : ''}
                    <div class="formula-hint">📐 ${q.formula}</div>
                    <div class="calculation-workspace">
                        <label for="q${index}_work">Show your work:</label>
                        <textarea 
                            name="q${index}_work" 
                            rows="3" 
                            placeholder="Step-by-step solution..." 
                            class="work-area"
                        ></textarea>
                        <label for="q${index}">Final answer:</label>
                        <input 
                            type="text" 
                            name="q${index}" 
                            placeholder="Enter numerical answer with units" 
                            data-question="${index}"
                            class="answer-input"
                        >
                    </div>
                </div>
                <div class="question-feedback" id="feedback-${index}" style="display: none;"></div>
                <div class="question-hints" id="hints-${index}" style="display: none;"></div>
            </div>
        `;
    }

    renderInteractive(q, index) {
        return `
            <div class="enhanced-question" data-question="${index}" data-type="interactive">
                <div class="question-header">
                    <h4>Question ${index + 1}</h4>
                    <div class="question-meta">
                        <span class="question-type">Interactive</span>
                        <span class="question-points">${q.points} points</span>
                    </div>
                </div>
                <div class="question-content">
                    <p class="question-text">${q.question}</p>
                    <div class="interactive-element" id="interactive-${index}">
                        ${this.renderInteractiveContent(q)}
                    </div>
                </div>
                <div class="question-feedback" id="feedback-${index}" style="display: none;"></div>
                <div class="question-hints" id="hints-${index}" style="display: none;"></div>
            </div>
        `;
    }

    renderInteractiveContent(question) {
        switch (question.interactiveType) {
            case 'drag-drop':
                return this.renderDragDrop(question);
            case 'slider':
                return this.renderSlider(question);
            case 'diagram-annotation':
                return this.renderDiagramAnnotation(question);
            default:
                return '<p>Interactive element not available</p>';
        }
    }

    setupEnhancedEventListeners() {
        const form = this.container.querySelector('#quiz-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuiz();
        });

        // Enhanced progress tracking
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const questionIndex = parseInt(e.target.dataset.question);
                if (!isNaN(questionIndex)) {
                    this.updateQuestionProgress(questionIndex);
                    this.updateCharacterCount(e.target);
                }
                this.updateProgress();
            });

            // Track time spent on each question
            input.addEventListener('focus', (e) => {
                const questionIndex = parseInt(e.target.dataset.question);
                if (!isNaN(questionIndex) && this.questionTimes[questionIndex]) {
                    this.questionTimes[questionIndex].start = Date.now();
                }
            });

            input.addEventListener('blur', (e) => {
                const questionIndex = parseInt(e.target.dataset.question);
                if (!isNaN(questionIndex) && this.questionTimes[questionIndex]) {
                    this.questionTimes[questionIndex].duration += 
                        Date.now() - this.questionTimes[questionIndex].start;
                }
            });
        });

        // Personalization panel toggle
        const personalizeToggle = this.container.querySelector('#personalization-toggle');
        const personalizePanel = this.container.querySelector('#personalization-panel .panel-content');
        personalizeToggle.addEventListener('click', () => {
            const isHidden = personalizePanel.style.display === 'none';
            personalizePanel.style.display = isHidden ? 'block' : 'none';
            personalizeToggle.textContent = isHidden ? '⚙️ Hide Settings' : '⚙️ Customize Learning';
        });

        // Save progress button
        const saveBtn = this.container.querySelector('#save-progress-btn');
        saveBtn.addEventListener('click', () => this.saveProgressToLocal());

        // Hint button
        const hintBtn = this.container.querySelector('#get-hint-btn');
        hintBtn.addEventListener('click', () => this.showNextHint());

        // Timer
        this.startTimer();

        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveProgressToLocal();
        }, 30000);
    }

    updateCharacterCount(textarea) {
        if (textarea.tagName === 'TEXTAREA') {
            const questionIndex = textarea.dataset.question;
            const counter = this.container.querySelector(`#char-count-${questionIndex}`);
            if (counter) {
                counter.textContent = textarea.value.length;
            }
        }
    }

    updateQuestionProgress(questionIndex) {
        const dot = this.container.querySelector(`[data-question="${questionIndex}"].progress-dot`);
        if (dot) {
            const input = this.container.querySelector(`[name="q${questionIndex}"]:not([name*="_work"])`);
            if (input && input.value.trim()) {
                dot.classList.add('answered');
            } else {
                dot.classList.remove('answered');
            }
        }
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
        const progressPercent = this.container.querySelector('.progress-percentage');

        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${answered} / ${questions.length}`;
        if (progressPercent) progressPercent.textContent = `${Math.round(percentage)}%`;
    }

    startTimer() {
        const timerElement = this.container.querySelector('#quiz-timer');
        if (!timerElement) return;

        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    submitQuiz() {
        // Clear intervals
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);

        const form = this.container.querySelector('#quiz-form');
        const formData = new FormData(form);
        let score = 0;
        let totalPoints = 0;
        const results = [];
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;

        this.currentQuiz.questions.forEach((q, index) => {
            const answer = formData.get(`q${index}`);
            const work = formData.get(`q${index}_work`);
            let isCorrect = false;
            let points = 0;
            let feedback = '';

            if (q.type === 'multiple-choice') {
                isCorrect = parseInt(answer) === q.correct;
                points = isCorrect ? (q.points || 1) : 0;
                totalPoints += q.points || 1;
                feedback = this.generateMultipleChoiceFeedback(q, answer, isCorrect);
            } else {
                totalPoints += q.points;
                // Enhanced grading for text/calculation answers
                const grading = this.gradeTextAnswer(q, answer, work);
                points = grading.points;
                isCorrect = grading.isCorrect;
                feedback = grading.feedback;
            }

            score += points;
            results.push({
                question: q,
                answer: answer,
                work: work,
                isCorrect: isCorrect,
                points: points,
                feedback: feedback,
                timeSpent: this.questionTimes[index]?.duration || 0
            });
        });

        // Record attempt
        const attemptData = {
            score: score,
            totalPoints: totalPoints,
            percentage: Math.round((score / totalPoints) * 100),
            timeSpent: totalTime,
            completed: new Date().toISOString(),
            results: results
        };

        this.attempts[this.currentQuiz.weekId] = this.attempts[this.currentQuiz.weekId] || [];
        this.attempts[this.currentQuiz.weekId].push(attemptData);
        this.saveAttempts();

        // Update personality profile based on performance
        this.updatePersonalityProfile(results);

        this.displayEnhancedResults(score, totalPoints, results, attemptData);
        this.generateLearningRecommendations(results);
    }

    generateMultipleChoiceFeedback(question, userAnswer, isCorrect) {
        let feedback = '';
        
        if (isCorrect) {
            feedback = `✅ Correct! ${question.explanation || 'Great job!'}`;
        } else {
            feedback = `❌ Not quite right. `;
            if (question.explanation) {
                feedback += question.explanation;
            }
            if (question.commonMistakes && question.commonMistakes[userAnswer]) {
                feedback += ` Note: ${question.commonMistakes[userAnswer]}`;
            }
        }

        return feedback;
    }

    gradeTextAnswer(question, answer, work) {
        // This is a simplified grading system
        // In a real implementation, this would be much more sophisticated
        const hasAnswer = answer && answer.trim();
        const hasWork = work && work.trim();
        
        let points = 0;
        let feedback = '';
        let isCorrect = false;

        if (!hasAnswer) {
            feedback = "No answer provided. Please complete this question.";
        } else if (question.type === 'calculation') {
            // Simple keyword and format checking for calculations
            const expectedKeywords = question.keywords || [];
            const answerLower = answer.toLowerCase();
            const keywordMatches = expectedKeywords.filter(kw => 
                answerLower.includes(kw.toLowerCase())
            ).length;
            
            const keywordScore = keywordMatches / Math.max(expectedKeywords.length, 1);
            const workBonus = hasWork ? 0.3 : 0;
            
            points = Math.min(question.points, Math.round(question.points * (keywordScore + workBonus)));
            
            feedback = `Answer evaluated. `;
            if (hasWork) {
                feedback += "Good job showing your work! ";
            }
            if (keywordScore > 0.7) {
                feedback += "Your answer includes key concepts.";
                isCorrect = true;
            } else {
                feedback += "Consider reviewing the key concepts for this problem.";
            }
        } else {
            // Short answer grading
            points = hasAnswer ? Math.round(question.points * 0.8) : 0;
            feedback = hasAnswer ? 
                "Answer submitted for review. Consider expanding your explanation." :
                "Please provide an answer.";
        }

        return { points, feedback, isCorrect };
    }

    displayEnhancedResults(score, totalPoints, results, attemptData) {
        const percentage = Math.round((score / totalPoints) * 100);
        const grade = this.calculateGrade(percentage);
        const previousAttempts = this.attempts[this.currentQuiz.weekId].slice(0, -1);
        const improvement = this.calculateImprovement(previousAttempts, percentage);

        const resultsContainer = this.container.querySelector('#quiz-results');
        resultsContainer.innerHTML = `
            <div class="enhanced-results-header">
                <h4>🎯 Quiz Results</h4>
                <div class="results-overview">
                    <div class="score-display">
                        <div class="score-circle grade-${grade.toLowerCase()}">
                            <span class="percentage">${percentage}%</span>
                            <span class="grade">${grade}</span>
                        </div>
                        <div class="score-details">
                            <p><strong>Score:</strong> ${score.toFixed(1)} / ${totalPoints}</p>
                            <p><strong>Time:</strong> ${this.formatTime(attemptData.timeSpent)}</p>
                            ${improvement.text ? `<p class="improvement">${improvement.text}</p>` : ''}
                        </div>
                    </div>
                    <div class="performance-metrics">
                        <div class="metric">
                            <span class="metric-label">Questions Correct</span>
                            <span class="metric-value">${results.filter(r => r.isCorrect).length} / ${results.length}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Average Time/Question</span>
                            <span class="metric-value">${this.formatTime(attemptData.timeSpent / results.length)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Attempt</span>
                            <span class="metric-value">${this.currentAttempt}</span>
                        </div>
                    </div>
                </div>
                <div class="results-feedback">
                    <p>${this.getEnhancedGradeFeedback(percentage, attemptData)}</p>
                </div>
            </div>

            <div class="detailed-results">
                <h5>📊 Question-by-Question Review</h5>
                ${results.map((result, index) => `
                    <div class="enhanced-result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                        <div class="result-header">
                            <strong>Question ${index + 1}</strong>
                            <div class="result-meta">
                                <span class="result-status">${result.isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
                                <span class="result-points">${result.points}/${result.question.points || 1} pts</span>
                                <span class="result-time">${this.formatTime(result.timeSpent)}</span>
                            </div>
                        </div>
                        <div class="result-content">
                            <p class="question-text">${result.question.question}</p>
                            ${result.question.type === 'multiple-choice' ? `
                                <div class="answer-comparison">
                                    <p><strong>Your answer:</strong> ${result.question.options[parseInt(result.answer)] || 'Not answered'}</p>
                                    <p><strong>Correct answer:</strong> ${result.question.options[result.question.correct]}</p>
                                </div>
                            ` : `
                                <div class="answer-display">
                                    <p><strong>Your answer:</strong> ${result.answer || 'Not answered'}</p>
                                    ${result.work ? `<p><strong>Your work:</strong> ${result.work}</p>` : ''}
                                </div>
                            `}
                            <div class="feedback-section">
                                <p class="feedback-text">${result.feedback}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="results-actions">
                <button class="quiz-btn quiz-btn-primary" onclick="location.reload()">
                    🔄 Retake Quiz
                </button>
                <button class="quiz-btn quiz-btn-secondary" id="export-results">
                    📊 Export Results
                </button>
                <button class="quiz-btn quiz-btn-secondary" id="study-recommendations">
                    📚 Study Recommendations
                </button>
            </div>
        `;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Setup results action buttons
        this.setupResultsActions(resultsContainer, attemptData);
    }

    generateLearningRecommendations(results) {
        const recommendations = this.container.querySelector('#learning-recommendations');
        if (!recommendations) return;

        // Analyze weak areas
        const weakAreas = results
            .filter(r => !r.isCorrect)
            .map(r => r.question.topic)
            .filter(topic => topic);

        const topicCounts = weakAreas.reduce((acc, topic) => {
            acc[topic] = (acc[topic] || 0) + 1;
            return acc;
        }, {});

        const priorityTopics = Object.entries(topicCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);

        recommendations.innerHTML = `
            <div class="recommendations-header">
                <h4>🎯 Personalized Learning Recommendations</h4>
            </div>
            <div class="recommendations-content">
                ${priorityTopics.length > 0 ? `
                    <div class="weak-areas">
                        <h5>📚 Areas to Review</h5>
                        <ul>
                            ${priorityTopics.map(topic => `
                                <li>${topic} - <a href="#" class="study-link" data-topic="${topic}">Study materials</a></li>
                            `).join('')}
                        </ul>
                    </div>
                ` : `
                    <div class="strong-performance">
                        <h5>🎉 Great job! You showed strong understanding across all topics.</h5>
                    </div>
                `}
                
                <div class="next-steps">
                    <h5>🚀 Next Steps</h5>
                    <ul>
                        ${this.generateNextSteps(results)}
                    </ul>
                </div>

                <div class="study-schedule">
                    <h5>⏰ Recommended Study Schedule</h5>
                    ${this.generateStudySchedule(results)}
                </div>
            </div>
        `;

        recommendations.style.display = 'block';
    }

    generateNextSteps(results) {
        const correctPercentage = (results.filter(r => r.isCorrect).length / results.length) * 100;
        
        if (correctPercentage >= 90) {
            return `
                <li>You're ready to move to the next week's content!</li>
                <li>Consider helping classmates with concepts you've mastered</li>
                <li>Explore advanced applications of these physics concepts</li>
            `;
        } else if (correctPercentage >= 70) {
            return `
                <li>Review the questions you missed before moving forward</li>
                <li>Practice similar problems to reinforce understanding</li>
                <li>Consider retaking the quiz to improve your score</li>
            `;
        } else {
            return `
                <li>Schedule focused study time for the fundamental concepts</li>
                <li>Work through additional practice problems</li>
                <li>Consider seeking help from instructors or study groups</li>
                <li>Retake the quiz once you feel more confident</li>
            `;
        }
    }

    generateStudySchedule(results) {
        return `
            <div class="schedule-grid">
                <div class="schedule-item">
                    <div class="schedule-time">Next 2 days</div>
                    <div class="schedule-task">Review missed concepts</div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-time">Day 3-4</div>
                    <div class="schedule-task">Practice problems</div>
                </div>
                <div class="schedule-item">
                    <div class="schedule-time">Day 5</div>
                    <div class="schedule-task">Retake quiz or move forward</div>
                </div>
            </div>
        `;
    }

    calculateImprovement(previousAttempts, currentScore) {
        if (previousAttempts.length === 0) {
            return { text: '' };
        }

        const lastScore = previousAttempts[previousAttempts.length - 1].percentage;
        const improvement = currentScore - lastScore;

        if (improvement > 5) {
            return { text: `📈 Improved by ${improvement}% from last attempt!`, type: 'positive' };
        } else if (improvement < -5) {
            return { text: `📉 Score dropped by ${Math.abs(improvement)}% from last attempt`, type: 'negative' };
        } else {
            return { text: `➡️ Similar performance to last attempt`, type: 'neutral' };
        }
    }

    updatePersonalityProfile(results) {
        // Update learning analytics based on performance
        const concepts = results.map(r => r.question.topic).filter(Boolean);
        const correctConcepts = results.filter(r => r.isCorrect).map(r => r.question.topic).filter(Boolean);
        const incorrectConcepts = results.filter(r => !r.isCorrect).map(r => r.question.topic).filter(Boolean);

        // Update strengths and weaknesses
        correctConcepts.forEach(concept => {
            if (!this.personalityProfile.conceptualStrength.includes(concept)) {
                this.personalityProfile.conceptualStrength.push(concept);
            }
        });

        incorrectConcepts.forEach(concept => {
            if (!this.personalityProfile.needsReinforcement.includes(concept)) {
                this.personalityProfile.needsReinforcement.push(concept);
            }
        });

        // Adjust learning preferences based on time spent and performance
        const avgTimePerQuestion = results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length;
        if (avgTimePerQuestion > 120000) { // More than 2 minutes per question
            this.personalityProfile.difficultyPreference = 'easy';
        }

        this.savePersonalityProfile();
    }

    calculateGrade(percentage) {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    getEnhancedGradeFeedback(percentage, attemptData) {
        const timeBonus = attemptData.timeSpent < 600000; // Under 10 minutes
        const previousAttempts = this.attempts[this.currentQuiz.weekId].slice(0, -1);
        
        let feedback = '';
        
        if (percentage >= 90) {
            feedback = "🌟 Excellent work! You demonstrate a strong mastery of the physics concepts.";
            if (timeBonus) feedback += " Your efficient completion shows great confidence!";
        } else if (percentage >= 80) {
            feedback = "👍 Good job! You understand most concepts well.";
            if (previousAttempts.length > 0) {
                feedback += " Consider reviewing the areas where you lost points.";
            }
        } else if (percentage >= 70) {
            feedback = "📚 You're on the right track! Focus on the explanations for missed questions.";
        } else if (percentage >= 60) {
            feedback = "💪 Keep working! You have some understanding but need more practice.";
        } else {
            feedback = "🎯 Don't give up! Review the material thoroughly and try again.";
        }

        if (previousAttempts.length > 0) {
            const improvement = this.calculateImprovement(previousAttempts, percentage);
            if (improvement.type === 'positive') {
                feedback += " Great improvement from your previous attempts!";
            }
        }

        return feedback;
    }

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    saveProgressToLocal() {
        // Implementation for saving current progress
        console.log('Progress saved locally');
    }

    loadSavedProgress(weekId) {
        // Implementation for loading saved progress
        console.log('Loading saved progress for', weekId);
    }

    setupResultsActions(container, attemptData) {
        const exportBtn = container.querySelector('#export-results');
        const studyBtn = container.querySelector('#study-recommendations');

        exportBtn?.addEventListener('click', () => {
            this.exportResults(attemptData);
        });

        studyBtn?.addEventListener('click', () => {
            const recommendations = this.container.querySelector('#learning-recommendations');
            if (recommendations) {
                recommendations.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    exportResults(attemptData) {
        const data = {
            quiz: this.currentQuiz.title,
            attempt: this.currentAttempt,
            ...attemptData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-results-${this.currentQuiz.weekId}-attempt-${this.currentAttempt}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
export default EnhancedQuizSystem;