import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const homeHtml = await readFile(path.join(root, 'index.html'), 'utf8');
const discoverHtml = await readFile(path.join(root, 'discover.html'), 'utf8');
const scripts = {
  root: await readFile(path.join(root, 'js/root.js'), 'utf8'),
  nav: await readFile(path.join(root, 'js/nav.js'), 'utf8'),
  statement: await readFile(path.join(root, 'js/statement.js'), 'utf8'),
  specs: await readFile(path.join(root, 'js/specs.js'), 'utf8'),
  discover: await readFile(path.join(root, 'js/discover.js'), 'utf8'),
  gallery: await readFile(path.join(root, 'js/gallery.js'), 'utf8')
};
const heroCss = await readFile(path.join(root, 'css/hero.css'), 'utf8');
const layoutCss = await readFile(path.join(root, 'css/layout.css'), 'utf8');
const sectionsCss = await readFile(path.join(root, 'css/sections.css'), 'utf8');

class ObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
}

const createDom = (html = homeHtml, { reduced = false, cssDriven = false, url = 'https://local.test/' } = {}) => {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url });
  const { window } = dom;
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') && reduced,
    media: query,
    addEventListener() {},
    removeEventListener() {}
  });
  window.CSS = { supports: () => cssDriven };
  window.IntersectionObserver = ObserverMock;
  window.requestAnimationFrame = (callback) => callback();
  window.scrollTo = () => {};
  window.HTMLMediaElement.prototype.load = () => {};
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};

  const dialogPrototype = window.HTMLDialogElement.prototype;
  dialogPrototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  dialogPrototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new window.Event('close'));
  };

  return { dom, window };
};

{
  const homeDom = new JSDOM(homeHtml, { url: 'https://local.test/' });
  const discoverDom = new JSDOM(discoverHtml, { url: 'https://local.test/discover.html' });
  const home = homeDom.window.document;
  const discover = discoverDom.window.document;

  assert.match(home.querySelector('[data-statement]').textContent, /Built in 1921/, 'statement must exist without JavaScript');
  assert.equal(home.querySelectorAll('.statement__char').length, 0, 'raw no-JS statement must not depend on generated spans');
  assert.equal(home.querySelector('[data-specs-open]')?.getAttribute('href'), '/discover.html#technical-specifications', 'specifications must retain a no-JS deep link');
  assert.equal(home.querySelector('#technical-specifications-dialog')?.tagName, 'DIALOG', 'focused specifications must use a native dialog');
  assert.equal(discover.querySelector('#technical-specifications')?.querySelectorAll('.plate__row').length, 13, 'all specifications must remain reachable without JavaScript');
  assert.equal(discover.querySelectorAll('.discover-panel').length, 7, 'all deeper chapters must remain in the document');
  assert.equal(home.querySelectorAll('.nojs-nav a').length, 5, 'homepage no-JS index must expose the focused journey');
  assert.equal(discover.querySelectorAll('.nojs-nav a').length, 5, 'explore no-JS index must expose the focused journey');
  assert.match(heroCss, /html\.no-js \.statement__text,[\s\S]*color:\s*var\(--cream\)/, 'no-JS statement must be fully filled');
  assert.match(layoutCss, /html\.no-js \.nav-toggle,[\s\S]*html\.no-js \.site-menu[\s\S]*display:\s*none/, 'no-JS mode must hide the inert menu controls');
  assert.match(layoutCss, /html\.no-js \.nojs-nav\s*\{[\s\S]*display:\s*block/, 'no-JS mode must expose a normal-flow index');
  assert.match(sectionsCss, /\.discover-panel:target\s*\{\s*display:\s*block/, 'hash navigation must reveal one deep chapter without JavaScript');
  assert.match(sectionsCss, /\.discover-page:has\(\.discover-panel:target\) \.discover-intro/, 'a selected deep chapter must remove the Explore index above it without JavaScript');

  homeDom.window.close();
  discoverDom.window.close();
}

{
  const { dom, window } = createDom();
  window.eval(scripts.specs);
  const document = window.document;
  const trigger = document.querySelector('[data-specs-open]');
  const dialog = document.querySelector('#technical-specifications-dialog');
  const title = document.querySelector('#technical-specifications-dialog-title');
  const close = document.querySelector('[data-specs-close]');

  const openEvent = new window.MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
  assert.equal(trigger.dispatchEvent(openEvent), false, 'plain activation must enhance the deep link into the focused view');
  assert.equal(openEvent.defaultPrevented, true, 'enhanced specifications activation must prevent navigation');
  assert.equal(dialog.open, true, 'technical specifications dialog must open');
  assert.equal(document.activeElement, title, 'technical specifications must announce the focused view heading first');
  assert.equal(document.documentElement.style.overflow, 'hidden', 'technical specifications must lock page scrolling while open');

  close.click();
  assert.equal(dialog.open, false, 'Close must dismiss technical specifications');
  assert.equal(document.activeElement, trigger, 'closing technical specifications must restore trigger focus');
  assert.equal(document.documentElement.style.overflow, '', 'closing technical specifications must release page scrolling');

  const modifiedEvent = new window.MouseEvent('click', { button: 0, ctrlKey: true, bubbles: true, cancelable: true });
  assert.equal(trigger.dispatchEvent(modifiedEvent), true, 'modified activation must preserve the durable deep link');
  assert.equal(modifiedEvent.defaultPrevented, false, 'modified activation must not be intercepted');
  assert.equal(dialog.open, false, 'modified activation must not open the modal');

  trigger.dispatchEvent(new window.MouseEvent('click', { button: 0, bubbles: true, cancelable: true }));
  dialog.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(dialog.open, false, 'clicking the backdrop must dismiss technical specifications');
  assert.equal(document.activeElement, trigger, 'backdrop close must restore trigger focus');

  trigger.dispatchEvent(new window.MouseEvent('click', { button: 0, bubbles: true, cancelable: true }));
  dialog.dispatchEvent(new window.Event('cancel', { cancelable: true }));
  dialog.close();
  assert.equal(document.activeElement, trigger, 'native Escape close path must restore specifications trigger focus');
  dom.window.close();
}

{
  const { dom, window } = createDom();
  window.HTMLDialogElement.prototype.showModal = undefined;
  window.eval(scripts.specs);
  const trigger = window.document.querySelector('[data-specs-open]');
  const fallbackEvent = new window.MouseEvent('click', { button: 0, bubbles: true, cancelable: true });
  assert.equal(trigger.dispatchEvent(fallbackEvent), true, 'unsupported browsers must retain native link navigation');
  assert.equal(fallbackEvent.defaultPrevented, false, 'unsupported browsers must not intercept the deep link');
  dom.window.close();
}

{
  const { dom, window } = createDom();
  window.eval(scripts.root);
  window.eval(scripts.nav);
  const document = window.document;
  const dialog = document.querySelector('#site-menu');
  const toggle = document.querySelector('.nav-toggle');
  const close = document.querySelector('[data-menu-close]');

  assert.ok(document.documentElement.classList.contains('js'), 'enhancement script must mark the document');
  toggle.click();
  assert.equal(dialog.open, true, 'Menu must open the native dialog');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true', 'Menu must expose its expanded state');
  assert.equal(document.documentElement.style.overflow, 'hidden', 'open Menu must lock page scrolling');
  assert.equal(document.activeElement, close, 'open Menu must focus its Close control');

  close.click();
  assert.equal(dialog.open, false, 'Close must dismiss the dialog');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false', 'Close must clear the expanded state');
  assert.equal(document.documentElement.style.overflow, '', 'Close must release page scrolling');
  assert.equal(document.activeElement, toggle, 'Close must restore Menu focus');

  toggle.click();
  assert.equal(dialog.dataset.state, 'open', 'Menu must reach its painted open state');
  const sectionLink = dialog.querySelector('a[href="/#the-yacht"]');
  const destinationHeading = document.querySelector('#the-yacht-title');
  const click = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  assert.equal(sectionLink.dispatchEvent(click), false, 'same-page Menu link must wait for the Menu exit');
  assert.equal(click.defaultPrevented, true, 'same-page Menu link must coordinate navigation with the exit state');
  assert.equal(dialog.open, false, 'same-page Menu link must close the dialog');
  assert.equal(document.activeElement, destinationHeading, 'same-page navigation must focus the destination heading');
  assert.equal(destinationHeading.getAttribute('tabindex'), '-1', 'destination heading must be programmatically focusable');
  destinationHeading.blur();
  assert.equal(destinationHeading.hasAttribute('tabindex'), false, 'temporary heading tabindex must be removed on blur');

  toggle.click();
  const crossPage = dialog.querySelector('a[href="/discover.html#the-refit"]');
  const modifiedClick = new window.MouseEvent('click', { button: 0, ctrlKey: true, bubbles: true, cancelable: true });
  assert.equal(crossPage.dispatchEvent(modifiedClick), true, 'modified cross-page activation must remain native');
  assert.equal(modifiedClick.defaultPrevented, false, 'modified cross-page activation must not be delayed');
  assert.equal(dialog.open, true, 'opening a chapter in another tab must leave the current Menu available');
  close.click();

  toggle.click();
  const cancelEvent = new window.Event('cancel', { cancelable: true });
  assert.equal(dialog.dispatchEvent(cancelEvent), false, 'Escape cancellation must be handled for the menu exit');
  assert.equal(cancelEvent.defaultPrevented, true, 'native Escape close must wait for the menu exit path');
  assert.equal(document.activeElement, toggle, 'native Escape close path must restore Menu focus');

  const shell = dialog.querySelector('.site-menu__shell');
  shell.getAnimations = () => [];
  toggle.click();
  close.click();
  assert.equal(dialog.open, true, 'animated close must keep the modal alive while the drawer exits');
  assert.equal(dialog.dataset.state, 'closing', 'animated close must expose the reversing state');
  const transitionEnd = new window.Event('transitionend');
  Object.defineProperty(transitionEnd, 'propertyName', { value: 'transform' });
  shell.dispatchEvent(transitionEnd);
  assert.equal(dialog.open, false, 'drawer transform completion must finish the native dialog close');

  assert.match(layoutCss, /\.nav-toggle,[\s\S]*min-inline-size:\s*var\(--sp-6\)[\s\S]*min-block-size:\s*var\(--sp-6\)/, 'Menu and Close must use 48px minimum targets');
  assert.match(layoutCss, /\.site-menu__close\s*\{[\s\S]*position:\s*fixed/, 'the Menu-to-Close mark must remain fixed while the drawer moves');
  assert.match(layoutCss, /\.site-menu\[data-state='open'\] \.site-menu__shell\s*\{[\s\S]*translate3d\(0, 0, 0\)/, 'the Menu drawer must enter from the right through an explicit open state');
  assert.match(layoutCss, /\.site-menu\[data-state='open'\] \.site-menu__close-bars > span:first-child[\s\S]*rotate\(45deg\)/, 'the first Menu rule must morph into the X');
  assert.match(layoutCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.site-menu__shell[\s\S]*transition:\s*none/, 'Menu motion must collapse under reduced motion');
  dom.window.close();
}

{
  const { dom, window } = createDom();
  const video = window.document.querySelector('[data-hero-video]');
  const fallback = window.document.querySelector('[data-hero-motion-fallback]');
  const stage = video.closest('.hero');
  let paused = true;
  let playCalls = 0;

  Object.defineProperty(fallback, 'currentSrc', { configurable: true, value: 'https://local.test/media/hero/delphine-hero-poster.webp' });
  Object.defineProperty(fallback, 'complete', { configurable: true, value: true });
  Object.defineProperty(video, 'paused', { configurable: true, get: () => paused });
  Object.defineProperty(video, 'ended', { configurable: true, get: () => false });
  Object.defineProperty(video, 'readyState', { configurable: true, get: () => 4 });
  video.load = () => {};
  video.play = () => {
    playCalls += 1;
    paused = false;
    video.dispatchEvent(new window.Event('playing'));
    return Promise.resolve();
  };

  window.eval(scripts.nav);
  await Promise.resolve();
  assert.equal(playCalls, 1, 'normal browsers must attempt hero playback immediately');
  assert.equal(stage.dataset.playing, 'true', 'real video playback must uncover the video');

  paused = true;
  video.dispatchEvent(new window.Event('pause'));
  window.dispatchEvent(new window.PageTransitionEvent('pageshow'));
  await Promise.resolve();
  assert.equal(playCalls, 2, 'a later page restore must retry playback instead of remaining permanently settled');
  dom.window.close();
}

{
  const { dom, window } = createDom();
  const video = window.document.querySelector('[data-hero-video]');
  const fallback = window.document.querySelector('[data-hero-motion-fallback]');
  const stage = video.closest('.hero');
  let playCalls = 0;
  let pauseCalls = 0;

  Object.defineProperty(fallback, 'currentSrc', { configurable: true, value: 'https://local.test/media/hero/delphine-hero-1080.mp4' });
  Object.defineProperty(fallback, 'complete', { configurable: true, value: true });
  video.load = () => {};
  video.play = () => {
    playCalls += 1;
    return Promise.resolve();
  };
  video.pause = () => { pauseCalls += 1; };

  window.eval(scripts.nav);
  await Promise.resolve();
  assert.equal(stage.dataset.imageMotion, 'true', 'Safari MP4 image playback must own hero motion automatically');
  assert.equal(playCalls, 0, 'the Safari image path must not start a redundant video decoder');
  assert.equal(pauseCalls, 1, 'the Safari image path must stop the redundant video element');
  assert.equal(stage.hasAttribute('data-playing'), false, 'Safari image motion must remain visible above the video');
  dom.window.close();
}

{
  const { dom, window } = createDom(homeHtml, { reduced: true });
  window.eval(scripts.statement);
  const document = window.document;
  const source = document.querySelector('.statement__text .visually-hidden').textContent;
  const visual = document.querySelector('.statement__visual');
  const chars = [...document.querySelectorAll('.statement__char')];
  const expectedChars = Array.from(source.replace(/\s/gu, '')).length;

  assert.equal(visual.getAttribute('aria-hidden'), 'true', 'visual statement must be hidden from assistive technology');
  assert.equal(visual.textContent, source, 'visual statement must reproduce the exact spoken copy');
  assert.equal(chars.length, expectedChars, 'every non-whitespace character must receive one fill span');
  assert.ok(chars.every((char) => char.dataset.lit === 'true'), 'reduced motion must render every character filled');
  assert.equal(document.documentElement.classList.contains('statement-css'), false, 'reduced motion must not start a scroll timeline');
  dom.window.close();
}

{
  const { dom, window } = createDom();
  let top = 900;   // below the point where filling begins
  const statement = window.document.querySelector('.statement');
  // 1450 mirrors the shipped .statement min-height of 145svh at a 1000px
  // viewport, so the fallback is measured against the real geometry.
  statement.getBoundingClientRect = () => ({ top, height: 1450 });
  // The fill begins as the opening line rises into view (top ~= 0.82vh), not
  // once the section has locked to the top of the screen, and it completes just
  // before the section unpins rather than half a screen early.
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  window.eval(scripts.statement);
  const chars = [...window.document.querySelectorAll('.statement__char')];
  assert.ok(chars.every((char) => char.dataset.lit === 'false'), 'fallback must begin unfilled');

  top = 190;
  window.dispatchEvent(new window.Event('scroll'));
  const midpoint = chars.findIndex((char) => char.dataset.lit !== 'true');
  assert.ok(midpoint > chars.length * 0.4 && midpoint < chars.length * 0.6, 'mid-scroll must fill a character-level prefix');
  assert.ok(chars.slice(0, midpoint).every((char) => char.dataset.lit === 'true'), 'lit characters must form one contiguous prefix');
  assert.ok(chars.slice(midpoint).every((char) => char.dataset.lit === 'false'), 'unlit characters must follow the prefix');

  top = -440;
  window.dispatchEvent(new window.Event('scroll'));
  assert.ok(chars.every((char) => char.dataset.lit === 'true'), 'full scroll must fill every character');

  top = 900;
  window.dispatchEvent(new window.Event('scroll'));
  assert.ok(chars.every((char) => char.dataset.lit === 'false'), 'reverse scroll must un-fill every character');
  dom.window.close();
}

{
  const { dom, window } = createDom(homeHtml, { cssDriven: true });
  window.eval(scripts.statement);
  const chars = [...window.document.querySelectorAll('.statement__char')];
  assert.ok(window.document.documentElement.classList.contains('statement-css'), 'supported browsers must enable the CSS timeline');
  assert.equal(chars[0].style.getPropertyValue('--i'), '0', 'first character needs the first timeline slice');
  assert.equal(chars.at(-1).style.getPropertyValue('--i'), String(chars.length - 1), 'last character needs the final timeline slice');
  assert.equal(window.document.querySelector('[data-statement]').style.getPropertyValue('--n'), String(chars.length), 'statement must expose its character count to CSS');
  dom.window.close();
}

{
  const { dom, window } = createDom(discoverHtml, { url: 'https://local.test/discover.html#gallery' });
  window.eval(scripts.discover);
  assert.equal(window.document.body.dataset.chapterView, 'gallery', 'deep route must isolate the selected chapter');
  window.history.pushState(null, '', '#suites-and-cabins');
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert.equal(window.document.body.dataset.chapterView, 'suites-and-cabins', 'chapter isolation must follow hash changes');
  window.history.pushState(null, '', '/discover.html');
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  assert.equal(window.document.body.hasAttribute('data-chapter-view'), false, 'the unselected route must restore the Explore index');

  window.eval(scripts.gallery);
  const document = window.document;

  // Choosing a chapter opens the carousel immediately; there is no middle page.
  const sets = [...document.querySelectorAll('[data-gallery-set]')];
  assert.ok(sets.every((set) => set.hidden), 'the chapter sets are never shown when scripted');

  const lightbox = document.querySelector('[data-gallery-lightbox]');
  document.querySelector('[data-gallery-open="cabins"]').click();
  assert.equal(lightbox.open, true, 'choosing a chapter must open the carousel straight away');
  assert.equal(document.querySelector('[data-gallery-chapters]').hidden, false, 'the chapter index stays put behind the modal');
  assert.ok(sets.every((set) => set.hidden), 'no intermediate chapter page may appear');

  assert.equal(document.querySelector('[data-lightbox-title]').textContent, 'H&A Dodge Suite', 'the carousel starts on the first photograph of the chapter');
  assert.equal(document.querySelector('[data-lightbox-position]').textContent, '1 of 7', 'the carousel is scoped to the chosen chapter');
  assert.equal(document.documentElement.style.overflow, 'hidden', 'the open carousel must lock page scrolling');

  document.querySelector('[data-lightbox-next]').click();
  assert.equal(document.querySelector('[data-lightbox-position]').textContent, '2 of 7', 'Next must advance within the chapter');
  assert.equal(document.querySelector('[data-lightbox-title]').textContent, 'Delphine Suite', 'Next must advance the photograph');

  lightbox.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  assert.equal(document.querySelector('[data-lightbox-position]').textContent, '1 of 7', 'Left arrow must reverse');
  lightbox.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  assert.equal(document.querySelector('[data-lightbox-position]').textContent, '7 of 7', 'the carousel wraps inside the chapter');

  document.querySelector('[data-lightbox-close]').click();
  assert.equal(lightbox.open, false, 'Close must dismiss the carousel');
  assert.equal(document.documentElement.style.overflow, '', 'closing must release page scrolling');
  assert.equal(document.activeElement, document.querySelector('[data-gallery-open="cabins"]'), 'closing returns focus to the chapter that was opened');

  dom.window.close();
}

console.log('Behaviour checks passed: automatic hero motion, animated Menu, no-JS paths, character scroll-fill, reduced motion, isolated chapters, focused specifications and filtered Gallery lightbox.');
