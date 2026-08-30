import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../netlify.toml', import.meta.url), 'utf8');

assert.match(config, /publish\s*=\s*"dist"/, 'Netlify must publish only the generated dist directory');
assert.match(config, /command\s*=\s*"npm run build"/, 'Netlify must build the production allowlist');
assert.match(config, /Content-Security-Policy/, 'Netlify must retain the production CSP');
assert.match(config, /X-Content-Type-Options\s*=\s*"nosniff"/, 'Netlify must prevent MIME sniffing');
assert.match(config, /Strict-Transport-Security/, 'Netlify must retain HSTS');
assert.match(config, /from\s*=\s*"\/discover"[\s\S]*to\s*=\s*"\/discover\.html"/, 'Netlify must retain clean discovery URLs');

console.log('Netlify configuration checks passed.');
