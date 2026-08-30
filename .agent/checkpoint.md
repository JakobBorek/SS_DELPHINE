# Checkpoint 2026-08-30T18:47Z — joint budget pause

## Live
- Netlify (primary, CI from main): https://ss-delphine.netlify.app
- Vercel (still live, CI from main):  https://ss-delphine.vercel.app
- Repo: https://github.com/JakobBorek/SS_DELPHINE — now PUBLIC
- HEAD 5021582, clean tree, both hosts green on all 21 served checks.

## Done today (after the earlier handover)
- Netlify cutover finished: public, CI connected, security headers matched to
  Vercel, .webmanifest MIME fixed (Netlify has no default mapping for it).
  Repo had to go public: Netlify's Free plan refuses private-repo builds
  ("Unrecognized Git contributor"), and neither commit identity satisfied it.
- Brand lockup: the supplied SS_Delphine_Logo_Smooth_Vector_Clean.svg replaces
  the monogram+wordmark in the header and menu on both pages. Recoloured to
  --gold and viewBox tightened to the ink extents (74 19 442 240) — without
  that trim it renders ~25% too small and is illegible at header scale.
- AI image removed: yacht-aerial-* ("Underway") deleted, all references gone,
  404 on production. A test now FAILS if it is ever referenced again.
  NOTE: yacht-topview-* is NOT the same image — it is a genuine drone frame
  from DJI_20260808171215_0027 (at anchor, tender alongside). Keep it.
  Do not regenerate anything from delphine-ref-clean.png / delphine-ref-2x.*,
  which are the synthetic source.
- Gallery rebuilt: opens as five chapter banners (Deck & Exterior, Salons &
  Dining, Cabins, Wellness, Heritage & Engineering) instead of 33 photographs
  at once. Choosing one shows only that chapter, with a way back.
- Lightbox: arrows are now scoped to the open chapter and wrap at its ends.
  The photo-over-the-footer bug was real: the image was sized with
  max-height calc(100dvh ...) so it could exceed its grid row. Now sized by the
  row with overflow:hidden on the figure. The mobile override had the same bug.
- Opened to AI agents: robots.txt allows all and names ten agents explicitly;
  removed the noindex meta from discover.html (the main content page).
  privacy/imprint/404 keep noindex — placeholders.

## Open decisions for the user
1. INQUIRY still uses the cream/navy/gold card: 8px gold border, drop shadow,
   gold button fills, plus a disabled form. Conflicts with spec section 4
   ("No cards... no bordered boxes... never a gold button") AND the user's own
   "it can only display text for now". Display-only version recoverable:
   git checkout 7015178 -- index.html
2. STATEMENT is missing the spec's payload sentence ("She still needs six hours
   to raise steam before she can leave a berth"). Fact survives in Charter.
3. Legal pages are placeholders; contact details all "To be confirmed".
4. Site is now fully indexable by search engines while in this state. If that is
   unwanted, add X-Robots-Tag: noindex in netlify.toml — agents still fetch,
   nothing gets indexed.
5. Gallery intro copy was updated 34 -> 33; may want rewording.

## Traps already paid for
- .gitignore does not untrack indexed files (assets/fonts/.claude-flow survived).
- macOS is case-insensitive: `*.MP4` also ignored the lowercase web hero videos.
- .vercelignore does not inherit .gitignore; the CLI tried to upload 5GB.
- Chrome headless: min window width ~500px (use an iframe harness for 375);
  scrollTo(x,y) does not scroll under --virtual-time-budget (use behavior:'instant').
- Removing CSS rules by regex can leave dangling selectors that silently merge
  into the next rule. Stylelint will not catch it; a screenshot will.

## Codex
Budget-locked; the bridge refuses to forward. Estimated reset 2026-09-06 05:22.
