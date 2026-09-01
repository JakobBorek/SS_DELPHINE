# ASSETS — SS Delphine

Phase 0 inventory. Video, logo and type. Photography inventory is in `ASSETS-PHOTOS.md`.

## Video masters

All drone footage is 4K (3840x2160), H.264, no usable audio. None is committed; `.gitignore` excludes `*.MP4`.

| File | Resolution | Duration | FPS | Size | Bitrate |
|---|---|---|---|---|---|
| DJI_20260808103538_0018_D.MP4 | 3840x2160 | 19.7s | 48 | 255 MB | 109.2 Mb/s |
| **DJI_20260808170912_0026_D.MP4** | 3840x2160 | 158.0s | 60 | 1715 MB | 91.0 Mb/s |
| DJI_20260808171215_0027_D.MP4 | 3840x2160 | 31.2s | 50 | 397 MB | 106.8 Mb/s |
| DJI_20260808202454_0096_D.MP4 | 3840x2160 | 17.2s | 30 | 185 MB | 90.3 Mb/s |
| DJI_20260808202557_0098_D.MP4 | 3840x2160 | 79.6s | 30 | 786 MB | 82.9 Mb/s |
| DJI_20260808203149_0068_D.MP4 | 3840x2160 | 78.3s | 30 | 773 MB | 82.9 Mb/s |
| DJI_20260808205742_0080_D.MP4 | 3840x2160 | 68.6s | 48 | 846 MB | 103.4 Mb/s |
| ssdvideo.mp4 | 1920x1080 | 8.0s | 24 | 35 MB | 37.1 Mb/s |

### Hero: DJI_20260808170912_0026_D.MP4, t=39.0 to t=49.0

Chosen because it is the only clip that delivers the brief's "three-quarter side angle" with the
yacht **isolated on open water**. Every other exterior puts the Monaco coastline, other
superyachts or a tender directly behind the hull, which reads as a marina snapshot rather than a
portrait. In this window the sea and sky are the only backdrop, the funnel and both masts read
clearly, and the hull occupies the frame without competition.

Frame-by-frame checks that shaped the in-point:
- There is a **fast pan away from the yacht between t=35 and t=37**. Starting earlier than t=38
  puts a shot of empty sea and sun glare inside the loop.
- A dark tender enters frame left around t=48 and the coastline reappears by t=52, so the window
  closes at t=49.
- The drone is in a slow orbit through the whole window, so the motion is continuous with no cut.

**Runners-up, in order:**
1. `DJI_20260808202557_0098_D.MP4` t=20-44. A genuinely beautiful dusk orbit, and the strongest
   *mood* in the set. Rejected as hero because the usable portion is dark enough that the navy
   scrim plus cream type over it would either wash the picture out or fail the contrast floor.
   It descends into deck close-ups after t=50. Its broadside frame at t=44 illustrated The Yacht
   until 2026-09-01, when the owner asked for something brighter; see the note below.
2. `DJI_20260808103538_0018_D.MP4`. Correct angle and daylight, but a white superyacht and a
   tender sit in frame throughout, and the coastline is busy.
3. `ssdvideo.mp4`. A top-down of the yacht underway in deep blue water with a full wake, and one of
   the strongest images in the set. **Not the hero because it is not a three-quarter side angle**,
   which the brief specifies. Its landscape still and the later `topviewssd.png` portrait remain in
   the categorised Gallery rather than the homepage.
4. `DJI_20260808205742_0080_D.MP4`. Night/dusk with Monaco lit behind. Atmospheric, too dark, and
   the city dominates.
5. `DJI_20260808171215_0027_D.MP4`. Top-down at anchor. Useful for the deck-plan or layout
   context, not for a hero.

### The Yacht plate: DJI_20260808170912_0026_D.MP4, t=32.0

The dusk broadside that first illustrated The Yacht read as dark and shadowed against the navy
ground, so it was replaced on 2026-09-01 with a daylight frame from the same clip the hero is cut
from, taken **seven seconds before the hero's in-point** so the two are not the same picture.

Why t=32: it is the last part of the orbit where the sea and sky are the only backdrop. From t=52
the Monaco coastline and a white superyacht enter frame, and every frame of
`DJI_20260808103538_0018_D.MP4` has both. The hull is lit from the front quarter, the funnel and
both masts clear the horizon, and the tender alongside gives the scale a reference.

Cropped 2880x1620 from +590+315 of the 3840x2160 frame, a 1.33x tightening so the complete vessel
fills the 16:9 plate, then resized to 1600x900 and 960x540. Derivatives:
`media/gallery/yacht-daylight-side-{960,1600}.{avif,webp}`. The superseded
`yacht-dusk-side-*` derivatives were deleted; the master clip is untouched and the frame above
regenerates them.

### Hero derivatives, in `media/hero/`

| File | Purpose | Size |
|---|---|---|
| `delphine-hero-1080.mp4` | H.264, 1920x1080, CRF 28, faststart, no audio | 4.23 MB |
| `delphine-hero-1080.webm` | VP9, 1920x1080, CRF 46 | 3.60 MB |
| `delphine-hero-720.mp4` | H.264, 1280x720, served to screens up to 700px | 0.62 MB |
| `delphine-hero-poster.jpg` | Poster, first frame of the loop (t=39) | 0.17 MB |
| `delphine-hero-poster.webp` | Poster | 0.09 MB |
| `delphine-hero-poster.avif` | Poster | 0.07 MB |

Budget was "under 6 MB for the hero". H.264 at CRF 25 came out at 6.79 MB and was rejected; CRF 28
lands at 4.23 MB with no visible blocking in the water or softening of the rigging, checked on a
1:1 crop. The poster is pulled from the clip itself so first paint is never black.

VP9 needed CRF 46, not the 36 first tried, which produced a 9.76 MB file **larger than the H.264**.
VP9's CRF scale is not comparable to x264's.

Mobile: no separate portrait crop. The yacht is a long horizontal object and any 9:16 crop cuts off
bow or stern. The brief permits `object-fit: cover` with a focal point instead, so the hero holds a
centre focal point that keeps the funnel and midships in frame at 375px. The 480p derivative is used
below 560px to keep the autoplay transfer below 0.6 MB without changing the approved ten-second loop.

## Logo

The client supplied `SS_Delphine_D_vector.svg` after the initial inventory. The production copy is
`assets/logo/ss-delphine-d.svg`, with the original artwork bounds preserved in its viewBox and the
mark held to the frozen gold token value.

Production derivatives:

- `assets/logo/ss-delphine-d.svg` for the header monogram
- `assets/logo/ss-delphine-d-512.png` as the high-resolution raster derivative
- `favicon.ico`, `apple-touch-icon.png`, `icon-192.png` and `icon-512.png`

The header pairs the supplied monogram with a live-text SS Delphine wordmark. Following the
homepage review, the hero itself uses the live-text wordmark without a second gold monogram.
The supplied artwork remains unchanged and is not traced or redrawn.

## Type

Self-hosted, no CDN call at runtime. All OFL.

| Role | Face | Files |
|---|---|---|
| Display | Archivo, width axis at 118 | `archivo-wdth-latin.woff2` (88 KB), `-latin-ext` (84 KB) |
| Body | Archivo, width axis at 100 | same files |
| Utility | IBM Plex Mono 400/500 | `plexmono-{400,500}-{latin,latin-ext}.woff2` (~9 KB each) |

Archivo's variable font carries a **width axis (`font-stretch: 62%-125%`)**, so one file supplies
both the expanded display cut the brief asks for and a normal-width body. The Archivo already in
the project was the weight-only build and does not expand; it has been superseded by the width-axis
build. `archivo-var-*.woff2` and the Instrument Serif files are unused by the new build.

IBM Plex Mono for the utility face over JetBrains Mono and Space Mono: the brief asks for "a ship's
builder plate and an engine room gauge label, not a code editor". JetBrains Mono is explicitly a
code face; Space Mono is a 1960s pastiche that turns quirky at the wide tracking this design uses.
Plex Mono is drawn from industrial signage and holds up uppercase at 11px with 0.16em tracking.

## Not used

- `1 UPPER DECK HD.zip` through `5 ORLOP DECK HD.zip` and their extracted folders — deck plans, ~360 MB.
  No section in the brief calls for a deck plan, and the brief forbids inventing one.
- `assets/fonts/instrument-serif-*.woff2` — the previous design's display serif. The brief calls for
  a sans display.
- `_source/manifest/` — production paperwork, not site content.
