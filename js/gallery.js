(() => {
  'use strict';

  const root = document.documentElement;
  const gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  const items = [...gallery.querySelectorAll('[data-gallery-item]')];
  const filters = [...gallery.querySelectorAll('[data-gallery-filter]')];
  const status = gallery.querySelector('[data-gallery-status]');
  const dialog = document.querySelector('[data-gallery-lightbox]');
  const closeButton = dialog?.querySelector('[data-gallery-lightbox-close]');
  const previousButton = dialog?.querySelector('[data-gallery-lightbox-prev]');
  const nextButton = dialog?.querySelector('[data-gallery-lightbox-next]');
  const source = dialog?.querySelector('[data-gallery-lightbox-source]');
  const image = dialog?.querySelector('[data-gallery-lightbox-image]');
  const title = dialog?.querySelector('[data-gallery-lightbox-title]');
  const category = dialog?.querySelector('[data-gallery-lightbox-category]');
  const current = dialog?.querySelector('[data-gallery-lightbox-current]');
  const total = dialog?.querySelector('[data-gallery-lightbox-total]');
  let activeFilter = 'all';
  let activeIndex = 0;
  let restoreTarget = null;
  let previousOverflow = '';

  const visibleItems = () => items.filter((item) => !item.hidden);

  const updateStatus = () => {
    const count = visibleItems().length;
    if (status) status.textContent = `${count} photograph${count === 1 ? '' : 's'}`;
  };

  const applyFilter = (nextFilter) => {
    activeFilter = nextFilter;
    filters.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === activeFilter));
    });
    items.forEach((item) => {
      item.hidden = activeFilter !== 'all' && item.dataset.category !== activeFilter;
    });
    updateStatus();
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.galleryFilter || 'all'));
  });

  const renderLightbox = () => {
    const visible = visibleItems();
    if (!visible.length || !image || !source || !title || !category) return;

    activeIndex = (activeIndex + visible.length) % visible.length;
    const item = visible[activeIndex];
    const thumb = item.querySelector('img');
    const webp = item.href;
    const avif = webp.replace(/\.webp$/u, '.avif');

    source.srcset = avif;
    image.src = webp;
    image.alt = thumb?.alt || '';
    image.width = Number(thumb?.getAttribute('width')) || 1600;
    image.height = Number(thumb?.getAttribute('height')) || 1067;
    title.textContent = item.dataset.title || '';
    category.textContent = item.dataset.categoryLabel || '';
    if (current) current.textContent = String(activeIndex + 1);
    if (total) total.textContent = String(visible.length);
  };

  const openLightbox = (item) => {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    const visible = visibleItems();
    activeIndex = visible.indexOf(item);
    if (activeIndex < 0) return false;

    restoreTarget = item;
    previousOverflow = root.style.overflow;
    renderLightbox();
    dialog.showModal();
    root.style.overflow = 'hidden';
    title?.focus();
    return true;
  };

  const closeLightbox = () => {
    if (dialog?.open) dialog.close();
  };

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;
      if (openLightbox(item)) event.preventDefault();
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  previousButton?.addEventListener('click', () => {
    activeIndex -= 1;
    renderLightbox();
  });
  nextButton?.addEventListener('click', () => {
    activeIndex += 1;
    renderLightbox();
  });

  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeLightbox();
  });
  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      activeIndex -= 1;
      renderLightbox();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      activeIndex += 1;
      renderLightbox();
    }
  });
  dialog?.addEventListener('close', () => {
    root.style.overflow = previousOverflow;
    restoreTarget?.focus();
    restoreTarget = null;
  });

  applyFilter('all');
})();
