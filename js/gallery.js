(() => {
  'use strict';

  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const viewport = gallery.querySelector('[data-gallery-viewport]');
  const slides = [...gallery.querySelectorAll('[data-gallery-slide]')];
  const previous = gallery.querySelector('[data-gallery-prev]');
  const next = gallery.querySelector('[data-gallery-next]');
  const current = gallery.querySelector('[data-gallery-current]');
  const total = gallery.querySelector('[data-gallery-total]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;

  if (!viewport || !slides.length) return;
  if (total) total.textContent = String(slides.length);

  const update = (nextIndex) => {
    index = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (current) current.textContent = String(index + 1);
    previous?.toggleAttribute('disabled', index === 0);
    next?.toggleAttribute('disabled', index === slides.length - 1);
  };

  const show = (nextIndex) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, nextIndex));
    slides[bounded].scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start'
    });
    update(bounded);
  };

  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) update(slides.indexOf(visible.target));
    }, { root: viewport, threshold: [0.6, 0.9] });
    slides.forEach((slide) => observer.observe(slide));
  }

  update(0);
})();
