/* Site shell: one native modal navigation surface and header state. */
(() => {
  'use strict';

  const root = document.documentElement;
  const dialog = document.querySelector('#site-menu');
  const toggle = document.querySelector('.nav-toggle');
  const closeButton = dialog?.querySelector('[data-menu-close]');
  const shell = dialog?.querySelector('.site-menu__shell');
  let restoreFocus = true;
  let closing = false;

  const syncClosedState = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
    dialog?.removeAttribute('data-closing');
    closing = false;
    if (restoreFocus) toggle?.focus();
    restoreFocus = true;
  };

  const openMenu = () => {
    if (!dialog || !toggle || dialog.open) return;
    dialog.removeAttribute('data-closing');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    toggle.setAttribute('aria-expanded', 'true');
    root.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const closeMenu = (shouldRestoreFocus = true, afterClose) => {
    if (!dialog || !dialog.open || closing) return;
    restoreFocus = shouldRestoreFocus;

    const finishClose = () => {
      if (!dialog.open) return;
      if (typeof dialog.close === 'function') dialog.close();
      else {
        dialog.removeAttribute('open');
        syncClosedState();
      }
      afterClose?.();
    };

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof shell?.getAnimations !== 'function') {
      finishClose();
      return;
    }

    closing = true;
    dialog.setAttribute('data-closing', '');
    const animations = shell.getAnimations();
    if (animations.length === 0) {
      finishClose();
      return;
    }
    Promise.allSettled(animations.map((animation) => animation.finished)).then(finishClose);
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

  dialog?.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      const destinationUrl = new window.URL(link.href, window.location.href);
      const sameDocument =
        destinationUrl.origin === window.location.origin &&
        normalisePath(destinationUrl.pathname) === normalisePath(window.location.pathname);
      const destination = sameDocument && destinationUrl.hash
        ? document.getElementById(destinationUrl.hash.slice(1))
        : null;

      closeMenu(false, () => {
        if (!destination) return;
        requestAnimationFrame(() => {
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
        });
      });
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
