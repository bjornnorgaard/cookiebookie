# 03 · Quality gates: Lighthouse, axe and image budgets

Status: **spec, awaiting answers** · Size: **M** (about 3-4 h, plus the LCP fix below) · Depends on: nothing (best done before the bigger features so regressions are caught)

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

## Open questions

1. Strictness: fail CI on a threshold miss, or warn only for performance (scores vary between runs)? **Recommendation:**
   fail on accessibility/SEO/best-practices, warn on performance score but fail on LCP/CLS limits.
2. Run the full Lighthouse job on every PR (about 3-4 min) or only on `main` plus a nightly run?
3. Are the proposed budgets right, or do you want photos sharper/heavier?
4. Add real-user monitoring (Core Web Vitals via the analytics tool) later?
