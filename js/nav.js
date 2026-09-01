/* Site shell: a native modal drawer with one continuous Menu-to-Close mark. */
(() => {
  'use strict';

  const root = document.documentElement;
  const dialog = document.querySelector('#site-menu');
  const toggle = document.querySelector('.nav-toggle');
  const closeButton = dialog?.querySelector('[data-menu-close]');
  const shell = dialog?.querySelector('.site-menu__shell');
  let restoreFocus = true;
  let closing = false;
  let closeFallback = 0;

  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const afterPaint = (callback) => {
    requestAnimationFrame(() => requestAnimationFrame(callback));
  };

  const syncClosedState = () => {
    window.clearTimeout(closeFallback);
    toggle?.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
    if (dialog) dialog.dataset.state = 'closed';
    closing = false;
    if (restoreFocus) toggle?.focus();
    restoreFocus = true;
  };

  const openMenu = () => {
    if (!dialog || !toggle || dialog.open) return;

    dialog.dataset.state = 'opening';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    toggle.setAttribute('aria-expanded', 'true');
    root.style.overflow = 'hidden';
    closeButton?.focus();

    if (reducedMotion()) {
      dialog.dataset.state = 'open';
      return;
    }

    afterPaint(() => {
      if (dialog.open && !closing) dialog.dataset.state = 'open';
    });
  };

  const closeMenu = (shouldRestoreFocus = true, afterClose) => {
    if (!dialog || !dialog.open || closing) return;
    restoreFocus = shouldRestoreFocus;
    let onTransitionEnd;

    const finishClose = () => {
      if (!dialog.open) return;
      window.clearTimeout(closeFallback);
      if (onTransitionEnd) shell?.removeEventListener('transitionend', onTransitionEnd);
      if (typeof dialog.close === 'function') dialog.close();
      else {
        dialog.removeAttribute('open');
        syncClosedState();
      }
      afterClose?.();
    };

    if (
      dialog.dataset.state !== 'open' ||
      reducedMotion() ||
      typeof shell?.getAnimations !== 'function'
    ) {
      finishClose();
      return;
    }

    closing = true;
    onTransitionEnd = (event) => {
      if (event.target !== shell || event.propertyName !== 'transform') return;
      finishClose();
    };
    shell.addEventListener('transitionend', onTransitionEnd);
    dialog.dataset.state = 'closing';
    closeFallback = window.setTimeout(finishClose, 700);
  };

  toggle?.addEventListener('click', openMenu);
  closeButton?.addEventListener('click', () => closeMenu());
  dialog?.addEventListener('close', syncClosedState);
  dialog?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeMenu();
  });
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeMenu();
  });

  const normalisePath = (pathname) => pathname.replace(/\/index\.html$/u, '/');

  const focusDestination = (destination) => {
    if (!destination) return;
    destination.scrollIntoView?.({ block: 'start' });
    const labelledBy = destination.getAttribute('aria-labelledby');
    const focusTarget = labelledBy
      ? document.getElementById(labelledBy) || destination
      : destination;
    const temporaryTabindex = !focusTarget.hasAttribute('tabindex');

    if (temporaryTabindex) {
      focusTarget.setAttribute('tabindex', '-1');
      focusTarget.addEventListener('blur', () => {
        focusTarget.removeAttribute('tabindex');
      }, { once: true });
    }

    focusTarget.focus({ preventScroll: true });
  };

  dialog?.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.hasAttribute('download') ||
        link.target === '_blank'
      ) return;

      const destinationUrl = new window.URL(link.href, window.location.href);
      if (destinationUrl.origin !== window.location.origin) return;

      event.preventDefault();
      const sameDocument =
        normalisePath(destinationUrl.pathname) === normalisePath(window.location.pathname);
      const destination = sameDocument && destinationUrl.hash
        ? document.getElementById(destinationUrl.hash.slice(1))
        : null;

      closeMenu(false, () => {
        if (destination) {
          if (window.location.hash !== destinationUrl.hash) {
            window.history.pushState(null, '', destinationUrl.hash);
          }
          requestAnimationFrame(() => focusDestination(destination));
          return;
        }
        window.location.assign(destinationUrl.href);
      });
    });
  });

  /* Clear any scroll lock left behind by a dialog when the reader arrives
     on a new page; otherwise the menu appears open but nothing responds. */
  window.addEventListener('pageshow', () => {
    root.style.overflow = '';
    if (dialog?.open) dialog.close();
    toggle?.setAttribute('aria-expanded', 'false');
  });

  /* ---------- Menu groups ----------
     About and Onboard open in place. Only one is open at a time, so the
     list never grows past the screen. */
  const disclosures = [...document.querySelectorAll('.site-menu__disclosure')];
  disclosures.forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      disclosures.forEach((other) => {
        const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
        other.setAttribute('aria-expanded', 'false');
        if (otherPanel) otherPanel.hidden = true;
      });
      if (!open) {
        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  const header = document.querySelector('[data-site-header]');
  const hero = document.querySelector('.hero');

  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      header.dataset.scrolled = String(!entry.isIntersecting);
    }, { rootMargin: '-70% 0px 0px 0px' }).observe(hero);
  } else if (header && !hero) {
    header.dataset.scrolled = 'true';
  }
})();

/* ---------- Hero motion ----------
   Browsers get the normal muted, inline video path. WebKit can select the same
   silent MP4 inside the fallback <picture>, where it behaves as a looping image
   and is not dependent on video autoplay permission. No path waits for input. */
(() => {
  const video = document.querySelector('[data-hero-video]');
  if (!video) return;

  video.muted = true;               // property, not just the attribute
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');

  const stage = video.closest('.hero') || video.parentElement;
  const imageFallback = stage?.querySelector('[data-hero-motion-fallback]');
  let imageMotion = false;
  let playPending = false;

  /* Safari 11.1+ treats an MP4 selected for <img> as an automatically looping
     image. If it chose that source, leave the image layer visible and stop the
     redundant video decoder. Other engines report the WebP poster here. */
  const useImageMotion = () => {
    const source = imageFallback?.currentSrc || '';
    if (!/\.mp4(?:[?#]|$)/iu.test(source)) return;

    imageMotion = true;
    if (stage) {
      stage.dataset.imageMotion = 'true';
      delete stage.dataset.playing;
    }
    video.pause();
  };

  imageFallback?.addEventListener('load', useImageMotion);
  if (imageFallback?.complete) useImageMotion();

  /* The poster layer is removed only once normal video playback is real. */
  video.addEventListener('playing', () => {
    if (stage && !imageMotion) stage.dataset.playing = 'true';
  });
  video.addEventListener('pause', () => {
    playPending = false;
    if (stage) delete stage.dataset.playing;
  });
  video.addEventListener('emptied', () => {
    playPending = false;
    if (stage) delete stage.dataset.playing;
  });

  const attempt = () => {
    if (imageMotion || playPending || (!video.paused && !video.ended)) return;

    playPending = true;
    let p;
    try {
      p = video.play();
    } catch {
      playPending = false;
      return;
    }

    if (p && typeof p.then === 'function') {
      p.then(() => { playPending = false; }).catch(() => { playPending = false; });
    } else {
      playPending = false;
    }
  };

  ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'suspend'].forEach(
    (e) => video.addEventListener(e, attempt)
  );

  /* If the element never got as far as picking a source, ask again. */
  if (video.readyState === 0) {
    try { video.load(); } catch { /* nothing to reload */ }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) attempt(); });
  window.addEventListener('pageshow', attempt);

  attempt();
})();
