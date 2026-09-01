# Checkpoint 2026-09-01T22:20+02:00

## Task: Make the SS Delphine hero move immediately on iPhone without any gesture
## Live: https://ss-delphine.vercel.app | repo JakobBorek/SS_DELPHINE | HEAD 536b2f7

## Previously committed and live, do not redo
- Owner's supplied lockup is on all four marks; card and footer wordmarks are de-duplicated.
- Enquiry copy and contact details are live: ssdelphineyacht@gmail.com and +33 688 89 45 75.
- Statement scroll-fill dead distance was reduced from 394 px to 102 px.
- The hero still sits above the video and the video is never transparent.
- Hammam is now Turkish bath; Inquiry is Enquiry; `/inquiry` redirects to `#enquiry`.
- The sitewide focus ring was removed at the owner's instruction.
- Julius's 18-item pass shipped 17 items. The remaining item is the missing
  genuine "At anchor" clip described below.

## Completed locally, not yet committed or deployed
- Replaced the iOS tap/scroll retry fallback with an automatic WebKit-native
  path. Safari can select a silent H.264 MP4 inside an `<img>` via `<picture>`;
  WebKit treats it as a looping image rather than a media element, so it starts
  without video autoplay permission, a tap, a click, scrolling, or a play button.
- `index.html` now offers the existing 1080p hero MP4 at every viewport through
  the poster layer. Other browsers retain
  the normal muted, inline `<video>` and static WebP poster path.
- `.hero__video` remains fully visible and never receives `opacity: 0`.
  `.hero__still` still paints above it, so native WebKit controls cannot show.
- `js/nav.js` detects when WebKit selected the MP4 image, leaves that motion
  layer visible, and stops the redundant video decoder. The normal video retry
  no longer becomes permanently disabled after its first resolved `play()`.
- Removed all gesture-driven hero retries (`pointerdown`, `touchstart`,
  `keydown`, and `scroll`). No user action is a playback path.
- Added static and behavior regression coverage for both immediate paths:
  ordinary video autoplay and Safari MP4 image motion.
- Normalized the displayed phone number with non-breaking spaces, preserving
  its appearance while restoring the repository's HTML validation gate.
- Confirmed the live Vercel MP4 endpoint returns HTTP 206 byte ranges with
  `Content-Type: video/mp4`, which Safari needs for this delivery path.
- Copied this checkpoint into `HANDOFF.md`.

## Gate evidence on the current working tree
All passed cleanly after the final edits:

    npm test
    node tests/site-check.mjs
    node tests/behavior-check.mjs
    npx stylelint "css/*.css"
    npx eslint js/
    node scripts/build-dist.mjs

The in-app browser registry had no available browser instance. A physical
iPhone check is therefore still required after deployment, but the source now
uses WebKit's automatic MP4-image path specifically to avoid the autoplay block.

## Current working-tree files
- `.agent/checkpoint.md`
- `HANDOFF.md`
- `index.html`
- `css/hero.css`
- `js/nav.js`
- `tests/site-check.mjs`
- `tests/behavior-check.mjs`

`dist/` was rebuilt successfully and is ignored by git.

## In progress (integration boundary)
Repository `AGENTS.md` forbids Codex from running git write commands and reserves
commit/push work for the Claude integration owner. Claude was hard-stopped until
approximately 01:00, so no commit or deployment was attempted. Production is
still the old `536b2f7` build.

## Next steps
1. Integration owner reviews the focused diff and commits the seven files above.
   Suggested message: `fix(hero): guarantee automatic iPhone motion`
2. Deploy the committed tree with `npx vercel deploy --prod --yes`.
3. Verify production with
   `node tests/server-check.mjs https://ss-delphine.vercel.app/`
   and expect 21 HTTP 200 responses.
4. Test the production URL on the owner's iPhone without touching the screen.
   Test once normally and once with Low Power Mode enabled. Motion should begin
   through the MP4 image even if Safari refuses the underlying video element.
5. When supplied, place the owner's genuine 24 August clip at
   `media/gallery/at-anchor.mp4`; the markup and Gallery player are already wired.
6. Replace `privacy.html` and `imprint.html` only with client-approved legal copy.

## Hard constraints
- Never use `ssdvideo.mp4` for the Gallery. It is AI-generated, encoder=Google,
  exactly 8.000 seconds at 24 fps, and is not footage of SS Delphine.
- Never give `.hero__video` `opacity: 0`; Safari may treat it as invisible and
  refuse ordinary autoplay. The regression test enforces this.
- Never reintroduce gesture-triggered hero playback or a play button.
- No em dashes in visible copy. The vessel is always "SS Delphine"; the only
  sanctioned bare uses are "Delphine Suite" and "Delphine Lounge".
- No prices or invented facts.
- Do not draft legal text.

## Do not redo
- Do not re-diagnose the standard muted/autoplay/playsinline attributes; they
  were already present and were not sufficient on the owner's iPhone.
- Do not re-encode or replace the approved hero footage.
- Do not repeat the shipped owner-feedback rounds listed above.
