import assert from 'node:assert/strict';

const baseUrl = new URL(process.argv[2] || 'http://127.0.0.1:4173/');
const resources = new Map([
  ['/', 'text/html'],
  ['/discover.html', 'text/html'],
  ['/404.html', 'text/html'],
  ['/privacy.html', 'text/html'],
  ['/imprint.html', 'text/html'],
  ['/css/tokens.css', 'text/css'],
  ['/css/layout.css', 'text/css'],
  ['/css/sections.css', 'text/css'],
  ['/js/root.js', 'text/javascript'],
  ['/js/nav.js', 'text/javascript'],
  ['/js/statement.js', 'text/javascript'],
  ['/js/specs.js', 'text/javascript'],
  ['/js/discover.js', 'text/javascript'],
  ['/js/gallery.js', 'text/javascript'],
  ['/assets/fonts/archivo-wdth-latin.woff2', 'font/woff2'],
  ['/media/hero/delphine-hero-2160.mp4', 'video/mp4'],
  ['/media/gallery/yacht-dusk-side-960.avif', 'image/avif'],
  ['/media/gallery/yacht-dusk-side-960.webp', 'image/webp'],
  ['/site.webmanifest', 'application/manifest+json'],
  ['/sitemap.xml', 'application/xml'],
  ['/robots.txt', 'text/plain']
]);

for (const [resource, expectedType] of resources) {
  const response = await fetch(new URL(resource, baseUrl), { method: 'HEAD' });
  assert.equal(response.status, 200, `${resource} must return HTTP 200`);
  const expectedPattern = expectedType === 'text/javascript'
    ? /^(?:text|application)\/javascript/
    : new RegExp(`^${expectedType.replace('+', '\\+')}`);
  assert.match(
    response.headers.get('content-type') || '',
    expectedPattern,
    `${resource} must use ${expectedType}`
  );
}

const homeResponse = await fetch(baseUrl);
const home = await homeResponse.text();
assert.match(home, /<main id="main-content"/, 'homepage must contain the semantic main element');
assert.equal(
  (home.match(/<section class="(?:hero|statement|editorial|inquiry)[^"]*"[^>]*\bid=/g) || []).length,
  5,
  'homepage must contain the focused five-part journey'
);
assert.doesNotMatch(home, /id="(?:the-refit|interiors|cabins|toys-and-tenders|gallery)"/, 'deep chapters must not remain in the homepage scroll');

const discoverResponse = await fetch(new URL('/discover.html', baseUrl));
const discover = await discoverResponse.text();
assert.equal(
  (discover.match(/<section class="discover-panel[^"]*" id=/g) || []).length,
  7,
  'explore page must contain seven independently targeted deep chapters'
);
assert.match(discover, /id="gallery"/, 'explore page must retain the gallery');
assert.match(discover, /id="technical-specifications"/, 'explore page must expose technical specifications directly');

console.log(`Served-resource checks passed: ${resources.size} HTTP 200 responses, focused homepage and seven deep chapters.`);
