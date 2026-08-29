import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const index = await readFile(path.join(root, "index.html"), "utf8");
const tokensCss = await readFile(path.join(root, "css/tokens.css"), "utf8");
const layoutCss = await readFile(path.join(root, "css/layout.css"), "utf8");
const printCss = await readFile(path.join(root, "css/print.css"), "utf8");
const cspConfig = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
const expectedSections = [
  "top",
  "refit",
  "machinery",
  "performance",
  "specification",
  "accommodation",
  "events",
  "wellness",
  "tenders",
  "connectivity",
  "history",
  "terms",
  "rates",
  "cruising",
  "enquiry",
  "brochure"
];

assert.match(index, /^<!DOCTYPE html>/, "HTML5 doctype must be present");
assert.match(index, /<html lang="en">/, "document language must be English");
assert.equal((index.match(/<h1\b/g) || []).length, 1, "the page must contain one H1");
assert.equal((index.match(/<section id=/g) || []).length, 16, "all 16 brief sections must ship in HTML");
assert.doesNotMatch(index, /<script(?![^>]*\bsrc=)[^>]*>/i, "inline scripts are forbidden");
assert.doesNotMatch(index, /\sstyle=/i, "inline styles are forbidden");
assert.doesNotMatch(index, /\son[a-z]+=/i, "inline event handlers are forbidden");
assert.doesNotMatch(index, /<iframe\b/i, "iframes are forbidden");
assert.doesNotMatch(index, /(?:dropbox|_source\/|ssdvideo\.mp4)/i, "source-only media must not be referenced");
assert.match(index, /minimum of six hours’ notice/i, "boiler notice must appear in the enquiry flow");
assert.ok((index.match(/To be confirmed/g) || []).length >= 20, "data gaps must remain visible");
assert.match(tokensCss, /--touch-target:\s*2\.75rem/, "touch target token must equal 44 pixels at the root size");
for (const breakpoint of ["75rem", "60rem", "45rem"]) {
  assert.ok(layoutCss.includes(`max-width: ${breakpoint}`), `responsive layout must include the ${breakpoint} breakpoint`);
}
assert.match(printCss, /@media print/, "print stylesheet must contain print rules");
assert.match(printCss, /break-before:\s*page/, "print sections must start on separate pages");
assert.match(printCss, /content:\s*" \(" attr\(href\)/, "print stylesheet must expose external link URLs");

const ids = new Set([...index.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
for (const section of expectedSections) {
  assert.ok(ids.has(section), `missing section #${section}`);
}

for (const match of index.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.has(match[1]), `broken in-page link #${match[1]}`);
}

const localAssets = new Set(
  [...index.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)]
    .map((match) => match[1])
    .filter((asset) => asset !== "/")
);

for (const asset of localAssets) {
  await access(path.join(root, asset.slice(1)));
}

const securityHeaders = new Map(cspConfig.headers[0].headers.map((header) => [header.key, header.value]));
for (const requiredHeader of [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options"
]) {
  assert.ok(securityHeaders.has(requiredHeader), `missing security header ${requiredHeader}`);
}

const csp = securityHeaders.get("Content-Security-Policy");
assert.ok(csp, "Content-Security-Policy header is required");
assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/, "CSP must not allow inline or evaluated code");
assert.match(csp, /frame-ancestors 'none'/, "framing must be blocked");
assert.match(csp, /object-src 'none'/, "object embeds must be blocked");

const token = (name) => {
  const value = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  assert.ok(value, `missing colour token --${name}`);
  return value;
};
const luminance = (hex) => {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};
const contrast = (first, second) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

for (const [foreground, background] of [
  ["ink", "paper"],
  ["ink-soft", "paper"],
  ["ink-soft", "paper-warm"],
  ["brass-ink", "paper"],
  ["brass-ink", "paper-warm"],
  ["paper", "sea"],
  ["paper", "ink"],
  ["ink-soft-inverse", "ink"]
]) {
  assert.ok(
    contrast(token(foreground), token(background)) >= 4.5,
    `${foreground} on ${background} must meet WCAG AA text contrast`
  );
}

assert.ok(contrast(token("brass"), token("paper")) >= 3, "focus indicator must meet non-text contrast");

// The footer inverts the surface, so the muted "to be confirmed" ink must be
// the inverse companion; the paper-tuned --ink-soft only reaches 2.4:1 there.
assert.match(
  layoutCss,
  /\.site-footer \.tbc\s*\{[^}]*color:\s*var\(--ink-soft-inverse\)/,
  "footer .tbc must use the inverse muted ink"
);

// The hero frame must derive its lower edge from the copy block rather than a
// fixed reserve, which previously let the border cut through the wordmark.
assert.match(layoutCss, /\.hero::before\s*\{[^}]*grid-area:\s*1 \/ 1/, "hero frame must be a grid item");
assert.doesNotMatch(layoutCss, /\.hero::before\s*\{[^}]*inset:/, "hero frame must not use a fixed inset reserve");

console.log(`Static site checks passed: ${expectedSections.length} sections, ${localAssets.size} local assets, ${ids.size} unique IDs and AA palette contrast.`);
