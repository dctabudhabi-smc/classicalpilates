# classicalpilates.gr - new site (handover notes)

Static site. No build step, no server code.

## Publishing on GitHub Pages

The site is set up for **https://dctabudhabi-smc.github.io/classicalpilates/**.

1. Create a repository named `classicalpilates` under the `dctabudhabi-smc` account.
2. Upload everything in this package to the root of the repository (keep the folder structure, including the hidden `.nojekyll` file).
3. In the repository, go to Settings > Pages, set Source to "Deploy from a branch", branch `main`, folder `/ (root)`, and save.
4. The site appears at the address above after a minute or two.

All links between pages and to images use relative paths, so the site also works from any other address. Only the canonical links, Open Graph tags, structured data, `sitemap.xml` and `robots.txt` contain the full address. When the site moves to classicalpilates.gr, change those (search and replace `https://dctabudhabi-smc.github.io/classicalpilates` with `https://classicalpilates.gr`).

## Pages

| File | In menu | Notes |
|---|---|---|
| index.html | Yes | Home: hero, about me, the method, studio gallery, Pilates E-Motion, teacher training, conference, contact |
| about-me.html | Yes | Same text as the old page, plus a journey timeline and studio photos |
| about-pilates-method.html | Yes | Method text and quotes, Joseph Pilates archive grid, full classical repertoire (Mat, Reformer, Chair, Cadillac, Barrel) |
| pilates-emotion.html | Yes | New: the School, Roi as representative in Greece, Gloria Gasperi, APPI |
| teacher-training.html | Yes | New: brochure content without prices, plus program text from pilatesemotion.com (not the Master Program). Weekends / Intensive toggle: weekends = 3 weekends per M+R module, 2 per C+B+C module; intensive = Mon-Sat (M+R) and Mon-Thu (C+B+C) |
| athens-classical-pilates-conference.html | Yes | New past-tense version: what happened, presenters, photo grid, film, sponsors |
| athens-classical-pilates-conference-promo.html | No | The old promo content in the new style. Hidden from navigation, `noindex`, not in sitemap |

The old URLs (`/`, `/about-me.html`, `/about-pilates-method.html`, `/athens-classical-pilates-conference.html`) are unchanged, so existing links and search results keep working.

## Kept from the old site

- Google Tag Manager `GTM-KKJ4MVG` on every page.
- Titles and descriptions. Each page now has its own 1200 x 630 Open Graph image in `assets/img/og-*.jpg` (home, about me, the method, Pilates E-Motion, teacher training, conference; the hidden promo page uses the conference one).
- WhatsApp, email and Instagram links.
- favicon.ico.

The full capture of the old pages (text, meta tags, every asset and outbound link) was delivered separately as `classicalpilates-site-inventory.md`.

## Content still to supply

1. **Conference photos and video.** The photo grid on `athens-classical-pilates-conference.html` has Day 1 / Day 2 / Day 3 tabs. Day 1 currently uses the Athens, Kifisia and Semiramis photos from the old page; Day 2 and Day 3 show placeholder tiles (`<div class="ph">`). Replace each placeholder with an `<a … data-lightbox="conf-d2">` (or `conf-d3`) photo block like the Day 1 ones. The conference film (`assets/video/conference-2024.mp4`, 1:20) opens in a popup from the Film section and from the "Watch the film" button in the page header. The Acropolis drone clip is still used as a silent background on the home page and the conference header.
2. **Joseph Pilates archive photos.** The 12 archive photos and the hero portrait on the method page were supplied by the site owner on 18 October 2026. Photographer credits are not known; many historical Pilates photos are claimed under copyright, so confirm usage rights before publishing.
3. **More photos of Roi** for the About me page, if wanted.
4. Pilates E-Motion photos come from pilatesemotion.com. Confirm with Gloria that they can be used.

## How to add photos

Images are WebP in two sizes: `name-800.webp` (mobile) and `name.webp` (1600 px wide). To add a photo to a grid, copy an existing `<a>…</a>` block inside the grid, change the file names, and update `alt`. Masonry grids lay themselves out automatically.

## Motion and technology

- GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13, stored locally in `assets/vendor/` (no CDN dependency).
- Fonts: Cormorant Garamond and Lato from Google Fonts.
- Animations respect "Reduce motion" on phones and computers, and all content is visible without JavaScript.
- The intro animation plays once per visit on the home page.

## Notes

- `https://thepilateslink.net/` (a sponsor link from the old page) did not respond when checked on 18 October 2026.
- The hero line "for the last 15 years" is kept from the old site. Roi certified in 2008, so this may need updating.
