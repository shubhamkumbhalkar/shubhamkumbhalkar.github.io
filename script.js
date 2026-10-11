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


// Dynamic blog posts — Medium + The Nuclear Geeks via rss2json (CORS-friendly).
// Degrades gracefully: on any failure the static Medium/TNG buttons remain.
(function loadBlogPosts() {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    const feeds = [
        { source: 'Medium', url: 'https://medium.com/feed/@shubham.kumbhalkar' },
        { source: 'The Nuclear Geeks', url: 'https://thenucleargeeks.com/author/shubhamkumbhalkar/feed/' }
    ];
    const endpoint = f => 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(f.url);

    // Escape remote feed content before injecting into the DOM (prevents XSS / layout breakage).
    const esc = s => (s || '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const strip = html => (html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const fmtDate = d => {
        const dt = new Date(d);
        return isNaN(dt) ? '' : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    Promise.all(feeds.map(f =>
        fetch(endpoint(f))
            .then(r => (r.ok ? r.json() : null))
            .then(d => (d && d.status === 'ok' ? (d.items || []).map(it => Object.assign(it, { _source: f.source })) : []))
            .catch(() => [])
    )).then(groups => {
        const all = groups.flat();
        if (!all.length) return; // keep static buttons only

        // Newest first, then dedupe by title (posts are cross-published on both sites)
        all.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        const seen = new Set();
        const unique = [];
        for (const p of all) {
            const key = (p.title || '').trim().toLowerCase();
            if (!key || seen.has(key)) continue;
            seen.add(key);
            unique.push(p);
        }

        container.innerHTML = unique.slice(0, 6).map(p => {
            let excerpt = strip(p.description || p.content || '').slice(0, 140);
            if (excerpt.length >= 140) excerpt += '…';
            return '<article class="blog-post-card fade-in visible">'
                + '<div class="blog-post-meta"><span class="blog-source">' + esc(p._source) + '</span>'
                + '<span>' + esc(fmtDate(p.pubDate)) + '</span></div>'
                + '<h3>' + esc(p.title || 'Untitled') + '</h3>'
                + '<p>' + esc(excerpt) + '</p>'
                + '<a class="project-link" href="' + esc(p.link || '#') + '" target="_blank" rel="noopener">Read post →</a>'
                + '</article>';
        }).join('');
    }).catch(() => {});
})();


// Contact form — Formspree AJAX submit (stays on page, shows inline status)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('form-status');
        const btn = contactForm.querySelector('button[type="submit"]');
        const action = contactForm.getAttribute('action') || '';

        if (action.includes('YOUR_FORM_ID')) {
            status.className = 'form-status error';
            status.textContent = 'Contact form is not configured yet.';
            return;
        }

        status.className = 'form-status';
        status.textContent = 'Sending…';
        btn.disabled = true;
        try {
            const res = await fetch(action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                status.className = 'form-status success';
                status.textContent = 'Thanks! Your message has been sent.';
                contactForm.reset();
            } else {
                const data = await res.json().catch(() => ({}));
                status.className = 'form-status error';
                status.textContent = (data.errors && data.errors[0] && data.errors[0].message)
                    || 'Something went wrong — please email me directly.';
            }
        } catch (_) {
            status.className = 'form-status error';
            status.textContent = 'Network error — please email me directly.';
        } finally {
            btn.disabled = false;
        }
    });
}


// Dynamic nav: shrink-on-scroll, scroll progress bar, active-section highlight
(function dynamicNav() {
    const nav = document.getElementById('nav');
    const progress = document.getElementById('scroll-progress');
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const map = new Map();
    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#')) map.set(href.slice(1), a);
    });

    function onScroll() {
        const y = window.scrollY || document.documentElement.scrollTop;
        if (nav) nav.classList.toggle('scrolled', y > 20);
        if (progress) {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Highlight the nav link for the section currently in view
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const spy = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const a = map.get(e.target.id);
                if (a) {
                    links.forEach(l => l.classList.remove('active'));
                    a.classList.add('active');
                }
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
})();


// Staggered reveal: cards within a grid animate in sequence, not all at once
(function staggerReveals() {
    const groups = document.querySelectorAll(
        '.skills-grid, .projects-grid, .achievements-grid, .timeline, .education-grid, .testimonials-grid, .hero-metrics'
    );
    groups.forEach(group => {
        Array.from(group.children).forEach((child, i) => {
            if (child.classList.contains('fade-in')) {
                child.style.transitionDelay = (i % 8) * 0.07 + 's';
            }
        });
    });
})();

// Animated count-up for hero metrics when they scroll into view
(function metricCounters() {
    const values = document.querySelectorAll('.metric-value');
    if (!values.length) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
        const text = el.textContent.trim();
        const m = text.match(/^([^\d]*)([\d.]+)([\s\S]*)$/);
        if (!m) return;
        const prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
        const decimals = (m[2].split('.')[1] || '').length;
        if (prefersReduced) { el.textContent = text; return; }
        const dur = 1400, t0 = performance.now();
        function step(now) {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            const val = (target * eased).toFixed(decimals);
            el.textContent = prefix + val + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = text; // snap to the exact original string
        }
        requestAnimationFrame(step);
    }

    const seen = new WeakSet();
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !seen.has(e.target)) {
                seen.add(e.target);
                animate(e.target);
            }
        });
    }, { threshold: 0.5 });
    values.forEach(v => io.observe(v));
})();
