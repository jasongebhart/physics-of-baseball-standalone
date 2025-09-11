/**
 * Shared Navigation Component for Physics of Baseball Course
 * Eliminates navigation duplication across all week files
 */

export class NavigationComponent {
    constructor() {
        this.weekData = [
            { id: 1, title: 'Introduction to Motion', file: 'week-01.html' },
            { id: 2, title: 'Projectile Motion', file: 'week-02.html' },
            { id: 3, title: 'Forces and Newton\'s Laws', file: 'week-03.html' },
            { id: 4, title: 'Momentum and Impulse', file: 'week-04.html' },
            { id: 5, title: 'Work and Energy', file: 'week-05.html' },
            { id: 6, title: 'Circular Motion', file: 'week-06.html' },
            { id: 7, title: 'Torque and Angular Momentum', file: 'week-07.html' },
            { id: 8, title: 'Physics of Spin', file: 'week-08.html' },
            { id: 9, title: 'Aerodynamics', file: 'week-09.html' },
            { id: 10, title: 'Pitching Mechanics', file: 'week-10.html' },
            { id: 11, title: 'Measurement and Data', file: 'week-11.html' },
            { id: 12, title: 'Equipment Physics', file: 'week-12.html' },
            { id: 13, title: 'Review and Application', file: 'week-13.html' }
        ];
    }

    /**
     * Generate navigation HTML for a specific week
     * @param {number} currentWeek - The current week number (1-13)
     * @param {string} weekSubtitle - The subtitle for current week
     * @param {Array} dailyLinks - Array of daily navigation links
     * @returns {string} Complete navigation HTML
     */
    generateNavigation(currentWeek, weekSubtitle, dailyLinks = []) {
        return `
                <div class="nav-header">
                    <div class="nav-title">Physics of Baseball</div>
                    <div class="nav-subtitle">${weekSubtitle}</div>
                </div>

                <div class="home-nav">
                    <a href="../index.html" class="home-link"><span>🏠</span><span>Course Home</span></a>
                </div>

                <div class="week-nav">
                    <div class="nav-section-title">Weeks</div>
                    <div class="week-links">
                        ${this.generateWeekLinks(currentWeek)}
                    </div>
                </div>

                <div class="daily-nav">
                    <div class="nav-section-title">This Week</div>
                    <div class="daily-links">
                        ${this.generateDailyLinks(dailyLinks)}
                    </div>
                </div>
        `;
    }

    /**
     * Generate week links with proper active state
     * @param {number} currentWeek - The current active week
     * @returns {string} Week links HTML
     */
    generateWeekLinks(currentWeek) {
        return this.weekData.map(week => {
            const activeClass = week.id === currentWeek ? ' active' : '';
            return `<a href="${week.file}" class="week-link${activeClass}"><span>${week.id}</span><span>${week.title}</span></a>`;
        }).join('\n                        ');
    }

    /**
     * Generate daily navigation links
     * @param {Array} dailyLinks - Array of {href, icon, title} objects
     * @returns {string} Daily links HTML
     */
    generateDailyLinks(dailyLinks) {
        if (!dailyLinks || dailyLinks.length === 0) {
            return '<div class="no-daily-links">No daily navigation available</div>';
        }

        return dailyLinks.map(link => 
            `<a href="${link.href}" class="daily-link"><span>${link.icon}</span><span>${link.title}</span></a>`
        ).join('\n                        ');
    }

    /**
     * Initialize navigation for a specific week page
     * @param {number} weekNumber - Week number (1-13)
     * @param {string} weekSubtitle - Week subtitle
     * @param {Array} dailyLinks - Daily navigation links
     * @param {string} containerId - ID of container to inject navigation
     */
    initNavigation(weekNumber, weekSubtitle, dailyLinks = [], containerId = 'navigation-container') {
        console.log(`Looking for navigation container: ${containerId}`);
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Navigation container '${containerId}' not found`);
            return;
        }

        console.log('Container found:', container);
        const navigationHTML = this.generateNavigation(weekNumber, weekSubtitle, dailyLinks);
        console.log('Generated navigation HTML:', navigationHTML);
        container.innerHTML = navigationHTML;
        
        // Add the nav-sidebar class for proper CSS styling
        container.className = 'nav-sidebar';
        console.log('Navigation rendered successfully');
    }

    /**
     * Auto-detect current week from URL and initialize navigation
     * @param {string} weekSubtitle - Week subtitle
     * @param {Array} dailyLinks - Daily navigation links
     */
    autoInitNavigation(weekSubtitle, dailyLinks = []) {
        // Extract week number from current URL
        const currentPath = window.location.pathname;
        const weekMatch = currentPath.match(/week-(\d+)\.html/);
        
        if (weekMatch) {
            const weekNumber = parseInt(weekMatch[1]);
            this.initNavigation(weekNumber, weekSubtitle, dailyLinks);
        } else {
            console.warn('Could not determine current week from URL:', currentPath);
        }
    }

    /**
     * Get week data for a specific week number
     * @param {number} weekNumber - Week number to get data for
     * @returns {Object} Week data object
     */
    getWeekData(weekNumber) {
        return this.weekData.find(week => week.id === weekNumber) || null;
    }
}

// Export singleton instance for convenience
export const navigationComponent = new NavigationComponent();