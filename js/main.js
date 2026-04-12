/* ============================================
   MAIN.JS – Ciro Esposito Macchine Utensili
   ============================================ */

// ── PREVENT HORIZONTAL SCROLL (iOS Safari fix) ───────────────
window.addEventListener('scroll', () => {
  if (window.scrollX !== 0) {
    window.scrollTo(0, window.scrollY);
  }
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {

  // ── HEADER SCROLL EFFECT ──────────────────────────────────────
  const header = document.getElementById('header');

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // ── MOBILE HAMBURGER MENU ─────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu when a nav link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
    }
  });

  // ── SCROLL-TO-SECTION (active nav highlight) ──────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#nav a[href^="#"]');

  // Attiva il link nav in base alla sezione più vicina al centro dello schermo
  const updateActiveNav = () => {
    const scrollY = window.scrollY + window.innerHeight * 0.35;
    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active-nav');
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ── AOS (Animate On Scroll) – lightweight inline ──────────────
  const aosElements = document.querySelectorAll('[data-aos]');

  const aosObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          aosObserver.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  aosElements.forEach(el => aosObserver.observe(el));

  // ── COUNTER ANIMATION (hero stats) ───────────────────────────
  const counters = document.querySelectorAll('.stat-number');

  const countUp = (el) => {
    const target = parseInt(el.textContent.replace(/\D/g, ''), 10);
    const suffix = el.textContent.replace(/[\d]/g, '');
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + suffix;
    }, 30);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counters.forEach(countUp);
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ── CONTACT FORM → Google Sheets ─────────────────────────────
  // SOSTITUIRE con l'URL del tuo Google Apps Script (vedi istruzioni)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ6huFWFbYq9nUPLyxzSZYXkozrHQngjAK8GIYAwmszecbmUDMxMRPftfy-QhPUFch/exec';

  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach(field => {
        field.style.borderColor = '';
        if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
          field.style.borderColor = '#ef4444';
          valid = false;
        }
      });

      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Invio in corso...';

      const data = {
        nome:       form.nome.value.trim(),
        azienda:    form.azienda.value.trim(),
        telefono:   form.telefono.value.trim(),
        email:      form.email.value.trim(),
        interesse:  form.interesse.value,
        messaggio:  form.messaggio.value.trim(),
        data:       new Date().toLocaleString('it-IT')
      };

      // Se l'URL non è ancora configurato, mostra comunque successo (modalità bozza)
      if (APPS_SCRIPT_URL === 'INSERIRE_URL_APPS_SCRIPT_QUI') {
        setTimeout(() => {
          form.reset();
          btn.style.display = 'none';
          formSuccess.style.display = 'flex';
        }, 1000);
        return;
      }

      // POST al Google Apps Script
      // Usiamo text/plain per evitare il preflight CORS (limitazione Google)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      })
      .then(() => {
        form.reset();
        btn.style.display = 'none';
        formSuccess.style.display = 'flex';
      })
      .catch(() => {
        // Anche in caso di errore di rete, il dato spesso viene ricevuto
        form.reset();
        btn.style.display = 'none';
        formSuccess.style.display = 'flex';
      });
    });

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => { field.style.borderColor = ''; });
    });
  }

  // ── SMOOTH SCROLL for anchor links ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h').trim(), 10) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── PRODUCT CARDS stagger animation ──────────────────────────
  const productCards = document.querySelectorAll('.product-card');

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, i * 80);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  productCards.forEach(card => {
    if (!card.hasAttribute('data-aos')) {
      card.setAttribute('data-aos', '');
      cardObserver.observe(card);
    }
  });

  // ── WHY CARDS stagger animation ───────────────────────────────
  const whyCards = document.querySelectorAll('.why-card');

  const whyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, i * 100);
          whyObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  whyCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    whyObserver.observe(card);
  });

  // ── SECTION TITLE underline animation ────────────────────────
  const titleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('title-animated');
          titleObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.section-title').forEach(el => titleObserver.observe(el));

  // ── HEADER active state ───────────────────────────────────────
  // inject active-nav CSS rule
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    #nav a.active-nav {
      color: var(--color-accent) !important;
      background: var(--color-accent-light) !important;
    }
  `;
  document.head.appendChild(styleSheet);

});
