/* Progressive enhancement for the technical specification focus view. */
(() => {
  'use strict';

  const root = document.documentElement;
  const dialog = document.querySelector('#technical-specifications-dialog');
  const trigger = document.querySelector('[data-specs-open]');
  const closeButton = dialog?.querySelector('[data-specs-close]');
  const title = dialog?.querySelector('#technical-specifications-dialog-title');

  if (!dialog || !trigger || !closeButton || typeof dialog.showModal !== 'function') return;

  let opener = null;
  let previousOverflow = '';

  trigger.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      dialog.open
    ) return;

    event.preventDefault();
    opener = trigger;
    previousOverflow = root.style.overflow;
    dialog.showModal();
    root.style.overflow = 'hidden';
    requestAnimationFrame(() => title?.focus({ preventScroll: true }));
  });

  closeButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    root.style.overflow = previousOverflow;
    if (opener?.isConnected) opener.focus();
    opener = null;
    previousOverflow = '';
  });
})();
