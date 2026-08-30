# SS Delphine redesign handoff

## Homepage

- `index.html` now contains only Hero, Statement, The Yacht, Private Charter and Inquiry.
- The hero video and visual treatment remain approved and unchanged. The central gold monogram was removed; the fixed-header monogram remains.
- The Yacht is a two-column editorial spread with a complete broadside dusk exterior on the right, extracted at 44 seconds from `DJI_20260808202557_0098_D.MP4`. The vessel fills most of the 16:9 frame and remains deliberately shallow on phones instead of reading as a tall inserted slab.
- Technical Specifications now sits immediately below the Yacht paragraphs as a body-font link with a tight gold underline and arrow. It opens a shadowed native modal rather than extending the homepage.
- Private Charter reverses the desktop image and text order using the promenade-deck photograph. Mobile explicitly restores copy-first reading order, so the Yacht and Charter images never stack together.
- Inquiry is aligned to the right and remains a non-functional placeholder until approved contact details exist.

## Signature

- `js/statement.js` now splits non-whitespace graphemes inside non-breaking word wrappers.
- `css/hero.css` maps every character to its own view-timeline slice.
- Scroll down fills, scroll up un-fills, reduced motion is static and fully lit, and JavaScript-off keeps the raw sentence readable. The pre-fill tint is 14 percent cream for stronger contrast between unfilled and filled characters.
- There is one spoken copy and one `aria-hidden` visual copy, preventing duplicate screen-reader output.

## Menu and deeper material

- `css/layout.css` and `js/nav.js` now use one top-right Menu at every width.
- The Menu is a native modal right-hand drawer with a gold leading edge, backdrop and shadow. Its fixed two bars visibly morph into an X while the surface slides in, and cross-page links wait for the exit transition.
- It retains 48 pixel controls, Escape close, focus restoration and scroll locking. Short mobile viewports scroll from the first link rather than overflowing above the scroll origin.
- `discover.html` contains Technical Specifications, The Refit, Interiors and Amenities, Cabins, Toys and Tenders, Charter Details and Gallery.
- Each chapter is hidden until its hash target is selected. A selected deep route also removes the introductory chapter index, preventing a scroll back into “Explore SS Delphine.” This works without JavaScript, with `js/discover.js` as a compatibility enhancement.
- Gallery JavaScript loads only on `discover.html`; statement JavaScript loads only on the homepage.
- Gallery is now a 34-image editorial mosaic in five categories: Deck & Exterior, Salons & Dining, Cabins, Wellness, and Heritage & Engineering. Filters and an accessible native-dialog lightbox replace the former nine-image sequential viewer.

## Assets

- The homepage references new `yacht-dusk-side-960` and `yacht-dusk-side-1600` AVIF/WebP derivatives. Both top-down views remain in the Gallery.
- Added 960 and 1600 pixel AVIF/WebP derivatives for 18 archive subjects used by the expanded Gallery. Source photographs were not duplicated or modified.
- No owned photograph depicts a crowd or event, so the current Private Charter image remains until the owner or crew supplies or approves a rights-cleared replacement.
- Existing selected photography, hero encodes, palette, logo files and fonts remain unchanged.

## Tests and evidence

- Static checks now parse both production HTML pages, validate cross-page hash targets, keep all supplied facts, and enforce the focused homepage structure.
- Behavior checks cover the animated native Menu, modified clicks, character scroll-fill, reduced motion, JavaScript-off, isolated deep chapters, the specification modal and filtered Gallery lightbox.
- Served-resource checks include `discover.html`, `js/discover.js`, the expanded Gallery media and the broadside Yacht derivatives.
- `npm test`, served-resource checks and `npm audit --omit=dev` pass.
- Earlier Chrome 152 evidence is under `/private/tmp/ssdelphine-current-qa/`. The current Codex in-app browser registry returned no instances, so this final revision still needs a fresh real iPhone/desktop visual pass.

## Still awaiting the client

- Approved inquiry contact details and form requirements
- Client-approved privacy and imprint text
- Canonical production domain and crawl approval
- Physical iPhone autoplay, decoder and Low Power Mode check

No git commit, deployment or publication was performed.
