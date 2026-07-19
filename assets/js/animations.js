/* ============================================
   Hypercars Site - Animation Controller
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll reveal animations
    initScrollReveal();
    
    // Add hover classes to interactive elements
    enhanceInteractiveElements();
    
    // Initialize counter animations
    initCounters();
    
    // Add page transition effect
    addPageTransition();
});

/**
 * Initialize scroll reveal animations
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

/**
 * Add enhanced hover effects to interactive elements
 */
function enhanceInteractiveElements() {
    // Add hover classes to all buttons
    const buttons = document.querySelectorAll('.btn:not(.btn--ghost)');
    buttons.forEach(button => {
        button.classList.add('hover-lift');
    });
    
    // Add hover glow to primary buttons
    const primaryButtons = document.querySelectorAll('.btn--primary');
    primaryButtons.forEach(button => {
        button.classList.add('hover-glow');
    });
    
    // Add pulse effect to important CTAs
    const importantCTAs = document.querySelectorAll('.btn--primary:first-child');
    importantCTAs.forEach(button => {
        button.classList.add('btn-pulse');
    });
}

/**
 * Initialize animated counters
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Animate a counter element
 */
function animateCounter(element) {
    const target = parseFloat(element.dataset.counter);
    const decimals = parseInt(element.dataset.decimals || '0');
    const suffix = element.dataset.suffix || '';
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (target - startValue) * eased;
        
        element.textContent = currentValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * Add smooth page transition effect
 */
function addPageTransition() {
    // Add transition class to body for fade in effect
    document.body.classList.add('page-transition');
    
    // Handle link clicks for smooth transitions
    const links = document.querySelectorAll('a[href^="/"], a[href^="."]:not([href*="#"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if modifier key is pressed or link opens in new tab
            if (e.metaKey || e.ctrlKey || e.shiftKey || link.target === '_blank') {
                return;
            }
            
            const href = this.getAttribute('href');
            
            // Skip anchor links
            if (href.startsWith('#')) return;
            
            e.preventDefault();
            
            // Add exit animation
            document.body.classList.add('page-exit');
            
            // Navigate after animation completes
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
}

/**
 * Create a loading spinner
 */
function createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.setAttribute('aria-label', 'Loading');
    return spinner;
}

/**
 * Create loading dots
 */
function createLoadingDots() {
    const container = document.createElement('div');
    container.className = 'loading-dots';
    container.setAttribute('aria-label', 'Loading');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        container.appendChild(dot);
    }
    
    return container;
}

/**
 * Add confetti effect
 */
function createConfetti(container, count = 50) {
    const colors = [
        '#dc2626', // red
        '#f59e0b', // orange
        '#10b981', // green
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#f472b6'  // pink
    ];
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            top: -20px;
            left: ${Math.random() * 100}%;
            animation: confettiFall ${Math.random() * 3 + 2}s ease-out forwards;
            opacity: ${Math.random() * 0.5 + 0.5};
        `;
        
        // Add keyframes for confetti fall
        if (!document.querySelector('#confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}

/**
 * Add text gradient animation
 */
function addTextGradient(element) {
    element.classList.add('text-gradient');
}

/**
 * Remove all animations for reduced motion preference
 */
function handleReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Remove animation classes
        const animatedElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .hover-lift, .hover-glow, .btn-pulse, .text-gradient');
        animatedElements.forEach(element => {
            element.classList.remove('reveal', 'reveal-left', 'reveal-right', 'reveal-scale', 'hover-lift', 'hover-glow', 'btn-pulse', 'text-gradient');
        });
        
        // Disable CSS animations
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Check for reduced motion preference on load
handleReducedMotion();

// Listen for changes in reduced motion preference
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', handleReducedMotion);

// Export functions for use in other scripts
window.animations = {
    initScrollReveal,
    enhanceInteractiveElements,
    initCounters,
    addPageTransition,
    createLoadingSpinner,
    createLoadingDots,
    createConfetti,
    addTextGradient,
    handleReducedMotion
};