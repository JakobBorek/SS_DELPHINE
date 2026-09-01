# Checkpoint 2026-09-01T20:10Z
## Task: SS Delphine site — owner feedback rounds
## Live: https://ss-delphine.vercel.app | repo JakobBorek/SS_DELPHINE | HEAD 7b70e12

## Done this session
- New supplied lockup on all four marks; card + footer wordmark de-duplicated (eeee821)
- "Send an Enquiry" removed from the card; phone reads +33 688 89 45 75
- Statement scroll-fill retuned: dead scroll after the fill 394px -> 102px (990d1c6)
- Hero play button: still now sits ON TOP of the video, video never transparent (7b70e12)

## Next
1. Confirm with the client that the hero now autoplays on their phone. If it still
   does not, the remaining cause is iOS Low Power Mode / Low Data Mode, which no
   site can override — ask them to check Settings > Battery.
2. Item 11 still needs Max's 24 Aug video at media/gallery/at-anchor.mp4.
   NEVER substitute ssdvideo.mp4 — AI-generated (encoder=Google, exactly 8.000s).
3. privacy.html / imprint.html are still placeholder legal text; needs client copy.

## Never do
- Do NOT give .hero__video opacity: 0. It stops Safari autoplaying. Cover it with
  .hero__still instead. tests/site-check.mjs fails the build if this returns.
