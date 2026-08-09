document.addEventListener('DOMContentLoaded', () => {

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

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Testimonial carousel ---------- */
  const quotes = Array.from(document.querySelectorAll('.quote'));
  const dotsWrap = document.getElementById('quoteDots');
  const prevBtn = document.getElementById('quotePrev');
  const nextBtn = document.getElementById('quoteNext');
  let current = 0;
  let quoteTimer;

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

  /* ---------- Booking form ---------- */
  const form = document.getElementById('bookingForm');
  const note = document.getElementById('formNote');

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

    note.textContent = `Thank you, ${name.split(' ')[0]} — we'll call you at ${phone} shortly to confirm your trial.`;
    note.classList.add('success');
    form.reset();
  });

});
