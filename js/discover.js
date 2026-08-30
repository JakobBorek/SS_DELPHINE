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
