# 04 · Richer structured data

Status: **spec, awaiting answers** · Size: **S-M** (about 2-3 h of code; more if you want nutrition data) · Depends on: nothing (photos for placeholder recipes matter most, see below)

## Summary

Extend the JSON-LD so Google can show richer recipe results and the site is easier for search and AI answer
engines to understand. This is the most SEO-relevant feature on the list.

## What exists today

- `Recipe` JSON-LD: name, image (1:1, 4:3, 16:9, only when a real photo exists), author, datePublished,
  description, prep/cook/total time, keywords, yield, category, cuisine, ingredients, `HowToStep` instructions.
- `BreadcrumbList` on recipe pages, `WebSite` on the home page, image sitemap, Open Graph/Twitter tags.

## Proposed additions

### Recipe page

| Property | Value | Needs from you |
| --- | --- | --- |
| `dateModified` | last edit date | A `dateModified` field per recipe (or taken from git) |
| `author` | `Person` with `url` (https://bybear.dk) and `sameAs` links | Profile URL(s) |
| `publisher` | `Organization` "Cookie Bookie" with `logo` | A square logo file (can be generated from the 🍪 mark) |
| `recipeYield` | `["8", "8 portioner"]` (Google reads both forms) | nothing |
| `estimatedCost` | `MonetaryAmount` in DKK (fits "rimelige opskrifter") | A rough cost per recipe |
| `suitableForDiet` | e.g. `VegetarianDiet` for the chickpea dish | Which recipes are vegetarian/vegan |
| `nutrition` | `NutritionInformation` (calories per portion) | Values, or approval to estimate |
| `recipeInstructions` | `HowToSection` wrapping the steps, each step with `image` when available | optional step photos |
| `isPartOf` / `mainEntityOfPage` | link to the page and the site | nothing |
| `inLanguage` | `da-DK` | nothing |
| `video` | when a recipe has a video | optional |

Rules that must keep holding:

- No fake data: no `aggregateRating`/reviews unless real ones exist.
- Omit `image` for placeholder recipes (already done): a drawn placeholder must not reach rich results.
- Everything in the JSON-LD must match what is visible on the page.

### Home page

- `WebSite` + `Organization` (name, url, logo, `sameAs` social links).
- `ItemList` of the recipes (position, url, name, image) for carousel eligibility.
- No `SearchAction` until the site has search.

### Related

- `<link rel="alternate" type="application/rss+xml">` plus `/rss.xml` (title, description, image, date).
- `<meta name="robots" content="max-image-preview:large">` so Google may show large photos.
- Add `lastmod` from `dateModified` in the sitemap.
- Per-recipe `og:image:alt` already set; add `article:modified_time`.

## Data model changes

```ts
interface Recipe {
  // existing fields...
  dateModified?: Date;
  estimatedCostDKK?: number;           // total, for the stated yield
  diets?: ('vegetarian' | 'vegan' | 'glutenFree' | 'lactoseFree')[];
  nutrition?: { kcalPerServing: number; proteinG?: number; carbsG?: number; fatG?: number };
}
```

All new fields optional; the builder omits anything missing.

## Validation and tests

- Unit-style Playwright test: parse the JSON-LD on every recipe page and assert required properties (Google's
  Recipe requirements: name, image when present; recommended: author, datePublished, description, ratings are
  optional).
- Manual: Google Rich Results Test and validator.schema.org once per release (links to include in the PR).
- Confirm one `Recipe` item per page, valid ISO-8601 durations, absolute URLs.

## Open questions

1. Do you want `nutrition` and `estimatedCost`? They improve results but need data. I can draft rough estimates
   for you to approve, or leave them out.
2. Which recipes are vegetarian/vegan (at least the chickpea dish)?
3. Author profile: is https://bybear.dk the canonical "about" page for the author? Any social profiles to list?
4. Logo: use a generated cookie mark, or do you have a logo file?
5. RSS feed: wanted now, or skip?
6. **Photos** for the five placeholder recipes (brod, tomatsalat, marry-me-chickpeas, spansk-svinemorbrad,
   rasmus-klump-pandekager) unlock `image` in rich results for them. This is the highest-value item and needs
   nothing but photos in `photos/`.
