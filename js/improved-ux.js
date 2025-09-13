/**
 * Enhanced UX JavaScript for Physics of Baseball Course
 * Features: Progressive disclosure, smooth scrolling, accessibility improvements
 */

class CourseUXManager {
    constructor() {
        this.courseProgress = this.loadProgress();
        this.isWeeksExpanded = false;
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupWeekExpansion();
        this.setupProgressTracking();
        this.setupAccessibilityEnhancements();
        this.setupLoadingStates();
        this.setupKeyboardNavigation();
        this.updateProgressDisplay();

        // Announce page load for screen readers
        this.announcePageLoad();
    }

    // Smooth scrolling for internal links
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Focus the target for accessibility
                    targetElement.focus();
                    targetElement.setAttribute('tabindex', '-1');
                }
            }
        });
    }

    // Week expansion functionality
    setupWeekExpansion() {
        const expandButton = document.querySelector('.expand-weeks-btn');
        const additionalWeeks = document.getElementById('additional-weeks');

        if (expandButton && additionalWeeks) {
            expandButton.addEventListener('click', () => {
                this.toggleWeekExpansion();
            });
        }
    }

    toggleWeekExpansion() {
        const expandButton = document.querySelector('.expand-weeks-btn');
        const additionalWeeks = document.getElementById('additional-weeks');
        const expandIcon = expandButton.querySelector('.expand-icon');

        this.isWeeksExpanded = !this.isWeeksExpanded;

        if (this.isWeeksExpanded) {
            additionalWeeks.hidden = false;
            expandButton.setAttribute('aria-expanded', 'true');
            expandButton.innerHTML = `
                <span class="expand-icon" aria-hidden="true">▲</span>
                Show Less
                <span class="expand-count">(hide additional weeks)</span>
            `;

            // Smooth reveal animation
            additionalWeeks.style.height = '0';
            additionalWeeks.style.overflow = 'hidden';
            additionalWeeks.style.transition = 'height 0.3s ease';

            setTimeout(() => {
                additionalWeeks.style.height = additionalWeeks.scrollHeight + 'px';
                setTimeout(() => {
                    additionalWeeks.style.height = 'auto';
                    additionalWeeks.style.overflow = 'visible';
                }, 300);
            }, 10);

        } else {
            expandButton.setAttribute('aria-expanded', 'false');
            expandButton.innerHTML = `
                <span class="expand-icon" aria-hidden="true">▼</span>
                Show All 13 Weeks
                <span class="expand-count">(10 more weeks)</span>
            `;

            // Smooth hide animation
            additionalWeeks.style.height = additionalWeeks.scrollHeight + 'px';
            additionalWeeks.style.overflow = 'hidden';

            setTimeout(() => {
                additionalWeeks.style.height = '0';
                setTimeout(() => {
                    additionalWeeks.hidden = true;
                    additionalWeeks.style.height = '';
                    additionalWeeks.style.overflow = '';
                    additionalWeeks.style.transition = '';
                }, 300);
            }, 10);
        }

        // Announce change to screen readers
        this.announceToScreenReader(
            this.isWeeksExpanded
                ? 'Additional course weeks are now visible'
                : 'Additional course weeks are now hidden'
        );
    }

    // Progress tracking system
    setupProgressTracking() {
        // Load saved progress from localStorage
        this.updateWeekStates();

        // Listen for progress changes
        document.addEventListener('week-completed', (e) => {
            this.markWeekCompleted(e.detail.week);
        });
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('physics-baseball-progress');
            return saved ? JSON.parse(saved) : { completedWeeks: [], currentWeek: 1 };
        } catch (e) {
            console.warn('Could not load progress from localStorage:', e);
            return { completedWeeks: [], currentWeek: 1 };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('physics-baseball-progress', JSON.stringify(this.courseProgress));
        } catch (e) {
            console.warn('Could not save progress to localStorage:', e);
        }
    }

    markWeekCompleted(weekNumber) {
        if (!this.courseProgress.completedWeeks.includes(weekNumber)) {
            this.courseProgress.completedWeeks.push(weekNumber);
            this.courseProgress.currentWeek = Math.max(this.courseProgress.currentWeek, weekNumber + 1);
            this.saveProgress();
            this.updateProgressDisplay();
            this.updateWeekStates();

            // Celebrate completion
            this.celebrateWeekCompletion(weekNumber);
        }
    }

    updateProgressDisplay() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressBar && progressText) {
            const completed = this.courseProgress.completedWeeks.length;
            const percentage = (completed / 13) * 100;

            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${completed} of 13 weeks completed`;

            // Update progress bar ARIA attributes
            const progressElement = progressBar.closest('[role="progressbar"]');
            if (progressElement) {
                progressElement.setAttribute('aria-valuenow', completed);
                progressElement.setAttribute('aria-label', `Course completion progress: ${completed} of 13 weeks completed`);
            }
        }
    }

    updateWeekStates() {
        const weekCards = document.querySelectorAll('.week-card');

        weekCards.forEach((card) => {
            const weekNumber = parseInt(card.dataset.week);
            if (weekNumber) {
                const isCompleted = this.courseProgress.completedWeeks.includes(weekNumber);
                const isAvailable = weekNumber <= this.courseProgress.currentWeek;

                // Remove existing state classes
                card.classList.remove('week-card--completed', 'week-card--current', 'week-card--locked');

                if (isCompleted) {
                    card.classList.add('week-card--completed');
                    this.updateWeekStatus(card, '✅', 'Completed');
                } else if (isAvailable) {
                    card.classList.add('week-card--current');
                    this.updateWeekStatus(card, '●', 'Available');
                } else {
                    card.classList.add('week-card--locked');
                    this.updateWeekStatus(card, '🔒', 'Locked');
                }

                // Update link states
                this.updateWeekLink(card, isAvailable, isCompleted);
            }
        });
    }

    updateWeekStatus(card, icon, text) {
        const statusElement = card.querySelector('.week-status');
        if (statusElement) {
            statusElement.textContent = icon;
            statusElement.setAttribute('aria-label', text);
        }
    }

    updateWeekLink(card, isAvailable, isCompleted) {
        const link = card.querySelector('.week-link');
        if (link) {
            if (isCompleted) {
                link.textContent = 'Review Week';
                link.classList.remove('week-link--disabled');
                link.removeAttribute('disabled');
            } else if (isAvailable) {
                link.textContent = 'Start Week';
                link.classList.remove('week-link--disabled');
                link.removeAttribute('disabled');
            } else {
                link.textContent = 'Complete Previous Week First';
                link.classList.add('week-link--disabled');
                link.setAttribute('disabled', 'true');
            }
        }
    }

    celebrateWeekCompletion(weekNumber) {
        // Create celebration toast
        const toast = document.createElement('div');
        toast.className = 'completion-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">🎉</span>
                <div class="toast-text">
                    <strong>Week ${weekNumber} Completed!</strong>
                    <p>Great job! Week ${weekNumber + 1} is now available.</p>
                </div>
            </div>
        `;

        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--color-accent)',
            color: 'white',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-elevation-3)',
            zIndex: '1000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px'
        });

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 4000);

        // Announce to screen readers
        this.announceToScreenReader(`Week ${weekNumber} completed! Week ${weekNumber + 1} is now available.`);
    }

    // Accessibility enhancements
    setupAccessibilityEnhancements() {
        // Enhanced focus management
        this.setupFocusManagement();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // ARIA live regions
        this.setupLiveRegions();
    }

    setupFocusManagement() {
        // Skip to main content functionality
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.focus();
                    target.setAttribute('tabindex', '-1');
                }
            });
        });

        // Focus trap for modal-like interactions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const focusedElement = document.activeElement;
                if (focusedElement && focusedElement.closest('.week-card--locked')) {
                    // Help users understand why they can't access locked content
                    this.announceToScreenReader('This week is locked. Complete previous weeks to unlock.');
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + N: Next available week
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.navigateToNextWeek();
            }

            // Alt + H: Home/Overview
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = '#course-overview';
            }

            // Alt + P: Progress overview
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                this.announceProgressStatus();
            }
        });
    }

    setupLiveRegions() {
        // Create ARIA live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';

        // Add screen reader only styles
        Object.assign(liveRegion.style, {
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
        });

        document.body.appendChild(liveRegion);
    }

    navigateToNextWeek() {
        const nextWeek = this.courseProgress.currentWeek;
        const nextWeekCard = document.querySelector(`[data-week="${nextWeek}"]`);

        if (nextWeekCard) {
            nextWeekCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const link = nextWeekCard.querySelector('.week-link');
            if (link && !link.disabled) {
                setTimeout(() => link.focus(), 500);
            }

            this.announceToScreenReader(`Navigated to Week ${nextWeek}`);
        }
    }

    announceProgressStatus() {
        const completed = this.courseProgress.completedWeeks.length;
        const current = this.courseProgress.currentWeek;
        const message = `Course progress: ${completed} weeks completed out of 13. Currently on Week ${current}.`;
        this.announceToScreenReader(message);
    }

    setupLoadingStates() {
        // Show loading state when navigating to weeks
        document.addEventListener('click', (e) => {
            const weekLink = e.target.closest('.week-link:not(.week-link--disabled)');
            if (weekLink) {
                const card = weekLink.closest('.week-card');
                card.classList.add('loading');

                // Remove loading state if navigation fails
                setTimeout(() => {
                    card.classList.remove('loading');
                }, 5000);
            }
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for week cards
        const weekCards = document.querySelectorAll('.week-card');

        weekCards.forEach((card, index) => {
            card.addEventListener('keydown', (e) => {
                let targetIndex;

                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % weekCards.length;
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + weekCards.length) % weekCards.length;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = weekCards.length - 1;
                        break;
                    default:
                        return;
                }

                const targetCard = weekCards[targetIndex];
                const targetLink = targetCard.querySelector('.week-link');
                if (targetLink) {
                    targetLink.focus();
                }
            });
        });
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    announcePageLoad() {
        setTimeout(() => {
            this.announceToScreenReader(
                'Physics of Baseball course homepage loaded. Use Alt+P to hear progress status, Alt+N to go to next available week.'
            );
        }, 1500);
    }
}

// Scroll to course overview function for global use
window.scrollToCourseOverview = function() {
    const courseOverview = document.getElementById('course-overview');
    if (courseOverview) {
        courseOverview.scrollIntoView({ behavior: 'smooth', block: 'start' });
        courseOverview.focus();
        courseOverview.setAttribute('tabindex', '-1');
    }
};

// Week expansion function for global use
window.toggleWeekExpansion = function() {
    if (window.courseUX) {
        window.courseUX.toggleWeekExpansion();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.courseUX = new CourseUXManager();
    });
} else {
    window.courseUX = new CourseUXManager();
}

// Service Worker for offline functionality (progressive enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing
export { CourseUXManager };