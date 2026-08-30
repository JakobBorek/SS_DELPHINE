# Checkpoint 2026-08-30T17:05Z — Codex paused, Claude solo

## Task
SS Delphine production site. Spec: ~/Downloads/ss-delphine-BUILD.md
Repo: https://github.com/JakobBorek/SS_DELPHINE (PRIVATE). Local: ~/Documents/SSDELPHINE

## State
- HEAD 5a5c11b, pushed, clean tree.
- Vercel: LIVE at https://ss-delphine.vercel.app (auto-deploys from main).
- Netlify: LIVE at https://ss-delphine.netlify.app (manual CLI deploy only so far).
- BOTH hosts currently serve the site. Cutover is INCOMPLETE.

## Codex paused
Codex hit its 5h line at 17:04Z; window resets 2026-09-06 05:22 Beijing.
Do not delegate to it until then. It was mid-way through the Netlify migration.

## Netlify cutover — DONE except CI (verified by Claude 17:20Z)
- Netlify is PUBLIC and CURRENT. Rebuilt dist and redeployed after the user
  approved visibility; it had been stale from 17:01.
- netlify.toml: publish=dist, six security headers carried over, pretty_urls,
  no SPA fallback. Verified identical headers to Vercel (HSTS max-age differs
  1y vs 2y, immaterial).
- Fixed a real host difference: Netlify has no default MIME mapping for
  .webmanifest and served application/octet-stream. Explicit [[headers]] rule
  added. Committed f9b2d0e.
- BOTH hosts pass all 21 served-resource checks.
- Leak paths verified 404 on Netlify: /does-not-exist, the drone master,
  /assets/fonts/.claude-flow/policy/state.json, /_source/photography.

### THE ONE REMAINING STEP — needs the browser, not the CLI
Netlify has NO continuous deployment. `netlify api getSite` -> repo_url: NONE.
The GitHub OAuth did not complete. Pushes to main update Vercel ONLY.
Fix: app.netlify.com/projects/ss-delphine -> Site configuration ->
Build & deploy -> Link repository -> JakobBorek/SS_DELPHINE, branch main.
Until that is done, deploy Netlify by hand: npm run build && npx netlify deploy --prod --dir=dist

### DO NOT PAUSE VERCEL YET
Vercel is currently the only host with working CI, so it is the safety net.
Pause it only after Netlify CI is confirmed. When that time comes (reversible):
   POST https://api.vercel.com/v1/projects/prj_4awldaOjRrrUwf3SfbKv1L3gytP4/pause
   ?teamId=team_LF1ybXzCmIlD0nr8SHMagMop
5. After cutover: remove vercel.json and .vercelignore, update docs.

## Outstanding — content/design decisions for the user
- INQUIRY: currently a cream/navy/gold card with 8px gold border, drop shadow,
  gold button fills, and a disabled form. Conflicts with spec section 4
  ("No cards... no bordered boxes... never a gold button") AND with the user's
  own instruction "it can only display text for now". UNRESOLVED. The
  display-only version is recoverable: git checkout 7015178 -- index.html
- STATEMENT: the spec's payload sentence ("She still needs six hours to raise
  steam before she can leave a berth") is no longer in the signature moment.
  Fact survives in Charter. Recommend restoring it.
- Legal pages privacy.html / imprint.html are still placeholders.
- Contact details are all "To be confirmed". No approved email/phone/office.
- Charter event photo: none of the 168 owned stills shows people. The one
  authentic event photograph found is copyrighted by Nathalie Oundjian and
  must NOT ship without written commercial permission.

## Lessons that cost time (do not repeat)
- .gitignore does NOT untrack files already in the index. Nested
  assets/fonts/.claude-flow survived the root removal until 5a5c11b.
- macOS is case-insensitive: a `*.MP4` rule also ignored the lowercase web
  hero videos, so Safari/iOS had no playable source until it was caught.
- .vercelignore does not inherit .gitignore; the CLI tried to upload 5GB.
- Chrome headless: --window-size below ~500px silently renders at 500 and
  crops. Use an iframe harness to test 375px. scrollTo(x,y) does not scroll
  under --virtual-time-budget because scroll-behavior is smooth; use
  scrollTo({top, behavior:'instant'}).
- Vercel blocks private-repo deploys when the commit author is not associated
  with the project owner. Repo-local identity is set; keep it.

---

## UPDATE 2026-08-30T17:25Z — Netlify verified by Claude (supersedes the section above)

Netlify is PUBLIC, CURRENT and VERIFIED. The user approved visibility; the 401 is gone.
- Rebuilt dist and redeployed (it was stale from 17:01, before commits 5a5c11b / 76d4ad4).
- Fixed a real host difference: Netlify has no default MIME mapping for .webmanifest
  and served application/octet-stream. Explicit [[headers]] rule added in netlify.toml.
  Committed f9b2d0e.
- BOTH hosts pass all 21 served-resource checks.
- All six security headers identical on both (HSTS max-age 1y vs 2y, immaterial).
- Leak paths verified 404 on the live Netlify URL: /does-not-exist,
  /DJI_20260808103538_0018_D.MP4, /assets/fonts/.claude-flow/policy/state.json,
  /_source/photography.
- dist build: 185 files, 32MB, no dotfiles, no masters.

### ONLY REMAINING CUTOVER STEP — browser, not CLI
Netlify has NO continuous deployment. `netlify api getSite` returns repo_url: NONE;
the GitHub OAuth never completed. Pushes to main update VERCEL ONLY.
  Fix: app.netlify.com/projects/ss-delphine
       -> Site configuration -> Build & deploy -> Link repository
       -> JakobBorek/SS_DELPHINE, branch main
Until then, deploy Netlify manually:
  npm run build && npx --yes netlify@latest deploy --prod --dir=dist

### DO NOT PAUSE VERCEL YET
Vercel is the only host with working CI right now, so it is the safety net rather
than redundancy. Pause it only after Netlify CI is confirmed working.

## Codex status
Budget-locked. The bridge REFUSES to forward messages to it (budget_paused);
estimated reset 2026-09-06 05:22 Beijing. Its last recap still believes Netlify
returns 401, which is out of date. Claude is solo.
