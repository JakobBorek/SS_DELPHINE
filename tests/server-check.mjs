import assert from "node:assert/strict";

const baseUrl = new URL(process.argv[2] || "http://127.0.0.1:4173/");
const resources = new Map([
  ["/", "text/html"],
  ["/404.html", "text/html"],
  ["/css/tokens.css", "text/css"],
  ["/css/print.css", "text/css"],
  ["/assets/fonts/archivo-var-latin.woff2", "font/woff2"],
  ["/site.webmanifest", "application/manifest+json"],
  ["/sitemap.xml", "application/xml"],
  ["/robots.txt", "text/plain"]
]);

for (const [resource, expectedType] of resources) {
  const response = await fetch(new URL(resource, baseUrl), { method: "HEAD" });
  assert.equal(response.status, 200, `${resource} must return HTTP 200`);
  assert.match(
    response.headers.get("content-type") || "",
    new RegExp(`^${expectedType.replace("+", "\\+")}`),
    `${resource} must use ${expectedType}`
  );
}

const documentResponse = await fetch(baseUrl);
const documentText = await documentResponse.text();
assert.match(documentText, /<main id="main-content"/, "served document must contain the semantic main element");
assert.equal((documentText.match(/<section id=/g) || []).length, 16, "served document must contain all 16 sections");

console.log(`Served-resource checks passed: ${resources.size} HTTP 200 responses with expected MIME types.`);
