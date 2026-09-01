/* Progressive enhancement for the focused information views. Each opens in
   place rather than sending the reader to another page, while its trigger
   remains a durable link without JavaScript. */
(() => {
  'use strict';

  const root = document.documentElement;

  const wire = (dialogId, openAttr, closeAttr, titleId) => {
    const dialog = document.querySelector(`#${dialogId}`);
    const trigger = document.querySelector(`[${openAttr}]`);
    const closeButton = dialog?.querySelector(`[${closeAttr}]`);
    const title = dialog?.querySelector(`#${titleId}`);
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
  };

  wire('technical-specifications-dialog', 'data-specs-open', 'data-specs-close', 'technical-specifications-dialog-title');
  wire('charter-dialog', 'data-charter-open', 'data-charter-close', 'charter-dialog-title');
  wire('suites-and-cabins-details-dialog', 'data-cabin-details-open', 'data-cabin-details-close', 'suites-and-cabins-details-dialog-title');
})();
