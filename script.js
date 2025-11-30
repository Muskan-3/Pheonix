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

