// script.js - preloader, mobile nav toggle, simple accessibility tweaks
document.addEventListener('DOMContentLoaded', function () {
  // Preloader simulated progress (keeps original UX but with smoother easing)
  const preloader = document.getElementById('preloader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const heroImage = document.getElementById('heroImage');
  let start = null;
  const duration = 900 + Math.random() * 700;

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 2);
    const pct = Math.floor(eased * 100);
    loaderFill.style.width = pct + '%';
    loaderPercent.textContent = pct + '%';
    if (progress < 1) window.requestAnimationFrame(step);
    else finish();
  }

  let imgLoaded = false;
  if (heroImage && heroImage.complete) imgLoaded = true;
  else if (heroImage) heroImage.addEventListener('load', () => { imgLoaded = true; });

  window.requestAnimationFrame(step);

  function finish() {
    // small delay then fade
    setTimeout(() => {
      if (!preloader) {
        // still reveal hero elements if preloader missing
        revealHeroElements();
        // dispatch event so metrics can start immediately
        document.dispatchEvent(new CustomEvent('preloaderFinished'));
        return;
      }

      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';

      // keep a slightly longer timeout so transitions finish smoothly
      setTimeout(() => {
        try { preloader.remove(); } catch (e) { /* ignore */ }

        // reveal hero and other content
        revealHeroElements();

        // Tell anyone waiting (metrics) that preload is complete
        document.dispatchEvent(new CustomEvent('preloaderFinished'));
      }, 500);
    }, 220);
  }

  // Responsive nav toggle with backdrop, ESC handling, focus trap
(function () {
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('navList');
  if (!menuToggle || !navList) return;

  // create a backdrop element (insert once)
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  // helper: open / close
  function openNav() {
    menuToggle.setAttribute('aria-expanded', 'true');
    navList.classList.add('show');
    navList.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('visible');
    document.body.classList.add('nav-open'); // use to disable scroll
    disableBodyScroll(true);
    // focus first link for quick keyboard navigation
    const first = navList.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
    trapFocus(navList);
  }

  function closeNav() {
    menuToggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('show');
    navList.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('visible');
    document.body.classList.remove('nav-open');
    disableBodyScroll(false);
    releaseFocusTrap();
    // return focus to toggle button
    menuToggle.focus();
  }

  // Basic body scroll disable (adds inline style)
  function disableBodyScroll(disable) {
    if (disable) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  // Toggle handler
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeNav(); else openNav();
  });

  // close when clicking backdrop
  backdrop.addEventListener('click', closeNav);

  // click outside to close (touch-friendly)
  document.addEventListener('click', (e) => {
    if (!navList.classList.contains('show')) return;
    if (navList.contains(e.target) || menuToggle.contains(e.target) || backdrop.contains(e.target)) return;
    closeNav();
  }, { passive: true });

  // Esc to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('show')) {
      closeNav();
    }
  });

  // ---- Focus trap (small, robust) ----
  let focusTrapActive = false;
  let focusableNodes = [];
  let firstNode = null;
  let lastNode = null;

  function trapFocus(container) {
    focusableNodes = Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(n => n.offsetParent !== null);
    if (focusableNodes.length === 0) return;
    firstNode = focusableNodes[0];
    lastNode = focusableNodes[focusableNodes.length - 1];
    focusTrapActive = true;
    document.addEventListener('keydown', focusTrapHandler);
  }

  function releaseFocusTrap() {
    focusTrapActive = false;
    document.removeEventListener('keydown', focusTrapHandler);
  }

  function focusTrapHandler(e) {
    if (!focusTrapActive) return;
    if (e.key !== 'Tab') return;
    if (focusableNodes.length === 0) return;

    const active = document.activeElement;
    if (e.shiftKey && active === firstNode) {
      // shift+tab on first -> go to last
      e.preventDefault();
      lastNode.focus();
    } else if (!e.shiftKey && active === lastNode) {
      // tab on last -> go to first
      e.preventDefault();
      firstNode.focus();
    }
  }

  // ensure ARIA defaults
  if (!navList.hasAttribute('aria-hidden')) navList.setAttribute('aria-hidden', 'true');
  if (!menuToggle.hasAttribute('aria-expanded')) menuToggle.setAttribute('aria-expanded', 'false');

  // ensure menu toggle is keyboard-focusable & labeled
  if (!menuToggle.hasAttribute('aria-controls')) menuToggle.setAttribute('aria-controls', navList.id || 'navList');
  if (!menuToggle.hasAttribute('aria-label')) menuToggle.setAttribute('aria-label', 'Toggle navigation');
})();

  // Set year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // simple reveal animation for hero area after preloader
  function revealHeroElements() {
    document.querySelectorAll('.hero-left, .media-card').forEach((el, i) => {
      el.style.opacity = 0;
      el.style.transform = 'translateY(18px)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.transition = 'opacity .7s cubic-bezier(.2,.9,.1,1), transform .7s cubic-bezier(.2,.9,.1,1)';
          el.style.opacity = 1;
          el.style.transform = 'translateY(0)';
        }, i * 120);
      });
    });
  }

  // Respect prefers-reduced-motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    if (loaderFill) loaderFill.style.transition = 'none';
    if (loaderPercent) loaderPercent.textContent = '100%';
    if (preloader) preloader.remove();
  }

  // Intersection observer for subtle floating on scroll
  const mediaCard = document.getElementById('mediaCard');
  if ('IntersectionObserver' in window && mediaCard) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) mediaCard.classList.add('in-view');
        else mediaCard.classList.remove('in-view');
      });
    }, { threshold: 0.3 });
    io.observe(mediaCard);
  }
});
// Metrics counter module — waits for preloader to finish before animating
(function () {
  const section = document.getElementById('metrics');
  if (!section) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numberEls = Array.from(section.querySelectorAll('.metric-number'));

  function setNumberInstant(el) {
    const t = parseFloat(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || '';
    el.textContent = t.toLocaleString() + (suffix || '');
  }

  function animateCount(el, duration = 1400) {
    const startTime = performance.now();
    const from = 0;
    const targetRaw = el.dataset.target || '0';
    const target = parseFloat(targetRaw);
    const suffix = el.dataset.suffix || '';
    if (isNaN(target)) { setNumberInstant(el); return; }

    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = Math.floor(from + (target - from) * eased);
      el.textContent = value.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  }

  function startAll() {
    numberEls.forEach(el => {
      if (prefersReduced) {
        setNumberInstant(el);
      } else {
        const val = Math.abs(parseFloat(el.dataset.target) || 0);
        const dur = Math.min(2200, 900 + Math.log10(Math.max(10, val)) * 280);
        animateCount(el, dur);
      }
    });
  }

  // If user prefers reduced motion -> set instantly and do not observe
  if (prefersReduced) {
    // ensure visible numbers immediately
    startAll();
    return;
  }

  // Use IntersectionObserver so numbers start when the metrics section is visible
  const startWhenVisible = () => {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAll();
          obs.disconnect();
        }
      });
    }, { threshold: 0.35 });

    io.observe(section);
  };

  // If preloader exists, wait for custom event. If not, start observing now.
  const preloaderEl = document.getElementById('preloader');
  if (preloaderEl) {
    // If preloader already removed (rare), start immediately
    if (!document.body.contains(preloaderEl)) {
      startWhenVisible();
    } else {
      // Wait for preloader finished event
      const onDone = () => {
        startWhenVisible();
        document.removeEventListener('preloaderFinished', onDone);
      };
      document.addEventListener('preloaderFinished', onDone);
    }
  } else {
    startWhenVisible();
  }
})();

// services 
// services-images-full.js — reveal animation + CTA scroll
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('#servicesGrid .svc-card');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.12 });

    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('in-view'));
  }

  // CTA click smooth scroll (if contact anchor exists)
  const svcContactBtn = document.getElementById('svcContactBtn');
  if (svcContactBtn) {
    svcContactBtn.addEventListener('click', (e) => {
      const href = svcContactBtn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
});
// solution part
// solutions-section.js — reveal animations and small interactions
document.addEventListener('DOMContentLoaded', () => {
  const revealTargets = document.querySelectorAll('#solutions .media-frame, #solutions .media-badge, #solutions .solutions-content, #solutions .feature, #solutions .btn-learn');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }

  // Feature button demo click (highlight)
  const features = document.querySelectorAll('#featuresGrid .feature');
  features.forEach(f => {
    f.addEventListener('click', () => {
      f.classList.add('active');
      setTimeout(() => f.classList.remove('active'), 800);
    });
  });

  // Learn More smooth-scroll
  const btn = document.querySelector('.btn-learn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
});
// about section js 
// about-section.js — reveal animations for About section
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('#about-company .media-frame, #about-company .media-badge, #about-company .testimonial, #about-company .about-content, #about-company .stat');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -80px 0px', threshold: 0.12 });

    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in-view'));
  }

  // Optional: make clicking testimonial focus it
  const testimonial = document.querySelector('#about-company .testimonial');
  if (testimonial) {
    testimonial.addEventListener('click', () => {
      testimonial.classList.add('in-view');
      setTimeout(() => testimonial.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    });
  }
});


// why us 
// features-section.js — reveal on scroll + small interactions
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('#features .card, #features .wide, #features .small-card');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in-view'));
  }

  // optional: keyboard & click focus for small features
  document.querySelectorAll('#features .feature-card, #features .small-card, #features .wide').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { el.classList.add('in-view'); setTimeout(()=>el.classList.remove('in-view'),400); }
    });
  });
});

// new 
// cta-contact.js — reveal animation + smooth scroll to #contact
document.addEventListener('DOMContentLoaded', () => {
  // reveal pills and cards
  const targets = document.querySelectorAll('.btn-primary, .pill, .contact-card');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in-view'));
  }

  // smooth scroll for primary CTA if in-page anchor
  const primaryCTA = document.querySelector('.btn-primary');
  if (primaryCTA) {
    primaryCTA.addEventListener('click', (e) => {
      const href = primaryCTA.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
});

// footer
// footer.js - small behavior: set year and handle subscribe
document.addEventListener('DOMContentLoaded', function () {
  // set current year
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // handle subscribe form
  const form = document.getElementById('footerSubscribe');
  const email = document.getElementById('subscribeEmail');

  if (form && email) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = email.value.trim();

      // basic email validation
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (!isEmail) {
        email.classList.add('invalid');
        email.focus();
        // brief shake
        email.animate([
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(0)' }
        ], { duration: 300 });
        return;
      }

      // simulate success - replace this with real AJAX if needed
      form.innerHTML = '<div class="subscribe-success">Thanks! You are subscribed.</div>';
    });
  }
});

// aapointmen js

// // hero-cta.js
// 1) reveal animation for the hero content when it scrolls into view
// 2) smooth scroll when CTA links to in-page anchor (#contact)

document.addEventListener('DOMContentLoaded', () => {
  const heroInner = document.querySelector('.hero-inner');
  if (!heroInner) return;

  // small entrance animation using IntersectionObserver
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          heroInner.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(.2,.9,.2,1)';
          heroInner.style.opacity = '1';
          heroInner.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // start in hidden state
    heroInner.style.opacity = '0';
    heroInner.style.transform = 'translateY(12px)';
    io.observe(heroInner);
  } else {
    heroInner.style.opacity = '1';
  }

  // parallax-like slow scale effect on scroll (subtle)
  const bg = document.querySelector('.hero-bg');
  if (bg) {
    const onScroll = () => {
      const rect = bg.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      // compute relative offset (-1..1)
      const rel = (rect.top + rect.height/2 - mid) / mid;
      // clamp and map to a small scale
      const scale = 1.03 - Math.min(Math.max(rel * 0.02, -0.02), 0.02);
      bg.style.transform = `scale(${scale})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // smooth scroll for CTA
  const scheduleBtn = document.getElementById('scheduleBtn');
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
// services-images-full-blue.js
document.addEventListener('DOMContentLoaded', () => {
  const serviceGrid = document.getElementById('servicesGrid');
  const serviceCards = Array.from(document.querySelectorAll('#servicesGrid .svc-card'));
  if (!serviceCards.length) return;

  // ---------- IntersectionObserver: staggered reveal ----------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const idx = serviceCards.indexOf(el);
        // stagger by index but clamp to avoid long delays
        setTimeout(() => el.classList.add('in-view'), Math.min(idx * 70, 450));
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -96px 0px' });

    serviceCards.forEach(c => io.observe(c));
  } else {
    // fallback: simple stagger
    serviceCards.forEach((c,i) => setTimeout(()=>c.classList.add('in-view'), i*70));
  }

  // ---------- keyboard accessibility: focusing shows hover-like state ----------
  serviceCards.forEach(card => {
    card.addEventListener('focusin', () => {
      card.classList.add('in-focus');
    });
    card.addEventListener('focusout', () => {
      card.classList.remove('in-focus');
      // keep in-view after reveal
      card.classList.add('in-view');
    });

    // allow Enter to follow link inside card if present
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const link = card.querySelector('a');
        if (link) {
          link.click();
        }
      }
    });
  });

  // ---------- CTA smooth-scroll ----------
  const svcContactBtn = document.getElementById('svcContactBtn');
  if (svcContactBtn) {
    svcContactBtn.addEventListener('click', (e) => {
      const href = svcContactBtn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // move focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          target.removeAttribute('tabindex');
        }
      }
    });
  }

  // ---------- optional: keyboard navigation inside grid (arrow keys) ----------
  // Left/right/up/down to move focus between cards (good for keyboard-heavy users)
  const cols = getComputedStyle(serviceGrid).gridTemplateColumns.split(' ').length || 4;
  serviceGrid.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (!active || !active.classList.contains('svc-card')) return;

    const idx = serviceCards.indexOf(active);
    if (idx === -1) return;

    if (e.key === 'ArrowRight') {
      const next = serviceCards[(idx + 1) % serviceCards.length];
      next.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = serviceCards[(idx - 1 + serviceCards.length) % serviceCards.length];
      prev.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      const nextRow = Math.min(idx + cols, serviceCards.length - 1);
      serviceCards[nextRow].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      const prevRow = Math.max(idx - cols, 0);
      serviceCards[prevRow].focus();
      e.preventDefault();
    }
  });
});


// Reveal animation for services header
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".services-header");

  if (!header) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        header.classList.add("in-view");
        io.unobserve(header);
      }
    });
  }, { threshold: 0.2 });

  io.observe(header);
});

/* CTA small particle / connecting-lines canvas
   Lightweight: creates subtle moving dots and occasional connecting lines.
   Non-blocking, disables itself on small screens to save perf.
*/
(function(){
  const canvas = document.getElementById('ctaStars');
  if(!canvas) return;

  const ctx = canvas.getContext('2d', {alpha: true});
  let w = canvas.width = canvas.offsetWidth;
  let h = canvas.height = canvas.offsetHeight;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * DPR);
  canvas.height = Math.round(h * DPR);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(DPR, DPR);

  // disable on very small viewports
  if (window.innerWidth < 600) {
    canvas.style.opacity = '0.35';
  }

  const config = {
    count: Math.max(10, Math.floor(Math.min(w, 1200) / 120)), // number of dots
    speed: 0.2,
    radius: 1.2,
    connectDist: 110
  };

  const rand = (a,b) => a + Math.random() * (b - a);
  const particles = [];

  for (let i=0;i<config.count;i++){
    particles.push({
      x: rand(20, w-20),
      y: rand(20, h-20),
      vx: rand(-0.2, 0.2),
      vy: rand(-0.2, 0.2),
      r: rand(config.radius*0.6, config.radius*1.6),
      alpha: rand(0.4, 0.95)
    });
  }

  function draw() {
    ctx.clearRect(0,0,w,h);

    // subtle backdrop glow (centered gradient)
    const g = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.1, w/2, h/2, Math.max(w,h));
    g.addColorStop(0, 'rgba(0,120,140,0.06)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // draw particles
    for (let i=0;i<particles.length;i++){
      const p = particles[i];
      ctx.beginPath();
      ctx.globalAlpha = p.alpha * 0.9;
      ctx.fillStyle = 'rgba(24, 182, 255, 1)'; // cyan-ish highlight
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // draw connecting lines
    ctx.lineWidth = 0.8;
    for (let i=0;i<particles.length;i++){
      for (let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < config.connectDist) {
          ctx.beginPath();
          ctx.globalAlpha = 0.12 * (1 - d / config.connectDist);
          ctx.strokeStyle = 'rgba(56,200,255,1)';
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  function step() {
    for (let p of particles) {
      p.x += p.vx * (config.speed * 8);
      p.y += p.vy * (config.speed * 8);

      if (p.x < 6 || p.x > w - 6) p.vx *= -1;
      if (p.y < 6 || p.y > h - 6) p.vy *= -1;

      // tiny random drift
      p.vx += rand(-0.02, 0.02) * 0.06;
      p.vy += rand(-0.02, 0.02) * 0.06;
      p.vx = Math.max(Math.min(p.vx, 0.6), -0.6);
      p.vy = Math.max(Math.min(p.vy, 0.6), -0.6);
    }

    draw();
    requestAnimationFrame(step);
  }

  // handle resize with debounce
  let resizeTO;
  function onResize(){
    clearTimeout(resizeTO);
    resizeTO = setTimeout(()=>{
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }, 120);
  }
  window.addEventListener('resize', onResize, {passive:true});

  // tasteful entrance animation for the panel
  const panel = document.querySelector('.cta-panel');
  if (panel) {
    panel.style.transform = 'translateY(12px) scale(0.998)';
    panel.style.opacity = '0';
    requestAnimationFrame(()=> {
      panel.style.transition = 'transform 600ms cubic-bezier(.2,.9,.2,1), opacity 460ms ease';
      panel.style.transform = '';
      panel.style.opacity = '';
    });
  }

  // start
  step();

  // cleanup on page unload
  window.addEventListener('unload', ()=> {
    // no heavy cleanup required; let GC handle it
  });
})();

document.getElementById("footerYear").textContent = new Date().getFullYear();

(function () {
  // simple reveal with IntersectionObserver
  const revealed = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('show');
        revealed.add(el);
        // once revealed, unobserve
        io.unobserve(el);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('.reveal').forEach(el => {
    io.observe(el);
  });

  // stats count-up (only once when visible)
  function countUp(el, to) {
    const duration = 900;
    const start = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // simple easing
      const val = Math.floor(start + (to - start) * ease);
      el.textContent = val;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const num = entry.target.querySelector('.stat-number');
        if (num && !num.dataset.animated) {
          const target = parseInt(num.dataset-target || num.textContent.replace(/\D/g,''), 10) || 0;
          num.dataset.animated = '1';
          countUp(num, target);
        }
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat').forEach(s => statsObserver.observe(s));

  // attach reveal class to elements we want animated
  // Add .reveal to elements in HTML (or annotate here)
  // We'll add it to common blocks automatically:
  document.querySelectorAll('.about-content, .media-frame, .testimonial, .stat').forEach((el) => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
    io.observe(el);
  });

})();


/*
  Improved reveal script for Core Values section
  - Expects each row: .value-row containing .value-text and .value-media
  - Uses CSS classes: .reveal-left | .reveal-right (initial), .revealed (final)
*/
(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rows = Array.from(document.querySelectorAll('#core-values .value-row'));
  if (!rows.length) return;

  // Config: tweak to change timings
  const CONFIG = {
    textBaseDelay: 80,    // base ms offset for first text
    mediaOffset: 210,     // additional ms before media reveals (per row)
    staggerPerRow: 120,   // additional ms per row index
    observerRootMargin: '0px 0px -14% 0px', // reveal a bit before fully in view
    observerThreshold: 0.16
  };

  // Initialize each row: set starting reveal classes and data-delay attributes
  rows.forEach((row, i) => {
    const text = row.querySelector('.value-text');
    const media = row.querySelector('.value-media');

    if (!text || !media) return;

    // decide directional classes based on index (alternating)
    const isEven = i % 2 === 1; // 0-based
    // remove any accidental leftover classes
    text.classList.remove('reveal-left', 'reveal-right', 'revealed');
    media.classList.remove('reveal-left', 'reveal-right', 'revealed');

    // text slides from left on odd rows (index 0 => left), from right on even
    text.classList.add(isEven ? 'reveal-right' : 'reveal-left');
    media.classList.add(isEven ? 'reveal-left' : 'reveal-right');

    // compute and store delays as numbers (ms)
    const perRowStagger = i * CONFIG.staggerPerRow;
    text.dataset.revealDelay = String(CONFIG.textBaseDelay + perRowStagger);
    media.dataset.revealDelay = String(CONFIG.textBaseDelay + CONFIG.mediaOffset + perRowStagger);

    // ensure keyboard focus reveals the row (improves accessibility)
    [text, media].forEach(el => {
      el.addEventListener('focusin', () => revealRowImmediate(row));
    });
  });

  // Use IntersectionObserver to trigger reveals
  const io = new IntersectionObserver(onIntersect, {
    root: null,
    rootMargin: CONFIG.observerRootMargin,
    threshold: CONFIG.observerThreshold
  });

  rows.forEach(r => io.observe(r));

  // Intersection handler
  function onIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const row = entry.target;
      // trigger reveal for this row
      revealRow(row);
      // stop observing this row after reveal
      io.unobserve(row);
    });
  }

  // Reveal logic: sequentially reveal text then media using delays
  function revealRow(row) {
    if (!row || row.dataset.revealed === '1') return;
    row.dataset.revealed = '1';

    if (prefersReduced) {
      // immediately add final class for reduced-motion users
      addClassSafe(row.querySelectorAll('.value-text, .value-media'), 'revealed');
      return;
    }

    const text = row.querySelector('.value-text');
    const media = row.querySelector('.value-media');

    const textDelay = Math.max(0, parseInt(text && text.dataset.revealDelay || 0, 10));
    const mediaDelay = Math.max(0, parseInt(media && media.dataset.revealDelay || textDelay + CONFIG.mediaOffset, 10));

    // schedule reveals using requestAnimationFrame and setTimeout for accurate timing
    scheduleReveal(text, textDelay);
    scheduleReveal(media, mediaDelay);
  }

  // Immediate reveal (used for focus)
  function revealRowImmediate(row) {
    if (!row || row.dataset.revealed === '1') return;
    // reveal immediately without waiting for intersection
    revealRow(row);
  }

  // helper: schedule reveal for element after ms delay
  function scheduleReveal(el, ms) {
    if (!el) return;
    // Respect already-revealed
    if (el.classList.contains('revealed')) return;

    // Use setTimeout wrapped with requestAnimationFrame for smoothness
    setTimeout(() => {
      // requestAnimationFrame ensures class toggles happen at paint
      window.requestAnimationFrame(() => {
        el.classList.add('revealed');
      });
    }, ms);
  }

  // helper: add class to a NodeList or array of elements
  function addClassSafe(nodes, className) {
    if (!nodes) return;
    if (nodes instanceof Element) {
      nodes.classList.add(className);
      return;
    }
    nodes.forEach(n => n && n.classList && n.classList.add(className));
  }

  // Clean up on page unload (not strictly necessary, but tidy)
  window.addEventListener('pagehide', () => {
    try { io.disconnect(); } catch (e) {}
  }, { passive: true });

})();
/* ===== Global background mesh: blue dots + connecting lines (desktop + mobile) ===== */
(function bgMesh() {
  if (typeof window === 'undefined') return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const canvas = document.getElementById('bgMeshCanvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  let width = 0;
  let height = 0;
  let dpr = 1;
  const MAX_DPR = 1.7;
  const nodes = [];

  function isSmall() {
    return window.innerWidth < 900; // just changes density, does NOT disable
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initNodes() {
    nodes.length = 0;

    const count = isSmall() ? 18 : 40;       // fewer on phones, more on desktop
    const speed = isSmall() ? 0.07 : 0.12;   // saved on each node
    const DOT_MIN = 2;
    const DOT_MAX = 2;

    for (let i = 0; i < count; i++) {
      const bias = Math.random();
      let x, y;

      // bias clusters so it looks like your reference
      if (bias > 0.6) {
        x = width * (0.55 + Math.random() * 0.4); // right/top
        y = height * (0.04 + Math.random() * 0.32);
      } else if (bias > 0.3) {
        x = width * (0.08 + Math.random() * 0.35); // left/mid
        y = height * (0.2 + Math.random() * 0.35);
      } else {
        x = Math.random() * width;
        y = Math.random() * height;
      }

      nodes.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: DOT_MIN + Math.random() * (DOT_MAX - DOT_MIN),
        phase: Math.random() * Math.PI * 2,
        baseSpeed: speed
      });
    }
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, width, height);

    // subtle dark wash so effect is visible
    ctx.fillStyle = 'rgba(3, 8, 18, 0.78)';
    ctx.fillRect(0, 0, width, height);

    const CONNECT_DIST = isSmall() ? 110 : 220;
    const COLOR = { r: 12, g: 140, b: 190 };

    // move nodes
    for (const n of nodes) {
      const nx = Math.sin((n.x * 0.0012) + now * 0.00013 + n.phase) * 0.08;
      const ny = Math.cos((n.y * 0.0011) + now * 0.00011 + n.phase) * 0.08;
      n.vx += nx * 0.02;
      n.vy += ny * 0.02;
      n.vx *= 0.994;
      n.vy *= 0.994;
      n.x += n.vx * (n.baseSpeed * 8);
      n.y += n.vy * (n.baseSpeed * 8);

      // wrap edges
      if (n.x < -30) n.x = width + 30;
      if (n.x > width + 30) n.x = -30;
      if (n.y < -30) n.y = height + 30;
      if (n.y > height + 30) n.y = -30;

      n.phase += 0.003;
    }

    // lines
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > CONNECT_DIST) continue;
        const alpha = 0.09 * (1 - d / CONNECT_DIST);
        ctx.strokeStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // dots
    for (const n of nodes) {
      // halo
      ctx.beginPath();
      ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${0.08 * n.r})`;
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, 1)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawFrame);
  }

  // initial setup
  resize();
  initNodes();
  requestAnimationFrame(drawFrame);

  // handle resize
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      resize();
      initNodes();
    }, 120);
  }, { passive: true });

})();
