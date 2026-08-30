(() => {
  'use strict';

  const body = document.body;
  const chapterIds = new Set(
    [...document.querySelectorAll('.discover-panel[id]')].map((panel) => panel.id)
  );

  const syncChapterView = () => {
    const chapter = window.location.hash.slice(1);
    if (chapterIds.has(chapter)) body.dataset.chapterView = chapter;
    else delete body.dataset.chapterView;
  };

  window.addEventListener('hashchange', syncChapterView);
  syncChapterView();
})();

/* Back control: return to where the reader came from. If they arrived from
   another page on this site, step back to it; otherwise fall through to the
   href, which is the homepage. */
document.querySelectorAll('[data-panel-back]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    let sameSite = false;
    try {
      sameSite = Boolean(document.referrer) &&
        new window.URL(document.referrer).origin === window.location.origin;
    } catch { sameSite = false; }
    if (sameSite && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
});
