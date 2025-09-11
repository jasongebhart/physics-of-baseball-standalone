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
        if (scrollY >= (sectionTop - 60)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightCurrentSection);
document.addEventListener('DOMContentLoaded', highlightCurrentSection);