/**
 * Learning Analytics System
 * Advanced analytics for tracking student progress, engagement, and learning patterns
 */

class LearningAnalyticsSystem {
    constructor() {
        this.sessionData = {
            startTime: Date.now(),
            currentWeek: this.getCurrentWeek(),
            interactions: [],
            assessmentResults: {},
            timeSpent: {},
            learningPath: [],
            achievements: [],
            preferences: this.loadPreferences()
        };
        
        this.performanceMetrics = {
            totalTimeSpent: 0,
            averageQuizScore: 0,
            completedWeeks: 0,
            streakDays: 0,
            conceptsMastered: 0,
            lastActivity: null
        };
        
        this.isEnabled = localStorage.getItem('analytics-enabled') !== 'false';
        this.dashboardVisible = false;
        
        this.init();
    }
    
    init() {
        this.loadStoredData();
        this.setupEventListeners();
        this.createAnalyticsDashboard();
        this.startSessionTracking();
        
        // Auto-save every 30 seconds
        setInterval(() => this.saveData(), 30000);
        
        // Update dashboard every 5 seconds when visible
        setInterval(() => {
            if (this.dashboardVisible) {
                this.updateDashboard();
            }
        }, 5000);
        
        console.log('Learning Analytics System initialized');
    }
    
    getCurrentWeek() {
        const path = window.location.pathname;
        const weekMatch = path.match(/week-(\d+)/);
        return weekMatch ? parseInt(weekMatch[1]) : 1;
    }
    
    setupEventListeners() {
        // Track page interactions
        document.addEventListener('click', (e) => this.trackInteraction('click', e));
        document.addEventListener('scroll', this.throttle(() => this.trackInteraction('scroll'), 1000));
        
        // Track form submissions
        document.addEventListener('submit', (e) => this.trackInteraction('form_submit', e));
        
        // Track focus events on interactive elements
        document.querySelectorAll('input, textarea, select, button').forEach(element => {
            element.addEventListener('focus', (e) => this.trackInteraction('focus', e));
        });
        
        // Track video interactions if any
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', (e) => this.trackInteraction('video_play', e));
            video.addEventListener('pause', (e) => this.trackInteraction('video_pause', e));
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackInteraction('page_blur');
            } else {
                this.trackInteraction('page_focus');
            }
        });
        
        // Track beforeunload to save final session data
        window.addEventListener('beforeunload', () => this.endSession());
    }
    
    trackInteraction(type, event = null) {
        if (!this.isEnabled) return;
        
        const interaction = {
            type,
            timestamp: Date.now(),
            week: this.sessionData.currentWeek,
            element: event ? this.getElementInfo(event.target) : null,
            position: event ? { x: event.clientX, y: event.clientY } : null
        };
        
        this.sessionData.interactions.push(interaction);
        
        // Limit stored interactions to prevent memory issues
        if (this.sessionData.interactions.length > 1000) {
            this.sessionData.interactions = this.sessionData.interactions.slice(-800);
        }
        
        this.updateTimeSpent();
        this.checkForAchievements();
    }
    
    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent ? element.textContent.slice(0, 50) : null
        };
    }
    
    trackAssessmentResult(assessmentType, score, maxScore, details = {}) {
        const result = {
            type: assessmentType,
            score,
            maxScore,
            percentage: (score / maxScore) * 100,
            timestamp: Date.now(),
            week: this.sessionData.currentWeek,
            details
        };
        
        if (!this.sessionData.assessmentResults[this.sessionData.currentWeek]) {
            this.sessionData.assessmentResults[this.sessionData.currentWeek] = [];
        }
        
        this.sessionData.assessmentResults[this.sessionData.currentWeek].push(result);
        this.updatePerformanceMetrics();
        this.checkForAchievements();
        
        console.log('Assessment tracked:', result);
    }
    
    trackConceptMastery(concept, level = 'understood') {
        const masteryEvent = {
            concept,
            level, // 'introduced', 'understood', 'applied', 'mastered'
            timestamp: Date.now(),
            week: this.sessionData.currentWeek
        };
        
        this.sessionData.learningPath.push(masteryEvent);
        this.updatePerformanceMetrics();
    }
    
    updateTimeSpent() {
        const currentTime = Date.now();
        const weekKey = `week-${this.sessionData.currentWeek}`;
        
        if (!this.sessionData.timeSpent[weekKey]) {
            this.sessionData.timeSpent[weekKey] = 0;
        }
        
        // Add time since last interaction (max 5 minutes to avoid idle time)
        const lastInteraction = this.sessionData.interactions[this.sessionData.interactions.length - 2];
        if (lastInteraction) {
            const timeDiff = Math.min(currentTime - lastInteraction.timestamp, 300000); // Max 5 minutes
            this.sessionData.timeSpent[weekKey] += timeDiff;
        }
        
        this.performanceMetrics.totalTimeSpent = Object.values(this.sessionData.timeSpent)
            .reduce((total, time) => total + time, 0);
    }
    
    updatePerformanceMetrics() {
        // Calculate average quiz score
        const allAssessments = Object.values(this.sessionData.assessmentResults).flat();
        if (allAssessments.length > 0) {
            this.performanceMetrics.averageQuizScore = allAssessments
                .reduce((sum, result) => sum + result.percentage, 0) / allAssessments.length;
        }
        
        // Count completed weeks
        this.performanceMetrics.completedWeeks = Object.keys(this.sessionData.assessmentResults).length;
        
        // Count concepts mastered
        this.performanceMetrics.conceptsMastered = this.sessionData.learningPath
            .filter(event => event.level === 'mastered').length;
        
        // Update last activity
        this.performanceMetrics.lastActivity = Date.now();
        
        // Calculate streak days (simplified)
        this.calculateStreakDays();
    }
    
    calculateStreakDays() {
        const today = new Date().toDateString();
        const lastActivity = localStorage.getItem('last-activity-date');
        const streak = parseInt(localStorage.getItem('learning-streak') || '0');
        
        if (lastActivity === today) {
            // Already counted today
            this.performanceMetrics.streakDays = streak;
        } else if (lastActivity === new Date(Date.now() - 86400000).toDateString()) {
            // Continue streak
            this.performanceMetrics.streakDays = streak + 1;
            localStorage.setItem('learning-streak', this.performanceMetrics.streakDays.toString());
        } else if (!lastActivity || new Date(lastActivity) < new Date(Date.now() - 86400000)) {
            // Reset streak
            this.performanceMetrics.streakDays = 1;
            localStorage.setItem('learning-streak', '1');
        }
        
        localStorage.setItem('last-activity-date', today);
    }
    
    checkForAchievements() {
        const achievements = [
            {
                id: 'first_quiz',
                name: 'Quiz Taker',
                description: 'Completed your first quiz',
                icon: '📝',
                condition: () => Object.values(this.sessionData.assessmentResults).flat().length >= 1
            },
            {
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Got 100% on a quiz',
                icon: '🎯',
                condition: () => Object.values(this.sessionData.assessmentResults).flat()
                    .some(result => result.percentage >= 100)
            },
            {
                id: 'week_complete',
                name: 'Week Champion',
                description: 'Completed an entire week',
                icon: '🏆',
                condition: () => this.performanceMetrics.completedWeeks >= 1
            },
            {
                id: 'time_spent_1hr',
                name: 'Dedicated Learner',
                description: 'Spent 1 hour learning physics',
                icon: '⏱️',
                condition: () => this.performanceMetrics.totalTimeSpent >= 3600000
            },
            {
                id: 'streak_3',
                name: 'Learning Streak',
                description: 'Learned 3 days in a row',
                icon: '🔥',
                condition: () => this.performanceMetrics.streakDays >= 3
            },
            {
                id: 'concept_master',
                name: 'Concept Master',
                description: 'Mastered 5 physics concepts',
                icon: '🧠',
                condition: () => this.performanceMetrics.conceptsMastered >= 5
            }
        ];
        
        achievements.forEach(achievement => {
            if (achievement.condition() && !this.hasAchievement(achievement.id)) {
                this.unlockAchievement(achievement);
            }
        });
    }
    
    hasAchievement(achievementId) {
        return this.sessionData.achievements.some(a => a.id === achievementId);
    }
    
    unlockAchievement(achievement) {
        const achievementData = {
            ...achievement,
            unlockedAt: Date.now(),
            week: this.sessionData.currentWeek
        };
        
        this.sessionData.achievements.push(achievementData);
        this.showAchievementNotification(achievement);
        
        console.log('Achievement unlocked:', achievement.name);
    }
    
    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <div>
                <strong>${achievement.name}</strong>
                <br>
                <small>${achievement.description}</small>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
    
    createAnalyticsDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'analytics-dashboard';
        dashboard.id = 'analytics-dashboard';
        dashboard.style.display = 'none';
        
        dashboard.innerHTML = `
            <div class="analytics-header">
                <h3 class="analytics-title">📊 Learning Analytics</h3>
                <button class="analytics-toggle" onclick="window.learningAnalytics?.toggleDashboard()">
                    Hide Dashboard
                </button>
            </div>
            
            <div class="progress-metrics">
                <div class="metric-card">
                    <span class="metric-value" id="total-time">0h 0m</span>
                    <span class="metric-label">Time Spent</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value" id="avg-score">--%</span>
                    <span class="metric-label">Average Score</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value" id="completed-weeks">0</span>
                    <span class="metric-label">Weeks Completed</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value" id="learning-streak">0</span>
                    <span class="metric-label">Day Streak</span>
                </div>
            </div>
            
            <div class="progress-chart">
                <div class="chart-line"></div>
                <p style="text-align: center; margin-top: 1rem; opacity: 0.8;">
                    Progress visualization will appear here as you complete more activities
                </p>
            </div>
            
            <div class="learning-path-visual">
                <div class="path-node completed">1</div>
                <div class="path-connector"></div>
                <div class="path-node current" id="current-week-node">${this.sessionData.currentWeek}</div>
                <div class="path-connector"></div>
                <div class="path-node future">13</div>
            </div>
        `;
        
        // Insert dashboard at the top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent && mainContent.firstChild) {
            mainContent.insertBefore(dashboard, mainContent.firstChild);
        }
        
        // Add toggle button to show dashboard
        this.addAnalyticsToggle();
    }
    
    addAnalyticsToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'analytics-toggle';
        toggle.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
        `;
        toggle.textContent = '📊 Analytics';
        toggle.onclick = () => this.toggleDashboard();
        
        document.body.appendChild(toggle);
    }
    
    toggleDashboard() {
        const dashboard = document.getElementById('analytics-dashboard');
        const toggle = document.querySelector('button[onclick*="toggleDashboard"]');
        
        if (dashboard) {
            this.dashboardVisible = !this.dashboardVisible;
            dashboard.style.display = this.dashboardVisible ? 'block' : 'none';
            
            if (this.dashboardVisible) {
                this.updateDashboard();
                if (toggle) toggle.textContent = 'Hide Analytics';
            } else {
                if (toggle) toggle.textContent = '📊 Analytics';
            }
        }
    }
    
    updateDashboard() {
        this.updatePerformanceMetrics();
        
        // Update time display
        const totalTimeEl = document.getElementById('total-time');
        if (totalTimeEl) {
            const hours = Math.floor(this.performanceMetrics.totalTimeSpent / 3600000);
            const minutes = Math.floor((this.performanceMetrics.totalTimeSpent % 3600000) / 60000);
            totalTimeEl.textContent = `${hours}h ${minutes}m`;
        }
        
        // Update average score
        const avgScoreEl = document.getElementById('avg-score');
        if (avgScoreEl) {
            avgScoreEl.textContent = this.performanceMetrics.averageQuizScore > 0 
                ? `${Math.round(this.performanceMetrics.averageQuizScore)}%`
                : '--%';
        }
        
        // Update completed weeks
        const completedWeeksEl = document.getElementById('completed-weeks');
        if (completedWeeksEl) {
            completedWeeksEl.textContent = this.performanceMetrics.completedWeeks;
        }
        
        // Update learning streak
        const streakEl = document.getElementById('learning-streak');
        if (streakEl) {
            streakEl.textContent = this.performanceMetrics.streakDays;
        }
        
        // Update current week node
        const currentWeekNode = document.getElementById('current-week-node');
        if (currentWeekNode) {
            currentWeekNode.textContent = this.sessionData.currentWeek;
        }
    }
    
    startSessionTracking() {
        this.trackInteraction('session_start');
        
        // Track time spent on page
        setInterval(() => {
            if (!document.hidden) {
                this.updateTimeSpent();
            }
        }, 10000); // Every 10 seconds
    }
    
    endSession() {
        this.trackInteraction('session_end');
        this.saveData();
        
        console.log('Learning session ended');
    }
    
    saveData() {
        try {
            localStorage.setItem('learning-analytics-session', JSON.stringify(this.sessionData));
            localStorage.setItem('learning-analytics-performance', JSON.stringify(this.performanceMetrics));
            
            // Also save to a persistent log (could be sent to server)
            const logEntry = {
                timestamp: Date.now(),
                week: this.sessionData.currentWeek,
                sessionDuration: Date.now() - this.sessionData.startTime,
                interactionCount: this.sessionData.interactions.length,
                achievements: this.sessionData.achievements.length
            };
            
            const logs = JSON.parse(localStorage.getItem('learning-analytics-logs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 log entries
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('learning-analytics-logs', JSON.stringify(logs));
            
        } catch (error) {
            console.error('Error saving analytics data:', error);
        }
    }
    
    loadStoredData() {
        try {
            const savedSession = localStorage.getItem('learning-analytics-session');
            const savedPerformance = localStorage.getItem('learning-analytics-performance');
            
            if (savedSession) {
                const parsed = JSON.parse(savedSession);
                // Merge with current session, keeping current timestamp
                this.sessionData = { ...parsed, startTime: Date.now() };
            }
            
            if (savedPerformance) {
                this.performanceMetrics = JSON.parse(savedPerformance);
            }
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }
    
    loadPreferences() {
        try {
            return JSON.parse(localStorage.getItem('learning-preferences') || '{}');
        } catch {
            return {};
        }
    }
    
    // Utility function for throttling events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API methods
    enableAnalytics() {
        this.isEnabled = true;
        localStorage.setItem('analytics-enabled', 'true');
        console.log('Learning analytics enabled');
    }
    
    disableAnalytics() {
        this.isEnabled = false;
        localStorage.setItem('analytics-enabled', 'false');
        console.log('Learning analytics disabled');
    }
    
    getAnalyticsData() {
        return {
            session: this.sessionData,
            performance: this.performanceMetrics,
            isEnabled: this.isEnabled
        };
    }
    
    exportData() {
        const data = this.getAnalyticsData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    clearData() {
        localStorage.removeItem('learning-analytics-session');
        localStorage.removeItem('learning-analytics-performance');
        localStorage.removeItem('learning-analytics-logs');
        localStorage.removeItem('learning-streak');
        localStorage.removeItem('last-activity-date');
        
        this.sessionData = {
            startTime: Date.now(),
            currentWeek: this.getCurrentWeek(),
            interactions: [],
            assessmentResults: {},
            timeSpent: {},
            learningPath: [],
            achievements: [],
            preferences: {}
        };
        
        this.performanceMetrics = {
            totalTimeSpent: 0,
            averageQuizScore: 0,
            completedWeeks: 0,
            streakDays: 0,
            conceptsMastered: 0,
            lastActivity: null
        };
        
        console.log('Learning analytics data cleared');
    }
}

// Export for use as ES6 module
export default LearningAnalyticsSystem;

// Also make available globally for backward compatibility
window.LearningAnalyticsSystem = LearningAnalyticsSystem;