/* =========================================================================
   CupCoffee — main.js
   Plain, dependency-free JavaScript. Organised into small, labelled
   sections so it's easy to find and edit any single behaviour.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     Footer year
  ----------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------------------------------------------
     Sticky header — adds a solid/blurred background after scrolling
     past a small threshold.
  ----------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const setHeaderState = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  /* -----------------------------------------------------------------
     Mobile navigation
  ----------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const navScrim = document.getElementById('navScrim');

  const openNav = () => {
    mobileNav.dataset.open = 'true';
    navScrim.hidden = false;
    requestAnimationFrame(() => { navScrim.dataset.visible = 'true'; });
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    mobileNav.dataset.open = 'false';
    navScrim.dataset.visible = 'false';
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    setTimeout(() => { navScrim.hidden = true; }, 250);
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  navScrim.addEventListener('click', closeNav);

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
    }
  });

  // Close the mobile nav automatically if the window is resized to desktop width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && navToggle.getAttribute('aria-expanded') === 'true') {
      closeNav();
    }
  });

  /* -----------------------------------------------------------------
     Menu tabs (Coffee / Hot Drinks / Iced Drinks / etc.)
     Follows the standard ARIA "tabs" interaction pattern.
  ----------------------------------------------------------------- */
  const tabs = Array.from(document.querySelectorAll('.menu-tab'));
  const panels = Array.from(document.querySelectorAll('.menu-panel'));

  const activateTab = (tab) => {
    tabs.forEach(t => {
      const isActive = t === tab;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach(panel => {
      const shouldShow = panel.id === tab.dataset.target;
      panel.hidden = !shouldShow;
      panel.classList.toggle('is-active', shouldShow);
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));

    // Keyboard support: left/right arrow keys move between tabs
    tab.addEventListener('keydown', (e) => {
      let newIndex = null;
      if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
      if (newIndex !== null) {
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(tabs[newIndex]);
      }
    });
  });

  /* -----------------------------------------------------------------
     Scroll reveal — fades/slides sections in as they enter the
     viewport. Skipped entirely if the user prefers reduced motion
     (CSS also guards this, this just avoids unnecessary work).
  ----------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // Stagger the hero elements slightly for a more orchestrated entrance
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      el.style.setProperty('--reveal-i', i);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* -----------------------------------------------------------------
     Steam divider — draws itself in once scrolled into view
  ----------------------------------------------------------------- */
  const steamDividers = document.querySelectorAll('.steam-divider');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const steamObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          steamObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    steamDividers.forEach(el => steamObserver.observe(el));
  } else {
    steamDividers.forEach(el => el.classList.add('is-drawn'));
  }

  /* -----------------------------------------------------------------
     Gallery lightbox
  ----------------------------------------------------------------- */
  const galleryItems = Array.from(document.querySelectorAll('.masonry-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentIndex = 0;
  let lastFocused = null;

  const showImage = (index) => {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const img = galleryItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  };

  const openLightbox = (index) => {
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showImage(currentIndex - 1));
  lightboxNext.addEventListener('click', () => showImage(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  });

});
