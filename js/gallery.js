/* ============================================================
   SS DELPHINE — GALLERY
   Chapters first, photographs second.

   The archive opens as five chapters. Choosing one reveals only
   that chapter's photographs, so the reader is never met with
   thirty three images at once. The lightbox is scoped to the
   open chapter, so the arrows move within it rather than
   wandering across the whole archive.
   ============================================================ */
(() => {
  'use strict';

  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const chapters = gallery.querySelector('[data-gallery-chapters]');
  const sets = [...gallery.querySelectorAll('[data-gallery-set]')];
  const status = gallery.querySelector('[data-gallery-status]');

  const dialog = document.querySelector('[data-gallery-lightbox]');
  const figure = dialog?.querySelector('[data-lightbox-figure]');
  const titleEl = dialog?.querySelector('[data-lightbox-title]');
  const categoryEl = dialog?.querySelector('[data-lightbox-category]');
  const positionEl = dialog?.querySelector('[data-lightbox-position]');
  const closeButton = dialog?.querySelector('[data-lightbox-close]');
  const previousButton = dialog?.querySelector('[data-lightbox-previous]');
  const nextButton = dialog?.querySelector('[data-lightbox-next]');

  /* The photographs of the chapter currently on screen. The
     lightbox never sees anything outside this list. */
  let scope = [];
  let index = 0;

  /* ---------- Chapters ---------- */
  const showChapters = () => {
    sets.forEach((set) => { set.hidden = true; });
    if (chapters) chapters.hidden = false;
    scope = [];
    if (status) status.textContent = 'Showing all chapters.';
  };

  const openChapter = (name) => {
    const set = sets.find((s) => s.dataset.gallerySet === name);
    if (!set) return;
    if (chapters) chapters.hidden = true;
    sets.forEach((s) => { s.hidden = s !== set; });
    scope = [...set.querySelectorAll('[data-gallery-item]')];
    const label = set.querySelector('.gallery-set__title')?.textContent.trim() || name;
    if (status) status.textContent = `${label}: ${scope.length} photographs.`;
    set.querySelector('[data-gallery-back]')?.focus();
  };

  gallery.querySelectorAll('[data-gallery-open]').forEach((button) => {
    button.addEventListener('click', () => openChapter(button.dataset.galleryOpen));
  });

  gallery.querySelectorAll('[data-gallery-back]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = button.closest('[data-gallery-set]')?.dataset.gallerySet;
      showChapters();
      const opener = gallery.querySelector(`[data-gallery-open="${current}"]`);
      opener?.focus();
    });
  });

  /* ---------- Lightbox ---------- */
  const render = () => {
    const item = scope[index];
    if (!item || !figure) return;
    const source = item.querySelector('picture')?.cloneNode(true);
    figure.replaceChildren();
    if (source) {
      // The grid row sizes the image; see .gallery-lightbox__figure.
      source.querySelectorAll('img').forEach((img) => {
        img.removeAttribute('loading');
        img.removeAttribute('sizes');
        img.removeAttribute('srcset');
        img.src = item.getAttribute('href');
      });
      figure.appendChild(source);
    }
    if (titleEl) titleEl.textContent = item.dataset.title || '';
    if (categoryEl) categoryEl.textContent = (item.dataset.categoryLabel || '').replace('&amp;', '&');
    if (positionEl) positionEl.textContent = `${index + 1} of ${scope.length}`;
  };

  const step = (delta) => {
    if (!scope.length) return;
    index = (index + delta + scope.length) % scope.length;
    render();
  };

  const open = (item) => {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    index = scope.indexOf(item);
    if (index < 0) return false;
    render();
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    closeButton?.focus();
    return true;
  };

  gallery.querySelectorAll('[data-gallery-item]').forEach((item) => {
    item.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      if (open(item)) event.preventDefault();
    });
  });

  closeButton?.addEventListener('click', () => dialog?.close());
  previousButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  });

  dialog?.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    scope[index]?.focus();
  });

  showChapters();
})();

/* ---------- Cabins carousel ----------
   One room at a time, scroll-snapped, with the position announced. */
(() => {
  const carousel = document.querySelector('[data-cabin-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('[data-cabin-track]');
  const slides = [...carousel.querySelectorAll('[data-cabin-slide]')];
  const position = carousel.querySelector('[data-cabin-position]');
  if (!track || !slides.length) return;

  let at = 0;
  const go = (n) => {
    at = Math.min(slides.length - 1, Math.max(0, n));
    track.scrollTo({ left: slides[at].offsetLeft - track.offsetLeft, behavior: 'smooth' });
    if (position) position.textContent = String(at + 1);
  };

  carousel.querySelector('[data-cabin-prev]')?.addEventListener('click', () => go(at - 1));
  carousel.querySelector('[data-cabin-next]')?.addEventListener('click', () => go(at + 1));

  // Keep the counter honest when the reader swipes instead of using the buttons.
  let raf = 0;
  track.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      const i = slides.findIndex((s) => s.offsetLeft - track.offsetLeft + s.clientWidth > mid);
      if (i >= 0 && i !== at) { at = i; if (position) position.textContent = String(at + 1); }
    });
  }, { passive: true });
})();
