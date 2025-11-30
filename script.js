// script.js - preloader, mobile nav toggle, simple accessibility tweaks

document.addEventListener('DOMContentLoaded', function () {
  // Preloader simulated progress
  const preloader = document.getElementById('preloader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const heroImage = document.getElementById('heroImage');

  let start = null;
  const duration = 900 + Math.random() * 700; // ms

  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 2);
    const pct = Math.floor(eased * 100);
    loaderFill.style.width = pct + '%';
    loaderPercent.textContent = pct + '%';

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      finish();
    }
  }

  // If image loads faster, you might want to wait for it
  // but to keep UX consistent we wait for either image load OR timer
  let imgLoaded = false;
  if (heroImage.complete) imgLoaded = true;
  else heroImage.addEventListener('load', () => { imgLoaded = true; });

  window.requestAnimationFrame(step);

  function finish() {
    // small delay for smoother transition
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => preloader.remove(), 500);
    }, 180);
  }

  // Mobile nav toggle
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('navList');

  menuToggle.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    navList.classList.toggle('show');
  });

  // Set year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Close nav when clicking outside on small screens
  document.addEventListener('click', function (e) {
    if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
      navList.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Respect prefers-reduced-motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    loaderFill.style.transition = 'none';
    loaderPercent.textContent = '100%';
    if (preloader) { preloader.remove(); }
  }
});
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
