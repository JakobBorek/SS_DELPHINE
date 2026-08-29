/* ============================================================
   SS DELPHINE — TRACK A: THE SCROLL-FILL STATEMENT
   The one animation on this site.

   Words fill left to right, driven by scroll position rather
   than triggered once. Scrolling back up un-fills them.

   Two paths:
     1. CSS scroll-driven animation (view-timeline). Runs off the
        main thread, so it cannot jank. Used where supported.
     2. One rAF-throttled scroll listener for everything else.
        One listener for the whole page.

   prefers-reduced-motion renders the text filled and static and
   neither path runs. With JavaScript off the sentence is already
   in the DOM and CSS shows it filled.
   ============================================================ */
(() => {
  'use strict';

  const el = document.querySelector('[data-statement]');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Split into words, once, not per frame ---------- */
  const source = el.textContent.trim();

  // The last sentence is the payload. It gets its own line.
  const parts = source.match(/[^.]+\./g) || [source];
  const lead = parts.slice(0, -1).join(' ').trim();
  const payload = (parts[parts.length - 1] || '').trim();

  const frag = document.createDocumentFragment();
  const words = [];

  const addWords = (text, host) => {
    text.split(/\s+/).filter(Boolean).forEach((w, i, arr) => {
      const span = document.createElement('span');
      span.className = 'statement__word';
      span.textContent = w;
      host.appendChild(span);
      if (i < arr.length - 1) host.appendChild(document.createTextNode(' '));
      words.push(span);
    });
  };

  addWords(lead, frag);

  if (payload) {
    const line = document.createElement('span');
    line.className = 'statement__line';
    addWords(payload, line);
    frag.appendChild(line);
  }

  el.textContent = '';
  el.appendChild(frag);

  const total = words.length;
  if (!total) return;

  // Per-word index and count for the CSS path's staggered ranges.
  words.forEach((w, i) => w.style.setProperty('--i', String(i)));
  el.style.setProperty('--n', String(total));

  if (reduced) {
    words.forEach((w) => { w.dataset.lit = 'true'; });
    return;
  }

  /* ---------- Path 1: CSS scroll-driven ---------- */
  const cssDriven =
    CSS.supports('animation-timeline: view()') &&
    CSS.supports('animation-range: contain 0% contain 100%');

  /* Path 2 is defined below and can be started on demand. */
  let rafStarted = false;

  if (cssDriven) {
    document.documentElement.classList.add('statement-css');

    /* Watchdog. Declaring support is not the same as the timeline
       actually advancing: a scroll-driven animation can register and
       still sit at progress 0 in some engines and embedded contexts.
       Sample once, after the statement has genuinely been scrolled
       past its start. If nothing has lit, hand over to path 2. */
    const check = () => {
      const sec = el.closest('.statement') || el;
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      // Only judge once the section is well into view.
      if (rect.top > vh * 0.45) return;
      window.removeEventListener('scroll', check);
      /* Mid-section, a working timeline has lit the opening words and
         not the closing ones. If every word still renders identically,
         the timeline is inert. */
      const first = getComputedStyle(words[0]).color;
      const last = getComputedStyle(words[words.length - 1]).color;
      if (first === last) {
        document.documentElement.classList.remove('statement-css');
        startRaf();
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    return;
  }

  startRaf();

  /* ---------- Path 2: one rAF-throttled scroll listener ---------- */
  function startRaf() {
    if (rafStarted) return;
    rafStarted = true;

  const section = el.closest('.statement') || el;
  let ticking = false;

  const paint = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    /* Fill across the span from the section's top reaching ~80% of
       the viewport to it reaching ~25%. That completes the sentence
       comfortably before the section leaves the screen, so a reader
       scrolling at normal speed finishes it. */
    const start = vh * 0.80;
    const end = vh * 0.25;
    const raw = (start - rect.top) / (start - end);
    const progress = Math.min(1, Math.max(0, raw));

    // Slight overshoot so the final word lights before the end.
    const lit = Math.round(progress * (total + 2));
    for (let i = 0; i < total; i++) {
      const on = i < lit;
      if ((words[i].dataset.lit === 'true') !== on) {
        words[i].dataset.lit = on ? 'true' : 'false';
      }
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  paint();
  }
})();
