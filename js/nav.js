/* Site shell: one native modal navigation surface and header state. */
(() => {
  'use strict';

  const root = document.documentElement;
  const dialog = document.querySelector('#site-menu');
  const toggle = document.querySelector('.nav-toggle');
  const closeButton = dialog?.querySelector('[data-menu-close]');
  let restoreFocus = true;

  const syncClosedState = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
    if (restoreFocus) toggle?.focus();
    restoreFocus = true;
  };

  const openMenu = () => {
    if (!dialog || !toggle || dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    toggle.setAttribute('aria-expanded', 'true');
    root.style.overflow = 'hidden';
    closeButton?.focus();
  };

  const closeMenu = (shouldRestoreFocus = true) => {
    if (!dialog || !dialog.open) return;
    restoreFocus = shouldRestoreFocus;
    if (typeof dialog.close === 'function') dialog.close();
    else {
      dialog.removeAttribute('open');
      syncClosedState();
    }
  };

  toggle?.addEventListener('click', openMenu);
  closeButton?.addEventListener('click', () => closeMenu());
  dialog?.addEventListener('close', syncClosedState);
  dialog?.addEventListener('cancel', () => {
    restoreFocus = true;
    toggle?.setAttribute('aria-expanded', 'false');
    root.style.overflow = '';
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

      closeMenu(false);
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
