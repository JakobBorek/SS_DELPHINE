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

  const animationFrames = [];
  window.requestAnimationFrame = (callback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  };
  toggle.click();
  const sectionLink = dialog.querySelector('a[href="/#the-yacht"]');
  const destinationHeading = document.querySelector('#the-yacht-title');
  const click = new window.MouseEvent('click', { bubbles: true, cancelable: true });
  assert.equal(sectionLink.dispatchEvent(click), true, 'same-page Menu link must preserve native navigation');
  assert.equal(click.defaultPrevented, false, 'same-page Menu link must not replace hash navigation');
  assert.equal(dialog.open, false, 'same-page Menu link must close the dialog');
  assert.equal(animationFrames.length, 1, 'same-page destination focus must wait for native navigation');
  animationFrames.shift()(0);
  assert.equal(document.activeElement, destinationHeading, 'same-page navigation must focus the destination heading');
  assert.equal(destinationHeading.getAttribute('tabindex'), '-1', 'destination heading must be programmatically focusable');
  destinationHeading.blur();
  assert.equal(destinationHeading.hasAttribute('tabindex'), false, 'temporary heading tabindex must be removed on blur');

  toggle.click();
  const crossPage = dialog.querySelector('a[href="/discover.html#the-refit"]');
  const frameCount = animationFrames.length;
  crossPage.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(dialog.open, false, 'cross-page Menu link must close the dialog');
  assert.equal(animationFrames.length, frameCount, 'cross-page Menu link must not focus the current document');

  toggle.click();
  const cancelEvent = new window.Event('cancel', { cancelable: true });
  assert.equal(dialog.dispatchEvent(cancelEvent), false, 'Escape cancellation must be handled for the menu exit');
  assert.equal(cancelEvent.defaultPrevented, true, 'native Escape close must wait for the menu exit path');
  assert.equal(document.activeElement, toggle, 'native Escape close path must restore Menu focus');

  assert.match(layoutCss, /\.nav-toggle,[\s\S]*min-inline-size:\s*var\(--sp-6\)[\s\S]*min-block-size:\s*var\(--sp-6\)/, 'Menu and Close must use 48px minimum targets');
  assert.match(layoutCss, /@keyframes\s+menu-cross-first/, 'the two-rule Menu mark must morph into the first arm of the X');
  assert.match(layoutCss, /@keyframes\s+menu-cross-last/, 'the two-rule Menu mark must morph into the second arm of the X');
  assert.match(layoutCss, /@keyframes\s+menu-panel-enter/, 'the menu panel must enter from the right');
  assert.match(layoutCss, /@keyframes\s+menu-panel-exit/, 'the menu panel must exit to the right');
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
  let top = 0;
  const statement = window.document.querySelector('.statement');
  statement.getBoundingClientRect = () => ({ top, height: 1800 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  window.eval(scripts.statement);
  const chars = [...window.document.querySelectorAll('.statement__char')];
  assert.ok(chars.every((char) => char.dataset.lit === 'false'), 'fallback must begin unfilled');

  top = -400;
  window.dispatchEvent(new window.Event('scroll'));
  const midpoint = chars.findIndex((char) => char.dataset.lit !== 'true');
  assert.ok(midpoint > chars.length * 0.4 && midpoint < chars.length * 0.6, 'mid-scroll must fill a character-level prefix');
  assert.ok(chars.slice(0, midpoint).every((char) => char.dataset.lit === 'true'), 'lit characters must form one contiguous prefix');
  assert.ok(chars.slice(midpoint).every((char) => char.dataset.lit === 'false'), 'unlit characters must follow the prefix');

  top = -800;
  window.dispatchEvent(new window.Event('scroll'));
  assert.ok(chars.every((char) => char.dataset.lit === 'true'), 'full scroll must fill every character');

  top = 0;
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
  const slides = [...window.document.querySelectorAll('[data-gallery-slide]')];
  let shown = null;
  slides.forEach((slide, index) => {
    slide.scrollIntoView = () => {
      shown = index;
    };
  });
  window.eval(scripts.gallery);
  window.document.querySelector('[data-gallery-next]').click();
  assert.equal(shown, 1, 'Next must request the second photograph');
  assert.equal(window.document.querySelector('[data-gallery-current]').textContent, '2', 'gallery counter must advance');

  window.document.querySelector('[data-gallery-viewport]').dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
  );
  assert.equal(shown, 0, 'Left arrow must return to the first photograph');
  assert.equal(window.document.querySelector('[data-gallery-current]').textContent, '1', 'gallery counter must reverse');
  dom.window.close();
}

console.log('Behaviour checks passed: native Menu, no-JS paths, character scroll-fill, reduced motion, focused specifications and deep gallery controls.');
