document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/* Does the reader navigate by keyboard? css/base.css only paints the focus ring
   while this flag is set, so the ring follows Tab rather than following the
   focus the page moves for you after a menu jump or a dialog open. */
(() => {
  const root = document.documentElement;
  const navigationKeys = new Set([
    'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '
  ]);
  window.addEventListener('keydown', (event) => {
    if (navigationKeys.has(event.key)) root.dataset.keyboard = '';
  }, { capture: true });
  ['pointerdown', 'mousedown', 'touchstart'].forEach((type) => {
    window.addEventListener(type, () => { delete root.dataset.keyboard; }, { capture: true, passive: true });
  });
})();
