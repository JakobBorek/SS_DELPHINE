# SS Delphine production notes

## Current editorial structure

The homepage was simplified after visual review. It now contains five deliberate parts:

1. The approved hero video.
2. A short character-by-character scroll-fill statement.
3. The Yacht, with text on the left and the complete yacht on the right.
4. Private Charter, with the image and text order reversed.
5. A right-aligned Inquiry close.

The Refit, Interiors and Amenities, Cabins, Toys and Tenders, Charter Details and Gallery no longer sit in the homepage scroll. They are available through the top-right Menu and open as individually targeted chapters in `discover.html`.

This structure replaces the previous sequence of repeated full-width photographs and large copy blocks. The design now uses one idea per viewport, two controlled editorial splits, and progressive disclosure for administrative detail.

## Hero

The approved ten-second hero loop, crop, scrim, live-text SS Delphine wordmark and tagline remain unchanged. The gold monogram was removed only from the central hero lockup. The supplied gold monogram remains in the fixed header.

Hero encodes:

- `media/hero/delphine-hero-1080.webm`, 3.60 MB
- `media/hero/delphine-hero-1080.mp4`, 4.23 MB
- `media/hero/delphine-hero-720.mp4`, 1.65 MB
- `media/hero/delphine-hero-480.mp4`, 0.55 MB
- matching JPG, WebP and AVIF posters, with WebP used on the page

## Signature statement

The new statement is:

> Built in 1921 for the Dodge family, SS Delphine still sails under the original engines she was designed for.

The raw sentence stays in the HTML for JavaScript-off reading. Enhancement creates one exact visually hidden copy and one `aria-hidden` visual copy. Words remain non-breaking units while each grapheme receives its own fill span.

The statement is the only scroll-driven animation. It fills forward and un-fills in reverse. The unfilled state is now a 14 percent cream tint, creating a clear visual difference from the fully lit cream characters. Desktop uses 180 viewport heights of section depth; mobile uses 150. Reduced motion removes the extra distance and renders every character fully lit. JavaScript-off also renders the raw sentence fully lit.

## Homepage imagery

The Yacht uses the client-selected `topviewssd.png`. Its portrait top-down composition preserves the complete vessel and is intentionally different from the hero orbit. Production derivatives:

- `media/gallery/yacht-topview-959.avif`, 118 KB
- `media/gallery/yacht-topview-959.webp`, 203 KB
- `media/gallery/yacht-topview-640.avif`, 65 KB
- `media/gallery/yacht-topview-640.webp`, 124 KB

Private Charter uses the supplied promenade-deck photograph. Its long teak perspective provides a quieter human-scale counterpoint to the aerial yacht image.

## Navigation and deeper content

Menu is the only top-right navigation control at every width. It opens a native modal `dialog`, which supplies focus containment and native Escape handling. Menu and Close have 48 pixel minimum targets. On short 320 pixel screens the menu scrolls, the Close row remains sticky, and the final Gallery link remains reachable.

`discover.html` begins with a seven-chapter index. Hash targets reveal only the selected chapter, so deeper information remains available without recreating a second brochure-length page. This target behavior works without JavaScript. The Gallery retains manual arrows, keyboard arrows and native swipe; it never advances automatically.

Technical Specifications now sits directly below The Yacht copy as a body-font link with a close gold underline and an open arrow. A normal click opens all thirteen rows in a native modal dialog with a dark backdrop, offset shadow, sticky Close control, focus restoration and Escape handling. The same facts remain available at `discover.html#technical-specifications` through the Menu, modifier-clicks, unsupported-dialog browsers and JavaScript-off navigation.

## Inquiry and launch constraints

The final section is named Inquiry, not Contact. It remains a styled placeholder because no approved email address, phone number, form handler or legal consent text has been supplied. No live form, `mailto:` or `tel:` link exists.

Privacy and imprint pages remain marked as awaiting client-approved text. `robots.txt` continues to block crawl until the canonical production domain and launch approval are confirmed.

## Design system

The existing navy, gold and cream palette and the Archivo plus IBM Plex Mono type system remain unchanged. No new colour, font or UI library was introduced. Gold remains restricted to the supplied mark, focus treatment and hairline detail.

No second scroll animation, reveal animation, card grid, gradient treatment, 3D scene or autoplaying gallery was added.

## Verification

- `npm test`: pass
- `node tests/server-check.mjs http://127.0.0.1:8765/`: pass, 19 representative resources
- `npm audit --omit=dev`: zero vulnerabilities
- JavaScript: 2,986 bytes gzipped, below the 40 KB budget
- Google Chrome 152 real-render pass: desktop 1440 by 900, tablet 1024 by 768, mobile 390 by 844, 320 by 568 and mobile landscape 844 by 390
- Statement verified at start, midpoint, completion and reverse on desktop and mobile, with the 14 percent pre-fill state visibly distinct
- Reduced-motion and JavaScript-off statements verified fully lit
- Technical Specifications verified through Close, Escape, backdrop click, focus restoration, 320 pixel modal scrolling, Menu navigation and JavaScript-off deep routing
- All tested pages: zero horizontal root overflow, zero broken images, zero console errors, zero page errors, zero failed requests and zero HTTP errors

Evidence:

- `/private/tmp/ssdelphine-current-qa/report.json`
- `/private/tmp/ssdelphine-current-qa/desktop-yacht.png`
- `/private/tmp/ssdelphine-current-qa/desktop-specifications-open.png`
- `/private/tmp/ssdelphine-current-qa/mobile-320-specifications-open.png`
- `/private/tmp/ssdelphine-redesign-qa/desktop-full-page-closed.png`
- `/private/tmp/ssdelphine-redesign-qa/desktop-menu-open.png`
- `/private/tmp/ssdelphine-redesign-qa/mobile-320-menu-bottom.png`
- `/private/tmp/ssdelphine-redesign-qa/discover-index.png`

## Run and deploy

This is a static site with no build step.

```sh
cd /Users/Guedst/Documents/SSDELPHINE
python3 -m http.server 8765
npm test
node tests/server-check.mjs http://127.0.0.1:8765/
```

Before launch, replace the inquiry and legal placeholders, confirm the canonical production domain, populate `sitemap.xml`, and change `robots.txt` only after crawl approval. A physical iPhone remains the device-specific check for autoplay, decoding and Low Power Mode.
