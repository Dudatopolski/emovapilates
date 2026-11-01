document.addEventListener('DOMContentLoaded', () => {

  /* 1. Header: fica branco ao rolar -------------------------------------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 2. Menu mobile -------------------------------------------------------- */
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  const setNav = (open) => {
    nav.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  /* 3. Rolagem suave com compensação do header fixo ------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: 'smooth' });
    });
  });

  /* 4. Setas dos carrosséis (indicações e depoimentos) --------------------- */
  document.querySelectorAll('[data-carousel]').forEach(wrap => {
    const track = wrap.querySelector('.carousel-track');
    const prev = wrap.querySelector('.carousel-btn.prev');
    const next = wrap.querySelector('.carousel-btn.next');
    if (!track) return;
    const step = () => {
      const first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 16 : 300;
    };
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  });

  /* 5. Pontos dos depoimentos ---------------------------------------------- */
  const tTrack = document.getElementById('testimonialTrack');
  const tDots = document.getElementById('testimonialDots');
  if (tTrack && tDots) {
    const cards = Array.from(tTrack.children);
    const dots = cards.map((card, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      b.addEventListener('click', () => {
        tTrack.scrollTo({ left: card.offsetLeft - tTrack.offsetLeft, behavior: 'smooth' });
      });
      tDots.appendChild(b);
      return b;
    });
    const sync = () => {
      const x = tTrack.scrollLeft;
      let best = 0, diff = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - tTrack.offsetLeft - x);
        if (d < diff) { diff = d; best = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === best));
    };
    tTrack.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    sync();
  }

  /* 6. Slider de fotos do espaço (troca sozinho) --------------------------- */
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dotsWrap = slider.querySelector('.slider-dots');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    const INTERVAL = 4500;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0, timer = null;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ver foto ${i + 1}`);
      b.addEventListener('click', () => { goTo(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === current));
      dots.forEach((d, n) => d.classList.toggle('active', n === current));
    }
    function start() { if (!reduceMotion && !timer) timer = setInterval(() => goTo(current + 1), INTERVAL); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    prevBtn.addEventListener('click', () => { goTo(current - 1); restart(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); restart(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    let startX = null;
    slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (startX !== null) {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
      }
      startX = null; start();
    });

    new IntersectionObserver(entries => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.25 }).observe(slider);

    goTo(0);
  });

  /* 7. Revelar blocos ao rolar -------------------------------------------- */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  } else {
    items.forEach(el => el.classList.add('in'));
  }

});