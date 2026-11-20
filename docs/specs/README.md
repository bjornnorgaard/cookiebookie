# Cookie Bookie: planned work

The to-do list for the next round of features. Each item has its own spec with wireframes, rules, data changes,
accessibility notes, a test plan and **open questions**. Nothing here is implemented yet; the specs exist so the
questions can be settled first.

Sizes are my implementation estimate including tests and a local preview round: **S** ≈ 1-2 h, **M** ≈ 3-6 h,
**L** ≈ 6-10 h. Total about **30-45 h** of work, in the order below.

## Recommended order

| # | Feature | Spec | Size | Complexity | Depends on | Why this position |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Light / dark toggle | [01](01-theme-toggle.md) | S | Low | – | Smallest, visible win; also reworks how theming is wired, which later features rely on |
| 2 | Quality gates (Lighthouse, axe, image budgets) + LCP fix | [03](03-quality-gates.md) | M | Medium | – | Fixes a real problem (home page LCP **5.3 s** on mobile) and guards every later feature against regressions |
| 3 | Analytics notice and consent | [02](02-analytics-consent.md) | M | Medium | – | Needed for compliance; also removes the heaviest request on the site (178 kB Google tag) |
| 4 | Richer structured data | [04](04-structured-data.md) | S-M | Low-medium | answers on data | Highest SEO value; mostly needs your input and a few optional recipe fields |
| 5 | Portion scaler | [05](05-portion-scaler.md) | M-L | **High (data)** | – | Needs ingredient amounts converted to structured data; print, timers and cook mode build on it |
| 6 | Step timers | [06](06-step-timers.md) | M | Medium | – | Independent, big practical win; shares helpers with cook mode |
| 7 | Share and print | [07](07-share-and-print.md) | M | Medium | 05 (soft) | Prints scaled amounts, so it goes after the scaler |
| 8 | Cook mode | [08](08-cook-mode.md) | L | **High (UX)** | 05, 06 | Ties everything together; best built on finished scaler and timers |

Numbers 1-4 are independent and can be reordered freely; 5 → 7 and 5/6 → 8 are real dependencies.

Why #2 before the big features: the measurement below shows a performance bug that exists today, and from then on
every pull request is checked automatically.

### Complexity at a glance

```
Theme toggle        ██░░░░░░░░  S
Structured data     ███░░░░░░░  S-M   (data answers needed)
Quality gates       ████░░░░░░  M
Analytics consent   ████░░░░░░  M
Step timers         █████░░░░░  M
Share & print       █████░░░░░  M
Portion scaler      ███████░░░  M-L   (data migration across all recipes)
Cook mode           █████████░  L
```

## Baseline measured for this plan (local Lighthouse, 2026-11-20)

- Accessibility, best practices and SEO: **100** on home, recipe, placeholder recipe (mobile and desktop).
- Performance: recipe pages **98-100**; home page **97 desktop, 80 mobile** (LCP 5.3 s).
- Cause on home: the featured photo is held at `opacity: 0` until JavaScript runs (about 1.3 s render delay); fix is
  part of spec 03.
- Biggest request: the Google Analytics script (178 kB, 75 kB unused); solved by spec 02.
- Photos are small: about 148 kB of images on a phone for the whole home page.

Details in [03-quality-gates.md](03-quality-gates.md).

## Decisions I need from you

These block or shape the work. Everything else has a recommendation in its spec.

| Spec | Question |
| --- | --- |
| 01 | Tap toggles light/dark and long-press returns to "follow device": OK? Circular-reveal animation or calm cross-fade? |
| 02 | **Keep Google Analytics, or switch to a cookie-free tool** (no banner needed, 1 kB instead of 178 kB)? Who is named as data controller on `/privatliv`? |
| 03 | Fail CI on performance misses, or only warn? Are the image budgets right? |
| 04 | Do you want nutrition and estimated cost (needs data)? Which recipes are vegetarian? Logo and author profile URL? |
| 05 | OK to rewrite the ingredient data format (output identical, enforced by a test)? Scale amounts quoted inside step text too? |
| 06 | Authored durations per step (I propose, you approve)? One timer chip or two for ranges? Keep timers when switching recipes? |
| 07 | QR code on the printout? Include "uden billede" option? |
| 08 | Does **Næste** auto-tick steps? Phone-first, or tablet two-column from the start? |

## Also: photos

Five recipes still show the drawn placeholder: `brod`, `tomatsalat`, `marry-me-chickpeas`,
`spansk-svinemorbrad`, `rasmus-klump-pandekager`. Adding `photos/<slug>.jpg` and running `npm run images` gives them
real images in rich results (spec 04) and on the site. This needs nothing else from me.

## Parked (not planned now)

| Idea | Status |
| --- | --- |
| Search and filters on the home page, category/cuisine landing pages | Not now |
| Shopping list combining several recipes | Not planned |
| Offline support (service worker, "add to home screen") | Later |
| RSS feed, custom generated share images, related-recipes block | Optional extras mentioned in spec 04; not scheduled |

## How we work through this

1. You read the specs and answer the open questions (inline in each spec or in chat).
2. I update the specs with the decisions and mark them **Ready**.
3. Implementation goes one feature at a time: local preview on the dev server → your feedback → commit, PR, merge,
   local deploy (`scripts/deploy.sh`, then cleanup).

Status key used at the top of each spec: **spec, awaiting answers** → **Ready** → **In progress** → **Done**.
