/* The only scroll-driven animation on the site. */
(() => {
  'use strict';

  const el = document.querySelector('[data-statement]');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const source = el.textContent.trim();
  const spoken = document.createElement('span');
  const visual = document.createElement('span');
  const chars = [];

  spoken.className = 'visually-hidden';
  spoken.textContent = source;
  visual.className = 'statement__visual';
  visual.setAttribute('aria-hidden', 'true');

  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(document.documentElement.lang || 'en', { granularity: 'grapheme' })
    : null;
  const graphemes = (value) => segmenter
    ? [...segmenter.segment(value)].map((part) => part.segment)
    : Array.from(value);

  for (const token of source.match(/\s+|\S+/gu) || []) {
    if (/^\s+$/u.test(token)) {
      visual.appendChild(document.createTextNode(token));
      continue;
    }

    const word = document.createElement('span');
    word.className = 'statement__word';
    for (const grapheme of graphemes(token)) {
      const char = document.createElement('span');
      char.className = 'statement__char';
      char.textContent = grapheme;
      word.appendChild(char);
      chars.push(char);
    }
    visual.appendChild(word);
  }

  el.replaceChildren(spoken, visual);

  const total = chars.length;
  if (!total) return;

  chars.forEach((char, index) => {
    char.style.setProperty('--i', String(index));
    char.dataset.lit = 'false';
  });
  el.style.setProperty('--n', String(total));

  if (reduced) {
    chars.forEach((char) => {
      char.dataset.lit = 'true';
    });
    return;
  }

  const cssDriven =
    CSS.supports('animation-timeline: view()') &&
    CSS.supports('animation-range: cover 36% cover 64%');
  let rafStarted = false;

  if (cssDriven) {
    document.documentElement.classList.add('statement-css');

    const checkTimeline = () => {
      const section = el.closest('.statement') || el;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const distance = Math.max(1, (rect.height || viewport * 1.8) - viewport);
      const begin = viewport * 0.82;
      const finish = -distance * 0.55;
      const progress = Math.min(1, Math.max(0, (begin - rect.top) / (begin - finish)));
      if (progress < 0.25) return;

      window.removeEventListener('scroll', checkTimeline);
      const first = getComputedStyle(chars[0]).color;
      const last = getComputedStyle(chars[chars.length - 1]).color;
      if (first === last) {
        document.documentElement.classList.remove('statement-css');
        startRaf();
      }
    };

    window.addEventListener('scroll', checkTimeline, { passive: true });
    return;
  }

  startRaf();

  function startRaf() {
    if (rafStarted) return;
    rafStarted = true;

    const section = el.closest('.statement') || el;
    let ticking = false;

    const paint = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const distance = Math.max(1, (rect.height || viewport * 1.8) - viewport);
      /* Begin while the opening line is still rising into view, rather than
         waiting for the section to lock to the top of the screen. A full
         screen of unlit text reads as though the page has stopped. */
      const begin = viewport * 0.82;
      const finish = -distance * 0.55;
      const progress = Math.min(1, Math.max(0, (begin - rect.top) / (begin - finish)));
      const lit = Math.round(progress * total);

      chars.forEach((char, index) => {
        const on = index < lit;
        if ((char.dataset.lit === 'true') !== on) {
          char.dataset.lit = on ? 'true' : 'false';
        }
      });
    };

    const requestPaint = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };

    window.addEventListener('scroll', requestPaint, { passive: true });
    window.addEventListener('resize', requestPaint, { passive: true });
    paint();
  }
})();
