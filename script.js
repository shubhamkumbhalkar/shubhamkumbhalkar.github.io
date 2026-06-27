// Typing animation
const phrases = [
    "Distributed Systems",
    "Cloud-Native Architecture",
    "High-Throughput Services",
    "AWS & Infrastructure as Code",
    "Scalable Microservices"
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typing');

function type() {
    const current = phrases[phraseIdx];
    typingEl.textContent = current.substring(0, charIdx) + (deleting ? '' : '|');

    if (!deleting && charIdx === current.length) {
        setTimeout(() => { deleting = true; type(); }, 2000);
        return;
    }
    if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
    }
    charIdx += deleting ? -1 : 1;
    setTimeout(type, deleting ? 30 : 80);
}
type();

// Mobile nav toggle
document.querySelector('.nav-toggle').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
    });
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.section, .timeline-item, .project-card, .achievement-card, .education-card, .metric').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});
