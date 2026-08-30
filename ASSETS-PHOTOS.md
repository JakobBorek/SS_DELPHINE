# Photography inventory and production selection

Source inventory: 168 supplied JPEG photographs across five deck folders. All are landscape, predominantly 3:2. Source dimensions and file sizes remain recorded in `_source/manifest/images.csv`; originals remain excluded from deployment by `.gitignore`.

## Production selection

The homepage now uses a broadside dusk frame from the supplied `DJI_20260808202557_0098_D.MP4`. Both top-down compositions remain available in the Gallery.

| Source | Dimensions | Production use | Decision |
|---|---:|---|---|
| SS DELPHINE-1.jpg | 8177 × 5454 | Charter full-bleed image | Strong forward-deck symmetry and clear brass machinery detail. |
| SS DELPHINE-5.jpg | 8174 × 5452 | The Yacht full-bleed image | Best exterior detail of the varnished wheelhouse and teak side deck. |
| SS DELPHINE-8.jpg | 8185 × 5459 | Gallery | Strong centred wheelhouse composition with timber wheel and brass telegraphs. |
| SS DELPHINE-14.jpg | 7571 × 5050 | Gallery | Long covered promenade gives the gallery an exterior breath between interior frames. |
| SS DELPHINE-23.jpg | 8183 × 5458 | Interiors full-bleed image | Deep red salon is the most distinctive guest-space composition. |
| SS DELPHINE-32.jpg | 8034 × 5359 | Gallery | Symmetrical leather salon shows the darker timber register without repeating the red room. |
| SS DELPHINE-39.jpg | 8075 × 5386 | Gallery | Pale main salon broadens the interior palette and remains clean at a wide crop. |
| SS DELPHINE-47.jpg | 7429 × 4955 | Cabins full-bleed image | Strongest centred view of the H&A Dodge Suite. |
| SS DELPHINE-59.jpg | 7860 × 5243 | Gallery | Blue guest suite adds a second cabin treatment without duplicating the master frame. |
| SS DELPHINE-69.jpg | 1535 × 1024 | Gallery | Best centred dining-room composition; exported at source width rather than upscaled. |
| SS DELPHINE-151.jpg | 7443 × 4964 | Gallery | Clearest complete view of the gym equipment. |
| SS DELPHINE-157.jpg | 1478 × 986 | Gallery | Strongest symmetrical sauna frame; exported at source width rather than upscaled. |
| SS DELPHINE-165.jpg | 6036 × 4026 | Gallery | Tight engine-room controls provide a machinery detail between broad room views. |
| SS DELPHINE-168.jpg | 7923 × 5285 | The Refit full-bleed image | Most legible symmetrical view of the original steam machinery. |
| DJI_20260808202557_0098_D.MP4, t=44 | 1600 × 900 derivative | The Yacht editorial image | Broadside dusk exterior; the yacht fills most of the landscape frame on phone and laptop. |
| frame from ssdvideo.mp4 | 1600 × 900 derivative | Gallery | Complete vessel underway in a landscape overhead frame. |
| topviewssd.png | 959 × 1644 | Gallery | Client-selected portrait overhead view, preserved as the one vertical composition in the archive. |

Each selected deck photograph has AVIF and WebP derivatives at a maximum width of 960 and 1600 pixels in `media/gallery/`. Metadata is stripped. AVIF quality is 50 and WebP quality is 78. No selected image was upscaled.


## Expanded Gallery edit

The Gallery now carries 34 photographs in five explicit categories: Deck & Exterior (8), Salons & Dining (8), Cabins (8), Wellness (5), and Heritage & Engineering (5). Eighteen new subjects were selected from the supplied archive and exported in the same AVIF/WebP pipeline: pool deck, aft-deck lounge, alfresco dining, promenade landing, wide leather salon, main-salon lounge, wide formal dining, wide blue suite, cream guest cabin, striped guest cabin, cream double cabin, blue-banquette cabin, red guest cabin, hair salon, Jacuzzi, hammam, bridge controls and engine-room cylinder tops.

## Rejected from the production page

- The remaining near-duplicates were left out after the expanded 34-image edit so each retained angle adds new spatial information.
- Frames 66 to 68, 70 and 153 to 154 are approximately 1.5 megapixels. They were not selected where a stronger high-resolution composition existed.
- Bathroom close-ups were not used because the gallery already covers suites, wellness and machinery, and another polished interior detail would reduce variety.
- Alternate angles of the hair salon, Jacuzzi and hammam were rejected where the selected Gallery views documented those spaces more clearly.
- No supplied still clearly documents the toys, tenders or chase boat. That section therefore remains text-only rather than pairing factual copy with an unrelated photograph.
- No supplied still was used as a second hero. The approved drone loop and its matching poster remain the only hero media.
- None of the 168 supplied stills contains guests, a crowd or an event. A future Private Charter replacement therefore requires a rights-cleared owner or crew photograph rather than relabelling an empty deck.

## Removed — do not reuse

`yacht-aerial-*` (titled "Underway", top-down in vivid blue water) was AI-generated, not owned photography of SS Delphine. Deleted 2026-08-30. Do not reintroduce it or regenerate derivatives from `delphine-ref-clean.png` / `delphine-ref-2x.*`, which are the same synthetic source. The genuine top-down frame is `yacht-topview-*`, taken from drone clip DJI_20260808171215_0027.
