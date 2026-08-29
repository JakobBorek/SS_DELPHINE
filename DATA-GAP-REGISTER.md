# SS Delphine Data Gap Register

This register tracks every launch-blocking fact or asset that the owner has not yet confirmed. No third-party web source may be used to fill these fields. Until approval, the website displays **“To be confirmed”** and keeps any dependent action disabled.

| ID | Required item | Current status | Website location | Safe interim behaviour | Resolution needed |
|---|---|---|---|---|---|
| DG-01 | Length overall (metric and imperial) | Missing | Specification | Visible placeholder | Owner-approved figure and units |
| DG-02 | Beam (metric and imperial) | Missing | Specification | Visible placeholder | Owner-approved figure and units |
| DG-03 | Draft (metric and imperial) | Missing | Specification | Visible placeholder | Owner-approved figure and units |
| DG-04 | Gross tonnage | Missing | Specification | Visible placeholder | Owner-approved figure |
| DG-05 | Crew count and crew-to-guest ratio | Missing | Specification | Visible placeholder | Owner-approved count and presentation |
| DG-06 | Flag and port of registry | Missing | Specification, footer | Visible placeholder | Owner-approved wording |
| DG-07 | Classification society | Missing | Specification | Visible placeholder | Owner-approved wording |
| DG-08 | Weekly charter rates, high and low season | Missing | Rates | Visible placeholders | Currency, amounts and applicable dates |
| DG-09 | APA percentage and VAT treatment | Missing | Rates | Visible placeholder | Terms by approved cruising ground |
| DG-10 | Delivery and redelivery terms | Missing | Rates | Visible placeholder | Central-agent wording |
| DG-11 | Event and day-charter pricing | Missing | Events, Rates | Visible placeholder | Pricing and terms |
| DG-12 | Summer and winter cruising grounds | Missing | Cruising | Visible placeholders; no map | Approved destinations and map scope |
| DG-13 | Availability windows | Missing | Cruising | Visible placeholder | Approved public availability |
| DG-14 | Central agent name, company, phone and email | Missing | Enquiry, footer | Visible placeholders; no public address | Complete approved public contact details |
| DG-15 | Public relaunch/refit-completion phrasing | Needs confirmation | Refit, Specification, History | Use verified date range only; avoid “relaunched” | Approval of public statement |
| DG-16 | Captain and chef names or biographies | Not supplied | Not rendered | Omitted | Approval and biographies, if desired |
| DG-17 | Photography selection, alt text, credits and rights | 168 originals staged; rights unconfirmed | All media slots | Text placeholders only; originals remain outside production media | Per-image editorial selection and written rights clearance |
| DG-18 | Archival history milestones and imagery | Not supplied | History | Only owner-verified 1921 commission and 2024–25 refit shown; visible archive placeholder | Owner archive, dates, captions and rights |
| DG-19 | Final landscape intro master | Working file only | Intro | Media source remains unshipped; graceful static fallback | Approved 1080p master and duration |
| DG-20 | Portrait intro master | Not generated | Intro | No portrait source; static fallback | Approved portrait master |
| DG-21 | Intro poster image | Not supplied | Intro | CSS/static fallback | Approved poster under LCP budget |
| DG-22 | Deck plans and publication approval | Not supplied | Plans | Omitted | Approved files, text summaries and permission to publish internal layouts |
| DG-23 | Broker brochure PDF | Not supplied | Brochure | Disabled control with visible status | Approved accessible PDF |
| DG-24 | Third-party form endpoint | Not selected | Enquiry, CSP | Submit control disabled; form submission and connections remain self-only | Approved provider/public POST endpoint, then add its origin to CSP `form-action` and `connect-src` |
| DG-25 | Canonical production domain | Not supplied | Metadata, sitemap, robots | Canonical and sitemap URL omitted; `robots.txt` blocks crawling pre-launch; never point to preview | Exact HTTPS origin and explicit launch approval |
| DG-26 | Redirect inventory from existing site | Not audited | Deployment config | No redirects guessed | Current production URL export and redirect mapping |
| DG-27 | Open Graph share image | Not approved | Social metadata | Text metadata only; no generic image | 1200 × 630 approved artwork |
| DG-28 | Favicon and Apple touch icon | Not supplied | Metadata | Omitted | Approved icon set and manifest details |
| DG-29 | Legal information | Not supplied | Footer | Visible placeholder | Owner/agent-approved legal wording |
| DG-30 | Structured data completion | Blocked by confirmed principal particulars, rates and canonical origin | Metadata | Omitted; no inline JSON-LD under the locked CSP | Resolve DG-01–DG-14 and DG-25, then approve Product + Vehicle representation |

## Derived values

- Fuel figures display calculated US-gallon equivalents, rounded to the nearest whole US gallon: 500 L/h → 132 US gal/h; 800 L/h → 211 US gal/h; 1,000 L/h → 264 US gal/h.
- The source brief says “hundreds of specialists, engineers, craftsmen and marine professionals.” The page uses the inclusive spelling “craftspeople” without changing the factual claim.

## Editorial controls

- Source imagery remains in ignored `_source/` directories and is not copied into `/media/` before DG-17 is resolved.
- The working `ssdvideo.mp4` remains ignored and is not transcoded or promoted before DG-19 is resolved.
- No form submission, brochure download, map link, email address, canonical URL, redirect or structured price data becomes active until its source item is approved.
