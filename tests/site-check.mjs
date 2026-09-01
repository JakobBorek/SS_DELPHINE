import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => readFile(path.join(root, file), 'utf8');
const pages = new Map([
  ['/index.html', await read('index.html')],
  ['/discover.html', await read('discover.html')]
]);
const tokensCss = await read('css/tokens.css');
const cspConfig = JSON.parse(await read('vercel.json'));
const doms = new Map(
  [...pages].map(([pathname, html]) => [
    pathname,
    new JSDOM(html, { url: `https://local.test${pathname}` })
  ])
);
const home = doms.get('/index.html').window.document;
const discover = doms.get('/discover.html').window.document;

const expectedHome = ['hero', 'statement', 'the-yacht', 'private-charter', 'enquiry'];
const expectedDiscover = ['discover', 'the-refit', 'interiors', 'suites-and-cabins', 'toys-and-tenders', 'charter', 'gallery', 'technical-specifications'];

/* The vessel is always "SS Delphine". Two rooms aboard her are not: the owner's
   representative named them "Delphine Suite" and "Delphine Lounge" on 2026-09-01,
   so those two proper names are lifted out before the guard runs and every other
   bare "Delphine" still fails. */
/* No trailing \b: textContent glues a <dt> to its <dd>, so the name can arrive
   as "Delphine SuiteKing bed..." with no boundary after "Suite". */
const shipOnly = (text) => text.replace(/\bDelphine (?:Suite|Lounge)/g, 'room');

for (const [pathname, html] of pages) {
  const document = doms.get(pathname).window.document;
  assert.match(html, /^<!DOCTYPE html>/, `${pathname} must use an HTML5 doctype`);
  assert.equal(document.documentElement.lang, 'en', `${pathname} language must be English`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${pathname} must contain one H1`);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, `${pathname} cannot contain inline scripts`);
  assert.doesNotMatch(html, /\sstyle=/i, `${pathname} cannot contain inline styles`);
  assert.doesNotMatch(html, /\son[a-z]+=/i, `${pathname} cannot contain inline event handlers`);
  assert.doesNotMatch(html, /<iframe\b/i, `${pathname} cannot contain iframes`);
  assert.doesNotMatch(html, /(?:_source\/|ssdvideo\.mp4)/i, `${pathname} cannot reference source-only media`);
  /* The owner supplied these on 2026-09-01. Any other mailto: or tel: is still
     an invention and still fails. */
  const approvedContacts = /(?:mailto:ssdelphineyacht@gmail\.com|tel:\+33688894575)/g;
  assert.doesNotMatch(html.replace(approvedContacts, ''), /(?:mailto:|tel:)/i, `${pathname} cannot ship unapproved contact links`);

  const visibleCopy = document.body.textContent.replace(/\s+/g, ' ').trim();
  assert.doesNotMatch(visibleCopy, /—/, `${pathname} visible copy cannot contain em dashes`);
  assert.doesNotMatch(shipOnly(visibleCopy), /(?<!SS )\bDelphine\b/, `${pathname} must not shorten SS Delphine`);

  for (const image of document.querySelectorAll('img[alt]')) {
    assert.doesNotMatch(image.alt, /—/, `${pathname} alt text cannot contain em dashes`);
    assert.doesNotMatch(shipOnly(image.alt), /(?<!SS )\bDelphine\b/, `${pathname} alt text must not shorten SS Delphine`);
  }
}

assert.deepEqual(
  [...home.querySelectorAll('main > section[id]')].map((section) => section.id),
  expectedHome,
  'the homepage must keep only the focused five-part journey'
);
assert.deepEqual(
  [...discover.querySelectorAll('main > section[id]')].map((section) => section.id),
  expectedDiscover,
  'deeper material must live on the dedicated explore page'
);
assert.equal(home.querySelector('.hero__lockup img'), null, 'the central hero lockup must not include the gold monogram');
assert.ok(home.querySelector('.site-mark__logo'), 'the header monogram must remain');

const statement = 'Built in 1921 for the Dodge family, SS Delphine still sails under the original engines she was designed for.';
assert.equal(home.querySelector('[data-statement]')?.textContent.trim(), statement, 'the shorter statement copy must remain exact');
assert.equal(home.querySelectorAll('.statement__char').length, 0, 'characters must be generated only when JavaScript enhances the statement');

const specsTrigger = home.querySelector('[data-specs-open]');
const specsDialog = home.querySelector('#technical-specifications-dialog');
const deepSpecs = discover.querySelector('#technical-specifications');
assert.equal(specsTrigger?.tagName, 'A', 'technical specifications trigger must retain a durable fallback link');
assert.equal(specsTrigger?.getAttribute('href'), '/discover.html#technical-specifications', 'technical specifications fallback must open the deep route');
assert.equal(home.querySelector('.editorial--yacht .editorial__prose')?.nextElementSibling, specsTrigger, 'technical specifications must sit directly below the Yacht copy');
assert.equal(specsDialog?.tagName, 'DIALOG', 'technical specifications must open in a native modal surface');
assert.equal(specsDialog?.hasAttribute('open'), false, 'technical specifications dialog must be closed initially');
assert.equal(specsDialog?.querySelectorAll('.plate__row').length, 13, 'the focused view must retain all thirteen technical specifications');
assert.equal(deepSpecs?.querySelectorAll('.plate__row').length, 13, 'the deep route must retain all thirteen technical specifications');
const serialisePlate = (scope) => [...scope.querySelectorAll('.plate__row')]
  .map((row) => [...row.children].map((cell) => cell.textContent.replace(/\s+/g, ' ').trim()));
assert.deepEqual(serialisePlate(specsDialog), serialisePlate(deepSpecs), 'modal and deep-route specification facts must not drift');
for (const document of [home, discover]) {
  assert.ok(document.querySelector('.site-menu a[href="/discover.html#technical-specifications"]'), 'Menu must expose the dedicated technical specifications route');
  const headerMark = document.querySelector('.site-header .site-mark');
  const menuMark = document.querySelector('.site-menu .site-menu__brand');
  assert.equal(menuMark?.querySelector('img')?.getAttribute('src'), headerMark?.querySelector('img')?.getAttribute('src'), 'Menu and header must use the same official monogram');
  assert.equal(menuMark?.querySelector('.site-mark__text')?.textContent.trim(), headerMark?.querySelector('.site-mark__text')?.textContent.trim(), 'Menu and header must use the same wordmark');
}
assert.match(home.querySelector('.editorial--yacht img')?.getAttribute('src') || '', /yacht-daylight-side-1600\.webp$/, 'The Yacht must use the responsive broadside exterior');
assert.equal(home.querySelector('#the-refit'), null, 'refit detail must not remain in the main-page scroll');
assert.equal(home.querySelector('#interiors'), null, 'interior detail must not remain in the main-page scroll');
assert.equal(home.querySelector('#suites-and-cabins'), null, 'cabin detail must not remain in the main-page scroll');
assert.equal(home.querySelector('#toys-and-tenders'), null, 'tender detail must not remain in the main-page scroll');
assert.equal(home.querySelector('#contact'), null, 'the closing section must not be named Contact');
assert.equal(home.querySelector('#enquiry-title')?.textContent.trim(), 'Enquiry', 'the closing section must be Enquiry');
assert.equal(discover.querySelectorAll('form').length, 0, 'the deeper page must not contain an inquiry form');
const inquiryForm = home.querySelector('.inquiry-form');
assert.equal(home.querySelectorAll('form').length, 1, 'the homepage must contain one display-only inquiry form');
assert.equal(inquiryForm?.hasAttribute('action'), false, 'the display-only form must not have an action');
assert.equal(inquiryForm?.hasAttribute('method'), false, 'the display-only form must not have a method');
assert.ok(inquiryForm?.querySelector('fieldset[disabled]'), 'the display-only form must use a disabled fieldset');
assert.ok(inquiryForm?.querySelector('button[type="submit"][disabled]'), 'the display-only submit button must remain disabled');
// The card carries the form alone; the contact column was removed.
assert.equal(home.querySelectorAll('.inquiry__details').length, 0, 'the inquiry contact column must not return');
assert.equal(home.querySelectorAll('.inquiry__welcome').length, 0, 'the inquiry welcome heading must not return');
assert.ok(home.querySelector('.inquiry__panel .inquiry-form'), 'the inquiry card must carry the form');
assert.equal(home.querySelector('.inquiry__signature img')?.getAttribute('src'), '/assets/logo/ss-delphine-lockup.svg', 'the inquiry must use the supplied lockup');
const footerTerms = [...home.querySelectorAll('.site-footer__contact dt')].map((n) => n.textContent.trim());
assert.deepEqual(footerTerms, ['Email', 'Telephone'], 'the footer carries the two supplied contact routes and no location');
assert.equal(home.querySelector('.site-footer__contact a[href^="mailto:"]')?.getAttribute('href'), 'mailto:ssdelphineyacht@gmail.com', 'the footer email must be the supplied address');
assert.equal(home.querySelector('.site-footer__contact a[href^="tel:"]')?.getAttribute('href'), 'tel:+33688894575', 'the footer telephone must be the supplied number');
assert.ok(home.querySelector('.site-footer__social .icon-instagram'), 'the footer must carry a clickable Instagram icon');
assert.equal(
  home.querySelector('.site-footer__social')?.getAttribute('href'),
  'https://www.instagram.com/ssdelphine',
  'the footer Instagram icon must link to the approved account'
);
assert.equal(home.querySelectorAll('.site-footer__legal a').length, 3, 'the footer must carry the placeholder legal links');
assert.ok(home.querySelector('.nav-toggle__bars'), 'the menu control must use the two-rule mark');
assert.ok(home.querySelector('[data-menu-close] .site-menu__close-bars'), 'the open menu must close with the crossed mark');

for (const unapprovedContact of ['charter@ssdelphne.com', '+377 97 97 97 97', 'Monaco', 'Within 24 Hours']) {
  assert.doesNotMatch(home.body.textContent, new RegExp(unapprovedContact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `unapproved mock contact must not ship: ${unapprovedContact}`);
}
const galleryItems = [...discover.querySelectorAll('[data-gallery-item]')];
assert.equal(galleryItems.length, 28, 'the explore gallery must contain the twenty-eight owned photographs');
assert.deepEqual(
  Object.fromEntries(['deck', 'salons', 'cabins', 'wellness', 'heritage'].map((category) => [
    category,
    galleryItems.filter((item) => item.dataset.category === category).length
  ])),
  { deck: 7, salons: 4, cabins: 7, wellness: 5, heritage: 5 },
  'gallery categories must keep their intended editorial balance'
);
assert.equal(new Set(galleryItems.map((item) => item.dataset.title)).size, 28, 'gallery titles must be unique');

// The archive opens as chapters, not as every photograph at once.
assert.equal(discover.querySelectorAll('[data-gallery-open]').length, 5, 'the gallery must open as five chapter banners');
assert.equal(discover.querySelectorAll('[data-gallery-set]').length, 5, 'each chapter must have its own set');
assert.ok(
  [...discover.querySelectorAll('[data-gallery-set]')].every((set) => set.hasAttribute('hidden')),
  'chapter sets must start closed so the index is what loads'
);
assert.equal(discover.querySelectorAll('[data-gallery-back]').length, 5, 'every chapter must offer a way back to the index');
assert.equal(discover.querySelectorAll('[data-gallery-filter]').length, 0, 'the old filter toolbar must be gone');

// The AI-generated aerial must never reappear.
assert.doesNotMatch(discover.documentElement.outerHTML, /yacht-aerial/, 'the AI-generated underway image must not be referenced');

assert.equal(discover.querySelector('[data-gallery-lightbox]')?.tagName, 'DIALOG', 'gallery must open in a native focused lightbox');
assert.ok(discover.querySelector('[data-gallery-lightbox] [aria-live="polite"]'), 'gallery lightbox changes must be announced');
assert.equal(discover.querySelectorAll('.discover-panel__back').length, 0, 'deep chapters must rely on the persistent Menu instead of returning to the Explore index');

const combinedCopy = [...doms.values()]
  .map((dom) => dom.window.document.body.textContent.replace(/\s+/g, ' '))
  .join(' ');
for (const fact of [
  'Maxime Berisset of VIENA MB',
  'completed in July 2025',
  '2 × Horace Dodge quadruple expansion steam engines',
  '1,500 HP per engine',
  '3,000 NM economical, 4,000 NM at cruising speed',
  'Twelve guest cabins with fifteen beds sleep twenty-six guests',
  '3,600 HP, fifteen guests',
  'at least six hours in advance',
  'YET 12, ISM, ISPS and MLC compliant'
]) {
  const escaped = fact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(combinedCopy, new RegExp(escaped, 'i'), `missing source fact: ${fact}`);
}

const heroVideo = home.querySelector('[data-hero-video]');
for (const attribute of ['muted', 'autoplay', 'loop', 'playsinline', 'poster']) {
  assert.ok(heroVideo?.hasAttribute(attribute), `hero video must include ${attribute}`);
}
assert.equal(heroVideo?.getAttribute('preload'), 'auto', 'hero video must preload eagerly so autoplay is not waiting on the network');

/* No play button, ever. iOS paints its own when autoplay is refused, so the
   video is transparent until it is playing and a still stands in behind it.
   These three assertions are the contract; do not relax them. */
assert.ok(home.querySelector('.hero .hero__still'), 'the hero must carry a still behind the video');
assert.equal(heroVideo?.hasAttribute('controls'), false, 'the hero video must never expose controls');
{
  const heroCss = await readFile(path.join(root, 'css/hero.css'), 'utf8');
  assert.match(heroCss, /\.hero__video\s*\{[^}]*pointer-events:\s*none;/, 'the hero video must never be tappable');
  assert.doesNotMatch(heroCss, /\.hero__video\s*\{[^}]*opacity:\s*0;/, 'the hero video must never be transparent: Safari will not autoplay a video it treats as invisible');
  assert.match(heroCss, /\.hero\[data-playing='true'\]\s*\.hero__still\s*\{\s*opacity:\s*0;/, 'the still must cover the video until playback is real');
  const stillAfterVideo = home.body.innerHTML.indexOf('hero__still') > home.body.innerHTML.indexOf('hero__video');
  assert.ok(stillAfterVideo, 'the still must follow the video in the markup so it paints on top of it');
}

for (const dom of doms.values()) {
  for (const image of dom.window.document.querySelectorAll('main img')) {
    if (image.src.includes('/assets/logo/')) continue;
    /* The hero still is the first thing on the screen and stands in for the
       video until it plays. Lazy-loading it would leave the hero blank. */
    if (image.classList.contains('hero__still')) {
      assert.equal(image.getAttribute('loading'), null, 'the hero still must not lazy-load');
      continue;
    }
    assert.equal(image.getAttribute('loading'), 'lazy', `below-fold image ${image.src} must lazy-load`);
    assert.ok(image.hasAttribute('width') && image.hasAttribute('height'), `below-fold image ${image.src} needs dimensions`);
    assert.ok(image.closest('picture')?.querySelector('source[type="image/avif"]'), `below-fold image ${image.src} needs AVIF`);
    assert.match(image.src, /\.webp$/, `below-fold image ${image.src} needs WebP fallback`);
  }
}

const normalisePath = (pathname) => pathname === '/' ? '/index.html' : pathname;
for (const [pathname, dom] of doms) {
  const document = dom.window.document;
  for (const link of document.querySelectorAll('a[href]')) {
    const url = new URL(link.getAttribute('href'), `https://local.test${pathname}`);
    if (url.origin !== 'https://local.test') continue;
    const targetPath = normalisePath(url.pathname);
    if (url.hash && pages.has(targetPath)) {
      const targetDom = doms.get(targetPath).window.document;
      assert.ok(targetDom.getElementById(url.hash.slice(1)), `broken local target ${url.pathname}${url.hash}`);
    }
  }
}

const localAssets = new Set();
for (const dom of doms.values()) {
  const document = dom.window.document;
  for (const element of document.querySelectorAll('script[src], img[src], video[poster], source[src], link[href^="/"]')) {
    const value = element.getAttribute('src') || element.getAttribute('poster') || element.getAttribute('href');
    if (value && value !== '/') localAssets.add(value);
  }
  for (const element of document.querySelectorAll('[srcset]')) {
    for (const candidate of element.getAttribute('srcset').split(',')) {
      localAssets.add(candidate.trim().split(/\s+/)[0]);
    }
  }
}
for (const asset of localAssets) {
  await access(path.join(root, asset.slice(1)));
}

const cssFiles = (await readdir(path.join(root, 'css'))).filter((file) => file.endsWith('.css') && file !== 'tokens.css');
for (const file of cssFiles) {
  const css = await read(`css/${file}`);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, `${file} cannot declare raw hex colours`);
  assert.doesNotMatch(css, /(?:rgb|hsl|oklch|lab|color-mix)\(/i, `${file} cannot declare functional colours outside tokens.css`);
}

const jsFiles = (await readdir(path.join(root, 'js'))).filter((file) => file.endsWith('.js'));
const jsSource = (await Promise.all(jsFiles.map((file) => read(`js/${file}`)))).join('\n');
const gzippedBytes = gzipSync(jsSource).byteLength;
assert.ok(gzippedBytes < 40 * 1024, `JavaScript must stay under 40 KB gzipped, found ${gzippedBytes} bytes`);

for (const legalPage of ['privacy.html', 'imprint.html']) {
  const legal = await read(legalPage);
  assert.match(legal, /client-approved/i, `${legalPage} must await client-approved text`);
}

const securityHeaders = new Map(cspConfig.headers[0].headers.map((header) => [header.key, header.value]));
for (const required of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security', 'X-Frame-Options']) {
  assert.ok(securityHeaders.has(required), `missing security header ${required}`);
}
const csp = securityHeaders.get('Content-Security-Policy');
assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/, 'CSP cannot allow inline or evaluated code');
assert.match(csp, /frame-ancestors 'none'/, 'framing must be blocked');
assert.match(csp, /object-src 'none'/, 'object embeds must be blocked');

const token = (name) => {
  const value = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  assert.ok(value, `missing colour token --${name}`);
  return value;
};
const luminance = (hex) => {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (first, second) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
for (const [foreground, background] of [
  ['cream', 'navy-deep'],
  ['cream', 'navy'],
  ['cream-muted', 'navy-deep'],
  ['cream-muted', 'navy']
]) {
  assert.ok(contrast(token(foreground), token(background)) >= 4.5, `${foreground} on ${background} must meet WCAG AA`);
}
assert.ok(contrast(token('gold'), token('navy-deep')) >= 3, 'gold focus indicator must meet non-text contrast');

for (const dom of doms.values()) dom.window.close();
console.log(`Production checks passed: focused homepage, ${expectedDiscover.length - 1} deep chapters, ${localAssets.size} local assets and ${gzippedBytes} gzipped JS bytes.`);

// The Blue guest suite duplicated the SS Delphine Suite under a different name.
assert.doesNotMatch(discover.documentElement.outerHTML, /guest-suite-/, 'the duplicated cabin must not return');
