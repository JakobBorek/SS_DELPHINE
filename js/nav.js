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
