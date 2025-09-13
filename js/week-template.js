// Week template functionality for all week pages

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Highlight current section in navigation
function highlightCurrentSection() {
    const sections = document.querySelectorAll('.day-section');
    const navLinks = document.querySelectorAll('.daily-links a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Add scroll event listener
window.addEventListener('scroll', highlightCurrentSection);

// Mobile navigation functionality
function initMobileNavigation() {
    // Create mobile nav toggle button
    const navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '📚 Menu';
    navToggle.setAttribute('aria-label', 'Toggle navigation menu');
    navToggle.setAttribute('aria-expanded', 'false');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    
    // Add to page
    document.body.appendChild(navToggle);
    document.body.appendChild(overlay);
    
    const sidebar = document.querySelector('.nav-sidebar');
    
    // Toggle functionality
    function toggleNav() {
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.innerHTML = '📚 Menu';
            document.body.style.overflow = '';
        } else {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.innerHTML = '✕ Close';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Event listeners
    navToggle.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleNav();
        }
    });
    
    // Close nav when clicking nav links on mobile
    const navLinks = sidebar.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1200) {
                setTimeout(toggleNav, 300); // Small delay for better UX
            }
        });
    });
}

// Add skip links for accessibility
function addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    
    // Ensure main content has ID
    const mainContent = document.querySelector('.main-content');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
        mainContent.setAttribute('tabindex', '-1'); // Allow programmatic focus
    }
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Fix week navigation active states
function fixWeekNavigationActiveStates() {
    const weekLinks = document.querySelectorAll('.week-link');
    const currentPath = window.location.pathname;
    
    // Extract week number from current path
    const weekMatch = currentPath.match(/week-(\d+)\.html/);
    if (!weekMatch) return;
    
    const currentWeek = parseInt(weekMatch[1]);
    
    weekLinks.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');
        
        // Check if this link corresponds to current week
        const href = link.getAttribute('href');
        if (href) {
            const linkWeekMatch = href.match(/week-(\d+)\.html/);
            if (linkWeekMatch) {
                const linkWeek = parseInt(linkWeekMatch[1]);
                if (linkWeek === currentWeek) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    addSkipLinks();
    fixWeekNavigationActiveStates();
    highlightCurrentSection();
    initMobileNavigation();
    
    console.log('Week template initialized with accessibility and navigation fixes');
});