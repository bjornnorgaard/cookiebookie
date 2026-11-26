# 03 · Quality gates: Lighthouse, axe and image budgets

Status: **Done** (branch `feat/03-quality-gates`) · Size: **M** (about 3-4 h, plus the LCP fix below) · Depends on: nothing (best done before the bigger features so regressions are caught)

## Summary

Turn today's SEO-only Lighthouse check into a full performance / accessibility / best-practices / SEO gate, add a
real axe accessibility scan across pages and UI states, and add size budgets so photos and scripts cannot quietly
get heavier. A baseline was measured locally on 2026-11-20; it is recorded below.

## Baseline (local Lighthouse 13, production build, simulated throttling)

| Page | Device | Perf | A11y | Best pr. | SEO | LCP | TBT | CLS | Transferred |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | mobile | **80** | 100 | 100 | 100 | **5.3 s** | 40 ms | 0 | 544 kB (images 148 kB) |
| `/` | desktop | 97 | 100 | 100 | 100 | 1.2 s | 0 ms | 0 | 460 kB |
| `/lasagne` | mobile | 100 | 100 | 100 | 100 | 1.1 s | 20 ms | 0 | 441 kB (images 28 kB) |
| `/lasagne` | desktop | 98 | 100 | 100 | 100 | 1.2 s | 0 ms | 0 | 443 kB |
| `/tomatsalat` (placeholder) | mobile | 100 | 100 | 100 | 100 | 1.1 s | 30 ms | 0 | 403 kB (images 2 kB) |

Good news: accessibility, best practices and SEO are 100 everywhere, layout shift is zero, and the photo pipeline
works (the whole home page loads about 148 kB of images on a phone).

### Findings

1. **Home page, mobile: LCP 5.3 s.** The breakdown shows about **1.34 s "element render delay"**: the featured photo
   is downloaded quickly but not painted. Cause: `RecipeImage` keeps the image at `opacity: 0` until JavaScript
   hydrates and sets `loaded`, and the `.reveal` entrance animation also starts from `opacity: 0`. The most
   important image therefore waits for JS. **Fix (included in this spec):** server-render the first (priority)
   image fully visible and only fade in lower images that are not yet loaded; make the featured card's entrance
   animation not start from invisible. Expected: LCP about 1.5-2 s on mobile.
2. **Google tag is the heaviest request:** 178 kB (75 kB unused). Solved by consent-gating it (spec 02).
3. **Two web fonts, 113 kB** (Fraunces 66 kB, Inter 47 kB). Acceptable; could subset further or preload Fraunces.
4. **Render-blocking CSS** (about 0.3 s simulated): inline critical CSS or accept; low priority.
5. Missing long-cache headers on the HTML document are by design; hashed assets are already immutable.

### After the LCP fix (local Lighthouse 13, same method, 2026-11-20)

| Page | Device | Perf | LCP | Notes |
| --- | --- | --- | --- | --- |
| `/` | mobile | **95** (was 80) | **2.9 s** (was 5.3 s) | image no longer waits for JS; fewer, larger bundles |
| `/lasagne` | mobile | 97 | 2.5 s | the photo (not the heading) is now the LCP element and is measured, previously it was hidden at first paint, so 1.1 s was flattering |
| `/` | desktop | 100 | 0.6 s | median of 3, Google tag blocked |

The photo is painted from the server HTML (real, unthrottled LCP is about 0.1 s); the remaining simulated time is
bandwidth: Lighthouse's slow-4G model shares 1.6 Mbit/s between the HTML, one JS and one CSS file, two web fonts
(116 kB) and four card photos. The next levers are listed under "Not done / ideas" below.

### After the production-report pass (local Lighthouse 13, same method, 2026-11-26)

Driven by a production Lighthouse report (mobile `/`: perf 95, FCP 2.1 s, LCP 2.6 s) that flagged uncached photos,
uncompressed HTML, a 227 kB stylesheet, unused JS and oversized card photos.

| Page | Device | Perf | FCP | LCP | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | mobile | **97** (was 95) | 1.4 s (was 1.6 s) | **2.45 s** (was 2.9 s) | under the 2.5 s target for the first time |
| `/lasagne` | mobile | 98 (was 95) | 1.4 s (was 1.7 s) | 2.27 s (was 2.7 s) | |
| `/` | desktop | 100 | 0.33 s | 0.49 s (was 0.58 s) | |

- **Photo caching.** Every photo URL in the manifest carries a content hash (`?v=…`, from `npm run images`), and
  `server.js` (the Node entry, wraps adapter-node's server) serves versioned photos with
  `Cache-Control: public, max-age=31536000, immutable`.
- **HTML compression.** `src/hooks.server.ts` brotli/gzip-compresses SSR responses on the Node build (home HTML 34.6 kB
  to 7 kB). Off on Vercel, which compresses at its edge.
- **CSS 227 kB to 124 kB** (21 kB compressed): dropped `@skeletonlabs/skeleton-svelte`, whose stylesheet carried every
  Zag component; its one use, the step progress bar, is now plain markup with `role="progressbar"`. Fonts declare only
  the Latin and Latin Extended subsets (`src/lib/fonts/fonts.css`).
- **Card photos** gained an 800 px size, so a ~380 px card at 2x no longer fetches the 960.
- **Tried and rejected** (measured, mobile `/`): `bundleStrategy: "split"` cut unused JS to 0 but raised LCP to 3.08 s,
  because ~20 module requests compete with the photo on the local HTTP/1.1 server; preloading the two Latin fonts cut
  FCP to 0.9 s but raised LCP by about 150 ms (they take bandwidth from the photo); `inlineStyleThreshold` made no
  difference. Revisit split bundles if Lighthouse CI ever runs over HTTP/2.

### After the second production report (2026-11-26, evening)

Production Lighthouse (cookiebookie.bybear.dk, 3 runs each, median): mobile `/` perf 99, LCP 1.98 s; mobile
`/lasagne` 99, LCP 1.95 s; desktop 100 everywhere, but desktop `/` had CLS 0.017 from the web-font swap. Local
results after these changes:

| Page | Device | Perf | LCP | CLS | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | mobile | 98 | **2.37 s** (was 2.45 s) | 0 | |
| `/lasagne` | mobile | 99 | 2.08 s (was 2.27 s) | 0 | |
| `/` | desktop | 100 | 0.51 s | **0** (was 0.017) | |

- **Print photo no longer downloaded on screen.** The print sheet's `<img>` was `loading="eager"`, so every recipe
  page fetched a second copy of the hero (`card-640.jpg`, 32 kB). It is now lazy (never fetched while the sheet is
  `display: none`); the Udskriv button waits for it before `window.print()`, and `beforeprint` nudges it for Ctrl+P
  (`src/lib/print.ts`).
- **Fonts 115 kB to 83 kB.** `npm run fonts` (`scripts/subset-fonts.mjs`, needs `pip install fonttools brotli`) cuts
  each font to the characters Danish pages use (`CORE`), keeping every axis (Fraunces keeps optical size) and feature.
  The rest of Latin and Latin Extended stay on the Fontsource files under disjoint unicode-ranges, downloaded only if a
  page has such a character.
- **No layout shift from the font swap.** The same script writes metric-matched fallback faces (Georgia / Times New
  Roman and Liberation Serif / Noto Serif for Fraunces, Arial and Liberation Sans / Roboto for Inter; regular and bold
  bands) with `size-adjust` and ascent/descent/line-gap overrides, from `@capsizecss/metrics`.
- **Current-step pulse is composited.** It animated `box-shadow` forever (a repaint every frame); now a disc behind
  the checkbox scales and fades (`transform`, `opacity`).
- **`LCP_MOBILE_MS` is now 2500**, the spec target (home page median 2.37 s).

## Goals

- CI fails when performance, accessibility, best practices or SEO regress past a threshold.
- axe finds issues Lighthouse's subset misses (focus order, contrast in every state, ARIA misuse).
- Photos cannot exceed a size budget without someone noticing.

## 1. Lighthouse in CI

Extend `lighthouserc.cjs` (currently `onlyCategories: ['seo']`):

- Categories: performance, accessibility, best-practices, seo.
- URLs: `/`, `/lasagne` (photo), `/tomatsalat` (placeholder), `/missing` (404 page).
- Runs: 3 per URL, mobile (default) and a desktop preset.
- Assertions (initial, after the LCP fix):

| Metric | Mobile | Desktop |
| --- | --- | --- |
| Performance score | ≥ 0.90 | ≥ 0.95 |
| Accessibility / Best practices / SEO | = 1.0 | = 1.0 |
| LCP | ≤ 2.5 s | ≤ 1.5 s |
| CLS | ≤ 0.05 | ≤ 0.05 |
| TBT | ≤ 200 ms | ≤ 100 ms |

- Keep the existing job that previews the production build; run locally with `npm run audit:seo` (rename to
  `audit:lighthouse`).

## 2. axe accessibility scan

- Add `@axe-core/playwright` as a dev dependency.
- A Playwright test loops over: `/`, a photo recipe, a placeholder recipe, and the 404 page, each in **light and
  dark**, at phone and desktop widths.
- Extra states scanned: keep-awake switched on (header pill visible), steps partly ticked (highlighted next step),
  the consent notice open, and (later) timer dock, cook mode, share menu and print preview.
- Rule set: WCAG 2.2 A/AA. Violations fail the test; known-acceptable ones need an explicit, commented exclusion.

## 3. Image and asset budgets

- **Build-time check** inside `scripts/optimize-images.mjs`: fail if any generated file exceeds its budget.

| Variant | Max size |
| --- | --- |
| `card-400` / `card-640` / `card-960` (avif) | 25 kB / 40 kB / 70 kB |
| `wide-800` / `wide-1600` / `wide-2400` (avif) | 50 kB / 110 kB / 200 kB |
| Social crops (`og`, `16x9`, ...) | 250 kB |

- **Runtime check** in Playwright (mobile viewport, cold cache): total image transfer on `/` ≤ 250 kB,
  on a recipe ≤ 150 kB; no image served wider than 2x its display width.
- **Lighthouse budgets** (`budget.json`): script ≤ 120 kB (excluding the consent-gated analytics), fonts ≤ 130 kB,
  total ≤ 500 kB on first load.
- Report sizes in the PR (a short table from the script) so changes are visible.

## 4. The LCP fix (small, part of this spec)

- `RecipeImage`: render `class="loaded"` on the server for `priority` images, and for others only hide until loaded
  when JavaScript is available (use a `<noscript>`-safe approach, or CSS `@starting-style` instead of a JS flag).
- Home: remove `.reveal` from the featured card image container (or animate `transform` only, never `opacity`,
  on the LCP element).
- Re-measure and record the new baseline in this file.

## Test plan

The gates themselves are the tests; verify by deliberately breaking each (a 400 kB image, a missing `alt`, an
unlabelled button) and confirming CI fails.

## Implementation notes (Done)

Decisions taken from the approved recommendations: CI **fails** on accessibility, best-practices and SEO below 1.0, on
CLS and on LCP; performance score and TBT only **warn**; Lighthouse runs on every push and PR.

- **LCP fix.** `RecipeImage` renders `priority` images already visible (`loaded` starts `true`), lower images still fade
  in once loaded (a `<noscript>` rule in `app.html` keeps them visible without JS). The home featured card uses a
  transform-only entrance (`.reveal-move` in `+page.svelte`); only that card is `priority`, the grid images are lazy
  with low fetch priority. `vite.config.ts` sets `kit.output.bundleStrategy: "single"`: one JS and one CSS file instead
  of 15 + 3 requests, which cut simulated LCP by about 0.5 s on HTTP/1.1.
- **Lighthouse.** `lighthouserc.cjs` audits all four categories on `/`, `/lasagne`, `/tomatsalat` and `/missing-page`
  (audited with `ignoreStatusCode`; SEO, `is-crawlable` and the status audit are off for the deliberate noindex 404),
  3 runs, median aggregation, mobile and desktop via `scripts/audit-lighthouse.mjs` (`npm run audit:lighthouse`,
  `audit:seo` is an alias). `budget.json`: script 120 kB, fonts 130 kB, total 500 kB. It serves the Node-adapter build
  (precompressed, so transfer sizes are realistic) and blocks the Google tag URLs, matching the consent-gated default.
- **Mobile LCP fails at 2.5 s** (`LCP_MOBILE_MS` in `lighthouserc.cjs`). It was 3.0 s until the home page measured
  comfortably under 2.5 s (2.37 s, 2026-11-26).
- **axe.** `tests/a11y.spec.ts` (`@axe-core/playwright`, WCAG 2.0-2.2 A/AA): home, photo recipe, placeholder recipe and
  404, light and dark, phone and desktop, plus keep-awake on and steps/ingredients partly ticked. Add states to the
  `STATES` array; accepted violations go in `ACCEPTED` with a reason.
- **Image budgets.** `scripts/check-image-budgets.mjs` (also run at the end of `npm run images`; `npm run images:check`
  alone). Budgets as in the table above, with the unnamed sizes interpolated (`wide-480` 25 kB, `wide-1200` 80 kB) and
  2.5x the avif budget for the webp/jpg fallbacks. Runtime: `tests/budgets.spec.ts` (home <= 250 kB, recipe <= 150 kB of
  images on a phone, no photo more than 2x its display width).

- **Real violations axe found and fixed** (Lighthouse had scored accessibility 100): the "current step" label
  (`text-secondary-700-300`, contrast 2.3-2.7); dimmed done steps and ticked ingredients (opacity 0.5-0.6, contrast
  2.3-4.3); the "Nulstil / Fortryd" button (contrast 3.9); the keep-awake pill's accessible name did not contain its
  visible text "Skærm tændt" (WCAG 2.5.3, label now "Skærm tændt. Tryk for at slå fra").

### Not done / ideas
- Fraunces `wght` files instead of the `standard` core subset would save about 15 kB more (loses the optical-size
  axis the headings use; visual change).
- Real-user Core Web Vitals monitoring (open question 4) is still open.

## Open questions

1. Strictness: fail CI on a threshold miss, or warn only for performance (scores vary between runs)? **Recommendation:**
   fail on accessibility/SEO/best-practices, warn on performance score but fail on LCP/CLS limits.
2. Run the full Lighthouse job on every PR (about 3-4 min) or only on `main` plus a nightly run?
3. Are the proposed budgets right, or do you want photos sharper/heavier?
4. Add real-user monitoring (Core Web Vitals via the analytics tool) later?
