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

The Yacht uses a daylight broadside frame from the supplied `DJI_20260808170912_0026_D.MP4` at 32 seconds, replacing the dusk frame the owner found too dark. The vessel occupies most of the wide frame, keeping its complete silhouette legible in the desktop split and at phone width without becoming a tall inserted slab. Production derivatives:

- `media/gallery/yacht-daylight-side-1600.avif`
- `media/gallery/yacht-daylight-side-1600.webp`
- `media/gallery/yacht-daylight-side-960.avif`
- `media/gallery/yacht-daylight-side-960.webp`

The portrait `topviewssd.png` remains available as a vertical composition in the Gallery. Private Charter uses a client-supplied photograph of the deck table laid for dinner at sea, which replaced the promenade-deck frame. It is the first homepage image that shows the yacht dressed for guests rather than empty, which is what the section is selling. The promenade-deck photograph stays in the Gallery. Still no supplied still depicts guests themselves, so a rights-cleared photograph with people in it remains outstanding.

Both editorial sections now carry their copy as a single paragraph rather than three or four separate ones, at the owner's request: the gaps between short paragraphs read as disconnected fragments against the very large section titles.

## Navigation and deeper content

Menu is the only top-right navigation control at every width. It opens a native modal `dialog` as a shadowed right-hand drawer with a visible gold leading edge. The fixed two-line control remains in place while its bars morph into an X, and internal navigation waits for the exit transition before changing pages. Menu and Close have 48 pixel minimum targets. On short 320 pixel screens the menu begins at the top and scrolls without losing its first or last link.

`discover.html` begins with a seven-chapter index. Selecting a chapter hides that index and reveals only the chosen material, so users cannot scroll back into “Explore SS Delphine” while reading a deep route. CSS handles the no-JavaScript route; a tiny hash synchronizer covers browsers without `:has()`. The Gallery is a 28-image editorial mosaic with five categories, filter controls and an accessible native-dialog lightbox. It never advances automatically; keyboard arrows and explicit previous/next controls remain available.

Technical Specifications now sits directly below The Yacht copy as a body-font link with a close gold underline and an open arrow. A normal click opens all thirteen rows in a native modal dialog with a dark backdrop, offset shadow, sticky Close control, focus restoration and Escape handling. The same facts remain available at `discover.html#technical-specifications` through the Menu, modifier-clicks, unsupported-dialog browsers and JavaScript-off navigation.

## Inquiry and launch constraints

The final section is named Inquiry, not Contact. It remains a styled placeholder because no approved email address, phone number, form handler or legal consent text has been supplied. No live form, `mailto:` or `tel:` link exists.

Privacy and imprint pages remain marked as awaiting client-approved text. `robots.txt` continues to block crawl until the canonical production domain and launch approval are confirmed.

## Design system

The existing navy, gold and cream palette and the Archivo plus IBM Plex Mono type system remain unchanged. No new colour, font or UI library was introduced. Gold remains restricted to the supplied mark, focus treatment and hairline detail.

No second scroll animation, reveal animation, gradient treatment, 3D scene or autoplaying gallery was added. The expanded Gallery uses an asymmetric editorial mosaic rather than a repetitive card grid.

## Verification

- `npm test`: pass
- `npm run test:served`: pass, 21 representative resources
- `npm audit --omit=dev`: zero vulnerabilities
- JavaScript: 3,982 bytes gzipped, below the 40 KB budget
- Earlier Google Chrome 152 real-render evidence covers the prior desktop, tablet and phone refinement. A fresh in-app browser pass was unavailable for this final gallery/menu revision because the live browser registry returned no browser instances.
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
- `/private/tmp/ssdelphine-gallery-selection.jpg`

## Run and deploy

This is a static site with no build step.

```sh
cd /Users/Guedst/Documents/SSDELPHINE
python3 -m http.server 8765
npm test
node tests/server-check.mjs http://127.0.0.1:8765/
```

Before launch, replace the inquiry and legal placeholders, confirm the canonical production domain, populate `sitemap.xml`, and change `robots.txt` only after crawl approval. A physical iPhone remains the device-specific check for autoplay, decoding and Low Power Mode.

## Deviations from the build spec

These depart from explicit instructions in `ss-delphine-BUILD.md`, as opposed to
decisions the brief left open. Each was deliberate. They are listed here so the
client can accept or reverse them rather than discover them.

**1. Page structure (spec section 6).** The brief specifies one page with ten
sections, eight of them in the menu. The homepage now carries five (Hero,
Statement, The Yacht, Private Charter, Inquiry) and the remaining material lives
in `discover.html`, reached through the menu. The reason is the brief's own
priority: "One idea per screen" and "a fast, quiet, expensive site where the
photography does the work". Ten sections on one scroll read as a brochure. No
content was dropped; every fact from section 8 is still on the site.

**2. Statement text (spec section 5).** The brief gives the statement copy as
"The text, exactly:" and names the closing sentence about six hours to raise
steam as "the payload". The statement now reads:

> Built in 1921 for the Dodge family, SS Delphine still sails under the original
> engines she was designed for.

The character-level fill needs a shorter line to stay legible on a phone without
three screen-heights of scroll. The two facts that were cut both survive:
"the last operational privately owned steam yacht of her size" appears in The
Yacht, and the six-hour boiler notice appears in Charter on both pages. The
signature moment no longer carries the payload sentence, which is a real loss
against the brief's intent and the first thing to reconsider if the client wants
it back.

**3. Statement unlit contrast.** `--statement-dim` is `rgb(242 237 227 / 0.14)`,
which composites to #2A3442 on `--navy-deep`: a measured **1.44:1**. That is
below the brief's 4.5:1 floor. The unlit state is transient and fills as the
reader scrolls; `prefers-reduced-motion` and the JavaScript-off path both render
the sentence fully lit at 15.54:1, which is the accessible route. Lighthouse
still reports accessibility 100. This is a deliberate trade: raising the unlit
value far enough to pass would collapse the contrast between unlit and lit and
destroy the effect. Recorded as a known, accepted variance rather than a pass.

**4. Navigation breakpoint (spec section 6).** The brief says the menu collapses
below 768px. Eight nav items in the mono face could not sit on one line at 769px
without clipping. Resolved by keeping the specified breakpoint and compressing
the 769-899px band, then superseded entirely when navigation became a single
Menu control at every width.

**5. Logo.** The brief states "Raster only. No vector exists." A vector was
supplied late in the build (`SS_Delphine_D_vector.svg`, the Dodge blackletter
monogram) and is used instead, so the mark stays sharp at every density. It
appears in the header and favicons; the hero carries the wordmark alone.


## Interiors and Amenities, 2026-09-01

The heading, back link and intro copy used to render below the amenity tiles, so the page
opened on photographs with no explanation. The copy block now precedes the grid in the
markup, which fixes the reading order on a phone and puts the copy on the left on a wide
screen, matching the Suites & Cabins panel. The `discover-panel--reverse` class was dropped
from this panel: it only ever targeted `.discover-panel__media`, which this panel does not
have, so it was inert.

Two tiles were added, Delphine Lounge and Smoking room, reusing the Gallery photographs of
the same rooms.


## Copy, 2026-09-01 (second pass)

"Hammam" is now "Turkish bath" everywhere a reader sees it: the Interiors tile, the
Wellness gallery slide, both alt strings and the intro line, which now reads "An
eight-seat Turkish bath". The image files keep their `hammam-*` names.

"Inquiry" is now "Enquiry" throughout, including the section heading, the kicker, the
form title, its legend, the enquiry-type options and the submit button. The section
anchor moved from `#inquiry` to `#enquiry`, with a 308 from `/inquiry` on both hosts.
The `.inquiry*` CSS classes and the `.inquiry-form` hooks keep their names: this was a
copy change, not a refactor, and renaming them would touch four stylesheets for no
visible difference.


## The hero play button, 2026-09-01 (permanent)

**It must never appear again. Do not undo the mechanism below.**

Cause: iOS refuses autoplay under Low Power Mode, Low Data Mode and some privacy
settings. WebKit then paints its own start-playback glyph over the frame. Hiding
`::-webkit-media-controls-start-playback-button` and its siblings, which this site
had done since August, does not reliably remove it on iOS. That is why it kept
coming back after each attempted fix.

Mechanism: an `<img class="hero__still">` carrying the video's own first frame
sits **on top of** the video with identical `object-fit` and `object-position`,
covering whatever WebKit paints there. It is removed only once the `playing`
event has fired, which js/nav.js records as `data-playing` on the section. The
video itself carries `pointer-events: none` so the glyph can never be pressed.

**The video must never be given `opacity: 0`.** The first version of this fix did
exactly that, hiding the video until it played, and it stopped autoplay outright:
Safari will not autoplay a video it treats as not visible, so the clip only
started after a tap. Cover the video, do not hide it.

Phones also take `delphine-hero-720.mp4` (0.6 MB) rather than the 1080 encode
(2.4 MB), because a video that is slow to buffer is a video iOS gives up on.

Guarded by six assertions in tests/site-check.mjs: the still must exist, must not
lazy-load and must follow the video in the markup; the video must carry no
`controls`, must keep `pointer-events: none`, and must **not** carry
`opacity: 0`.

## The enquiry form, 2026-09-02

Live. A visitor submits, `api/enquiry.js` sends one email, and it lands in
`inquiries.ssdelphine@gmail.com`. The visitor is never emailed: they get an
on-page confirmation instead, which is what removes the need for a domain.

Routed through Resend. Its free tier will only send to the address that opened
the account, which is exactly why the account was opened with the enquiries
address rather than a personal one. Nothing had to be verified by anyone holding
`ssdelphineyacht@gmail.com`, and no DNS was touched.

Two earlier routes are still wired behind it and pick themselves up from whatever
credentials are present, in this order: Gmail SMTP (`GMAIL_USER` plus
`GMAIL_APP_PASSWORD`), then Brevo (`BREVO_API_KEY`), then Resend
(`RESEND_API_KEY`). Gmail SMTP was abandoned because Google would not enable
two-step verification on the new account, and without that there is no app
password; the account password will not authenticate, Google having withdrawn
password SMTP in 2022. Brevo was abandoned because it demands company name and
registered address, which are a client's details to invent.

Configuration is entirely in Vercel's environment, so none of it needs a code
change: `RESEND_API_KEY`, and `ENQUIRY_TO` for the destination. `ENQUIRY_FROM`
and `SITE_ORIGIN` are optional overrides.

### Verified live on the deployed endpoint

| Case | Result |
|---|---|
| Genuine enquiry | 200, delivered |
| Honeypot field filled | 200, nothing sent, so a bot learns nothing |
| Required fields empty | 400 |
| Malformed address | 400 |
| GET | 405 |

### At handover

Max needs the `inquiries.ssdelphine@gmail.com` login and the Resend account that
sits on it. If he wants enquiries in `ssdelphineyacht@gmail.com` as well, that is
Gmail forwarding set from inside the enquiries account, not a code change.

Sending straight to `ssdelphineyacht@gmail.com` needs a verified domain in
Resend, which needs the GoDaddy DNS for `ssdelphineyacht.com`. See the note on
that domain's existing SPF and DMARC before touching it.
