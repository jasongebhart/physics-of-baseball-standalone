/**
 * Progress Tracking System
 * Tracks user progress through the Physics of Baseball course
 */

export class ProgressTracker {
    constructor() {
        this.storageKey = 'physics-baseball-progress';
        this.progress = this.loadProgress();
        this.init();
    }

    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultProgress();
        } catch (error) {
            console.warn('Failed to load progress:', error);
            return this.getDefaultProgress();
        }
    }

    getDefaultProgress() {
        return {
            completedWeeks: [],
            weekProgress: {}, // week-01: { completedDays: [1, 2], totalDays: 5 }
            lastAccessed: new Date().toISOString(),
            startDate: new Date().toISOString(),
            totalTimeSpent: 0 // in minutes
        };
    }

    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }

    init() {
        this.addProgressIndicators();
        this.trackPageView();
        this.updateLastAccessed();
    }

    addProgressIndicators() {
        // Add to index page
        if (document.querySelector('.week-grid')) {
            this.addIndexProgressIndicators();
        }
        
        // Add to week pages
        if (document.querySelector('.nav-sidebar')) {
            this.addWeekProgressIndicators();
        }
    }

    addIndexProgressIndicators() {
        const weekCards = document.querySelectorAll('.week-card');
        
        weekCards.forEach((card, index) => {
            const weekId = `week-${String(index + 1).padStart(2, '0')}`;
            const isCompleted = this.progress.completedWeeks.includes(weekId);
            const weekProgress = this.progress.weekProgress[weekId];
            
            // Add progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'progress-indicator';
            
            if (isCompleted) {
                progressIndicator.innerHTML = `
                    <div class="progress-status completed">
                        <span class="progress-icon">✓</span>
                        <span class="progress-text">Completed</span>
                    </div>
                `;
            } else if (weekProgress && weekProgress.completedDays.length > 0) {
                const percentage = Math.round((weekProgress.completedDays.length / weekProgress.totalDays) * 100);
                progressIndicator.innerHTML = `
                    <div class="progress-status in-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-text">${percentage}% Complete</span>
                    </div>
                `;
            } else {
                progressIndicator.innerHTML = `
                    <div class="progress-status not-started">
                        <span class="progress-icon">○</span>
                        <span class="progress-text">Not Started</span>
                    </div>
                `;
            }
            
            // Insert before the week link
            const weekLink = card.querySelector('.week-link');
            if (weekLink) {
                card.insertBefore(progressIndicator, weekLink);
            }
        });
    }

    addWeekProgressIndicators() {
        const currentWeek = this.getCurrentWeek();
        if (!currentWeek) return;

        // Add week progress to navigation
        const weekNav = document.querySelector('.week-nav');
        if (weekNav) {
            const progressSummary = document.createElement('div');
            progressSummary.className = 'week-progress-summary';
            progressSummary.innerHTML = this.generateWeekProgressHTML();
            
            weekNav.appendChild(progressSummary);
        }

        // Add day completion tracking
        this.addDayCompletionTracking(currentWeek);
    }

    addDayCompletionTracking(currentWeek) {
        const daySections = document.querySelectorAll('.day-section');
        
        daySections.forEach((section, index) => {
            const dayNumber = index + 1;
            const isCompleted = this.isDayCompleted(currentWeek, dayNumber);
            
            // Add completion checkbox
            const completionTracker = document.createElement('div');
            completionTracker.className = 'day-completion-tracker';
            completionTracker.innerHTML = `
                <label class="completion-checkbox">
                    <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                           data-week="${currentWeek}" data-day="${dayNumber}">
                    <span class="checkmark"></span>
                    <span class="completion-text">Mark as Complete</span>
                </label>
            `;
            
            // Add to day header
            const dayHeader = section.querySelector('.day-header');
            if (dayHeader) {
                dayHeader.appendChild(completionTracker);
            }
        });

        // Add event listeners for completion tracking
        document.addEventListener('change', (e) => {
            if (e.target.matches('.completion-checkbox input[type="checkbox"]')) {
                const week = e.target.dataset.week;
                const day = parseInt(e.target.dataset.day);
                
                if (e.target.checked) {
                    this.markDayCompleted(week, day);
                } else {
                    this.markDayIncomplete(week, day);
                }
            }
        });
    }

    getCurrentWeek() {
        const path = window.location.pathname;
        const match = path.match(/week-(\d+)\.html/);
        return match ? `week-${match[1].padStart(2, '0')}` : null;
    }

    isDayCompleted(week, day) {
        const weekProgress = this.progress.weekProgress[week];
        return weekProgress && weekProgress.completedDays.includes(day);
    }

    markDayCompleted(week, day) {
        if (!this.progress.weekProgress[week]) {
            this.progress.weekProgress[week] = {
                completedDays: [],
                totalDays: document.querySelectorAll('.day-section').length
            };
        }
        
        const weekProgress = this.progress.weekProgress[week];
        if (!weekProgress.completedDays.includes(day)) {
            weekProgress.completedDays.push(day);
            weekProgress.completedDays.sort((a, b) => a - b);
        }
        
        // Check if week is complete
        if (weekProgress.completedDays.length === weekProgress.totalDays) {
            if (!this.progress.completedWeeks.includes(week)) {
                this.progress.completedWeeks.push(week);
                this.showCompletionCelebration(week);
            }
        }
        
        this.saveProgress();
        this.updateProgressIndicators();
    }

    markDayIncomplete(week, day) {
        const weekProgress = this.progress.weekProgress[week];
        if (weekProgress) {
            const index = weekProgress.completedDays.indexOf(day);
            if (index > -1) {
                weekProgress.completedDays.splice(index, 1);
            }
        }
        
        // Remove from completed weeks if it was there
        const weekIndex = this.progress.completedWeeks.indexOf(week);
        if (weekIndex > -1) {
            this.progress.completedWeeks.splice(weekIndex, 1);
        }
        
        this.saveProgress();
        this.updateProgressIndicators();
    }

    showCompletionCelebration(week) {
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h3>Week Completed!</h3>
                <p>Congratulations on completing ${week.replace('-', ' ').toUpperCase()}!</p>
                <button class="celebration-close">Continue Learning</button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto-remove after 5 seconds or on click
        const removeIt = () => celebration.remove();
        celebration.querySelector('.celebration-close').addEventListener('click', removeIt);
        setTimeout(removeIt, 5000);
    }

    generateWeekProgressHTML() {
        const totalWeeks = 13;
        const completedWeeks = this.progress.completedWeeks.length;
        const percentage = Math.round((completedWeeks / totalWeeks) * 100);
        
        return `
            <div class="overall-progress">
                <h4>Course Progress</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-stats">
                    <span>${completedWeeks}/${totalWeeks} weeks completed</span>
                    <span>${percentage}%</span>
                </div>
            </div>
        `;
    }

    updateProgressIndicators() {
        // Refresh progress indicators if they exist
        const indicators = document.querySelectorAll('.progress-indicator, .week-progress-summary');
        indicators.forEach(indicator => indicator.remove());
        this.addProgressIndicators();
    }

    trackPageView() {
        this.progress.lastAccessed = new Date().toISOString();
        this.saveProgress();
    }

    updateLastAccessed() {
        // Track time spent (simplified)
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / (1000 * 60)); // minutes
            this.progress.totalTimeSpent += timeSpent;
            this.saveProgress();
        });
    }

    // Public API methods
    getOverallProgress() {
        const totalWeeks = 13;
        const completedWeeks = this.progress.completedWeeks.length;
        return {
            completedWeeks,
            totalWeeks,
            percentage: Math.round((completedWeeks / totalWeeks) * 100)
        };
    }

    resetProgress() {
        this.progress = this.getDefaultProgress();
        this.saveProgress();
        this.updateProgressIndicators();
    }

    exportProgress() {
        return JSON.stringify(this.progress, null, 2);
    }
}