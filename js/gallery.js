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
  let keptScroll = 0;
  let lastOpener = null;

  /* ---------- Chapters ---------- */
  const showChapters = () => {
    /* With JavaScript the sets are never shown; they hold the photographs
       and serve as the no-JS fallback. */
    sets.forEach((set) => { set.hidden = true; });
    if (chapters) chapters.hidden = false;
    if (status) status.textContent = 'Five chapters.';
  };

  const carouselFor = (set) => {
    const track = set.querySelector('[data-gallery-track]');
    const slides = [...set.querySelectorAll('.gallery-slide')];
    const pos = set.querySelector('[data-gallery-pos]');
    if (!track || !slides.length) return;
    let at = 0;
    const go = (n) => {
      at = Math.min(slides.length - 1, Math.max(0, n));
      track.scrollTo({ left: slides[at].offsetLeft - track.offsetLeft, behavior: 'smooth' });
      if (pos) pos.textContent = String(at + 1);
    };
    set.querySelector('[data-gallery-prev]')?.addEventListener('click', () => go(at - 1));
    set.querySelector('[data-gallery-next]')?.addEventListener('click', () => go(at + 1));
    let raf = 0;
    track.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const mid = track.scrollLeft + track.clientWidth / 2;
        const i = slides.findIndex((sl) => sl.offsetLeft - track.offsetLeft + sl.clientWidth > mid);
        if (i >= 0 && i !== at) { at = i; if (pos) pos.textContent = String(at + 1); }
      });
    }, { passive: true });
  };
  sets.forEach(carouselFor);

  /* Choosing a chapter goes straight to the photographs. There is no
     intermediate page: the reader clicks a chapter and the carousel opens
     on its first photograph, on phone and on desktop alike. */
  const openChapter = (name) => {
    const set = sets.find((el) => el.dataset.gallerySet === name);
    if (!set) return;
    scope = [...set.querySelectorAll('[data-gallery-item]')];
    if (!scope.length) return;
    const label = set.querySelector('.gallery-set__title')?.textContent.trim() || name;
    if (status) status.textContent = `${label}: ${scope.length} photographs.`;
    lastOpener = gallery.querySelector(`[data-gallery-open="${name}"]`);
    open(scope[0]);
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
  /* One image element for the life of the modal. Replacing the whole
     figure on every step emptied it first, which is what produced the
     flash between photographs. */
  let plate = null;
  const ensurePlate = () => {
    if (plate || !figure) return plate;
    plate = document.createElement('img');
    plate.alt = '';
    plate.decoding = 'async';
    return plate;
  };

  /* A slide carrying data-gallery-video plays footage instead of a still. The
     element is built here rather than in the markup so a slide whose file has
     not landed yet simply shows its poster, which is the still the slide used
     before. Nothing 404s into an empty frame. */
  let reel = null;
  const ensureReel = () => {
    if (reel || !figure) return reel;
    reel = document.createElement('video');
    reel.muted = true;
    reel.defaultMuted = true;
    reel.playsInline = true;
    reel.loop = true;
    reel.autoplay = true;
    ['muted', 'loop', 'autoplay', 'playsinline'].forEach((a) => reel.setAttribute(a, ''));
    reel.setAttribute('preload', 'metadata');
    return reel;
  };

  const sourceFor = (item) => item?.getAttribute('href') || '';

  /* Warm the neighbours so a step shows an image already in cache. */
  const preload = () => {
    if (scope.length < 2) return;
    [index + 1, index - 1].forEach((n) => {
      const neighbour = scope[(n + scope.length) % scope.length];
      const url = sourceFor(neighbour);
      if (url) { const img = new window.Image(); img.src = url; }
    });
  };

  /* Footage left running behind a closed modal keeps decoding. */
  const stopReel = () => { if (reel) reel.pause(); };

  const render = () => {
    const item = scope[index];
    if (!item || !figure) return;
    const url = sourceFor(item);
    const footage = item.dataset.galleryVideo || '';

    if (footage) {
      const video = ensureReel();
      if (video) {
        if (video.getAttribute('poster') !== url) video.setAttribute('poster', url);
        if (video.getAttribute('src') !== footage) video.setAttribute('src', footage);
        if (video.parentNode !== figure) figure.replaceChildren(video);
        const started = video.play();
        if (started && typeof started.catch === 'function') started.catch(() => { /* poster stands in */ });
      }
    } else {
      if (reel) reel.pause();
      const img = ensurePlate();
      if (img) {
        if (img.getAttribute('src') !== url) img.src = url;
        img.alt = item.querySelector('img')?.alt || '';
        if (img.parentNode !== figure) figure.replaceChildren(img);
      }
    }

    if (titleEl) titleEl.textContent = item.dataset.title || '';
    if (categoryEl) categoryEl.textContent = (item.dataset.categoryLabel || '').replace('&amp;', '&');
    if (positionEl) positionEl.textContent = `${index + 1} of ${scope.length}`;
    preload();
  };

  const step = (delta) => {
    if (!scope.length) return;
    index = (index + delta + scope.length) % scope.length;
    render();
  };

  const open = (item) => {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    index = scope.indexOf(item);
    if (index < 0) {
      /* Fall back to the item's own chapter rather than letting the browser
         navigate to the raw image file. */
      const set = item.closest('[data-gallery-set]');
      if (set) scope = [...set.querySelectorAll('[data-gallery-item]')];
      index = scope.indexOf(item);
    }
    if (index < 0) return false;
    render();
    keptScroll = window.scrollY;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    closeButton?.focus({ preventScroll: true });
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
    stopReel();
    document.documentElement.style.overflow = '';
    /* return the reader exactly where they were, not to the top or the foot */
    (lastOpener || scope[index])?.focus({ preventScroll: true });
    if (typeof window.scrollTo === 'function') {
      try { window.scrollTo({ top: keptScroll, behavior: 'instant' }); } catch { /* not implemented */ }
    }
  });

  /* A stale scroll lock is what makes the page feel frozen after navigating
     away with a dialog open, so clear it on every arrival. */
  window.addEventListener('pageshow', () => { document.documentElement.style.overflow = ''; });
  window.addEventListener('hashchange', () => { document.documentElement.style.overflow = ''; });

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
