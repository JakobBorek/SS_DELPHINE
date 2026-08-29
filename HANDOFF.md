# SS Delphine redesign handoff

## Homepage

- `index.html` now contains only Hero, Statement, The Yacht, Private Charter and Inquiry.
- The hero video and visual treatment remain approved and unchanged. The central gold monogram was removed; the fixed-header monogram remains.
- The Yacht is a two-column editorial spread with the client-selected portrait top view on the right.
- Technical Specifications now sits immediately below the Yacht paragraphs as a body-font link with a tight gold underline and arrow. It opens a shadowed native modal rather than extending the homepage.
- Private Charter reverses the image and text order using the promenade-deck photograph.
- Inquiry is aligned to the right and remains a non-functional placeholder until approved contact details exist.

## Signature

- `js/statement.js` now splits non-whitespace graphemes inside non-breaking word wrappers.
- `css/hero.css` maps every character to its own view-timeline slice.
- Scroll down fills, scroll up un-fills, reduced motion is static and fully lit, and JavaScript-off keeps the raw sentence readable. The pre-fill tint is 14 percent cream for stronger contrast between unfilled and filled characters.
- There is one spoken copy and one `aria-hidden` visual copy, preventing duplicate screen-reader output.

## Menu and deeper material

- `css/layout.css` and `js/nav.js` now use one top-right Menu at every width.
- The Menu is a native modal `dialog` with 48 pixel controls, Escape close, focus restoration and scroll locking.
- Short mobile viewports can scroll the menu while keeping Close visible.
- `discover.html` contains Technical Specifications, The Refit, Interiors and Amenities, Cabins, Toys and Tenders, Charter Details and Gallery.
- Each chapter is hidden until its hash target is selected. This works without JavaScript and avoids another long default scroll.
- Gallery JavaScript loads only on `discover.html`; statement JavaScript loads only on the homepage.

## Assets

- Added `yacht-topview-640` and `yacht-topview-959` in AVIF and WebP.
- These are derived from the client-selected 959 by 1644 pixel `topviewssd.png` and are not upscaled.
- The earlier `yacht-aerial` derivatives remain unreferenced for provenance; no destructive cleanup was performed.
- Existing selected photography, hero encodes, palette, logo files and fonts remain unchanged.

## Tests and evidence

- Static checks now parse both production HTML pages, validate cross-page hash targets, keep all supplied facts, and enforce the focused homepage structure.
- Behavior checks cover the native Menu, character scroll-fill, reduced motion, JavaScript-off, the specification modal and deep Gallery controls.
- Served-resource checks include `discover.html`, `js/specs.js` and the new portrait derivatives.
- `npm test`, served-resource checks and `npm audit --omit=dev` pass.
- Real Chrome 152 evidence for the latest refinement is under `/private/tmp/ssdelphine-current-qa/`.

## Still awaiting the client

- Approved inquiry contact details and form requirements
- Client-approved privacy and imprint text
- Canonical production domain and crawl approval
- Physical iPhone autoplay, decoder and Low Power Mode check

No git commit, deployment or publication was performed.
