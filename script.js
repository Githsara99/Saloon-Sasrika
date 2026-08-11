document.addEventListener('DOMContentLoaded', () => {

  const TOTAL_GALLERY_IMAGES = 46; // images/image1.jpg … images/image46.jpg

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Build gallery (images/image1.jpg … imageN.jpg) ---------- */
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryUrls = [];

  if (galleryGrid) {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= TOTAL_GALLERY_IMAGES; i++) {
      const src = `images/image${i}.jpg`;
      galleryUrls.push(src);

      const fig = document.createElement('figure');
      fig.className = 'gallery-item reveal';
      fig.style.transitionDelay = `${(i % 12) * 40}ms`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item-btn';
      btn.dataset.index = String(i - 1);
      btn.setAttribute('aria-label', `View photo ${i} larger`);

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Sashrika bridal styling — photo ${i}`;
      img.loading = i <= 8 ? 'eager' : 'lazy';
      // Hide broken thumbnails gracefully (in case fewer files exist yet)
      img.addEventListener('error', () => { fig.style.display = 'none'; }, { once: true });

      btn.appendChild(img);
      fig.appendChild(btn);
      frag.appendChild(fig);
    }
    galleryGrid.appendChild(frag);
  }

  /* ---------- Scroll reveal (covers gallery items too) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Animated stat counter ---------- */
  const statNum = document.querySelector('.about-stat-num');
  if (statNum && 'IntersectionObserver' in window) {
    const target = parseInt(statNum.dataset.count, 10) || 0;
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          statNum.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(statNum);
      });
    }, { threshold: 0.5 });
    counterIO.observe(statNum);
  }

  /* ---------- Scrollspy nav highlighting ---------- */
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[data-nav]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Testimonial carousel ---------- */
  const quotes = Array.from(document.querySelectorAll('.quote'));
  const dotsWrap = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('quotePrev');
  const nextBtn = document.getElementById('quoteNext');
  let current = 0;
  let quoteTimer;

  if (quotes.length && dotsWrap) {
    quotes.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show story ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
      quotes[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + quotes.length) % quotes.length;
      quotes[current].classList.add('active');
      dots[current].classList.add('active');
      resetAutoplay();
    }

    function resetAutoplay() {
      clearInterval(quoteTimer);
      quoteTimer = setInterval(() => goTo(current + 1), 6000);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    resetAutoplay();
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    if (!galleryUrls.length) return;
    lbIndex = (lbIndex + galleryUrls.length) % galleryUrls.length;
    lightboxImg.src = galleryUrls[lbIndex];
    lightboxImg.alt = `Sashrika bridal styling — photo ${lbIndex + 1}`;
    lightboxCounter.textContent = `${lbIndex + 1} / ${galleryUrls.length}`;
  }

  if (galleryGrid) {
    galleryGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.gallery-item-btn');
      if (!btn) return;
      openLightbox(parseInt(btn.dataset.index, 10));
    });
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => { lbIndex--; updateLightbox(); });
  if (lightboxNext) lightboxNext.addEventListener('click', () => { lbIndex++; updateLightbox(); });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { lbIndex--; updateLightbox(); }
    if (e.key === 'ArrowRight') { lbIndex++; updateLightbox(); }
  });

  /* ---------- Booking form ---------- */
  const form = document.getElementById('bookingForm');
  const note = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const phonePattern = /^0\d{9}$/;

      if (!name) {
        note.textContent = 'Please tell us your name.';
        note.classList.remove('success');
        form.name.focus();
        return;
      }
      if (!phonePattern.test(phone.replace(/\s+/g, ''))) {
        note.textContent = 'Please enter a valid 10-digit phone number, e.g. 0773734497.';
        note.classList.remove('success');
        form.phone.focus();
        return;
      }

      note.textContent = `Thank you, ${name.split(' ')[0]} — we'll message you on WhatsApp shortly to confirm your trial.`;
      note.classList.add('success');
      form.reset();
    });
  }

});