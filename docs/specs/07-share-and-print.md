# 07 · Share and print

Status: **Done** · Size: **M** (about 3-5 h) · Depends on: nothing (uses the portion scaler, spec 05)

## Summary

Two small actions on every recipe: **Del** (share the recipe link, with the phone's native share sheet when
available) and **Udskriv** (a clean, paper-friendly layout). Both live in one row under the recipe facts.

## Goals

- One tap to send a recipe to someone, on phone or desktop.
- A printed recipe that fits on one or two A4 pages, readable at arm's length, with room to tick things with a pen.
- No extra scripts or third-party buttons.

## UX

Action row, right under the facts strip:

```
┌───────────────────────────────────────────────────────────┐
│  Forb. 10 min │ Tilb. 40 min │ I alt 50 min │ Portioner 4  │
└───────────────────────────────────────────────────────────┘
      [ ⤴ Del ]    [ 🖨 Udskriv ]
```

### Share

- Where `navigator.share` exists (phones, Safari, Edge): opens the native sheet with title, a one-line text and the
  canonical URL.
- Otherwise: a small popover with **Kopiér link** (copies, button briefly turns into "Kopieret ✓"), plus
  optional mail and SMS links (`mailto:`/`sms:`).
- Second option inside the popover (or a second tab): **Del indkøbslisten** shares the ingredients as plain text
  (one per line, with amounts) so it can be pasted into a notes or messaging app.
- Shared text, example:

```
Ristaffel – Ris, kokos, kylling og alle de gode sager!
https://cookiebookie.dk/ristaffel
```

### Print

- `Udskriv` calls `window.print()`; `Ctrl/Cmd+P` gives the same result via the print stylesheet.
- Layout on A4 portrait:

```
┌───────────────────────────────────────────┐
│ Cookie Bookie                  cookiebookie.dk│
│ RISTAFFEL                                  │
│ Ris, kokos, kylling og alle de gode sager! │
│ Forb. 10 min · Tilb. 40 min · 4 portioner  │
│ ┌──────────────┐  Indkøb            Planen │
│ │  small photo │  ☐ Kylling, 500 g  1 ☐ Brus karryen af...  │
│ └──────────────┘  ☐ Creme Fraiche   2 ☐ Gør som hakkedyret..│
│                   ☐ ...             3 ☐ ...               │
│ QR  → cookiebookie.dk/ristaffel                            │
└───────────────────────────────────────────┘
```

- Hidden in print: header, footer, keep-awake card, consent notice, share/print buttons, progress bar, animations.
- Always light colours on white, black text, serif headings kept; links show their URL only for the footer link.
- Ingredients and steps shown as **empty checkboxes** (squares) for pen use, regardless of on-screen state.
- Two columns (ingredients left, steps right) when they fit; page-break rules keep a step together
  (`break-inside: avoid`).
- Prints the **current portion count** (spec 05).
- Hero photo included but small (about 6 cm wide) to save ink; an option "uden billede" (without photo) is a
  question below.
- Small QR code back to the page (generated at build time as inline SVG, no runtime library).

## Technical notes

- Share: feature-detect `navigator.share`; call it from the click handler; ignore `AbortError`; fall back to
  `navigator.clipboard.writeText`, then to a selected `<input>` for old browsers.
- Print: a `@media print` block in a dedicated `print.css` imported in the layout; set `@page { margin: 14mm }`;
  use `print-color-adjust: exact` only for the checkboxes.
- QR: build-time SVG generation (a tiny dependency in `scripts/`, or a one-file encoder) written next to the recipe
  data, so no client JavaScript is needed.
- Analytics events (only with consent): `share` (method), `print`.

## Accessibility

- Buttons have text labels, not icon-only. Popover is keyboard-operable, Esc closes, focus returns to the button.
- The copy confirmation is announced via `aria-live="polite"`.
- Print output keeps semantic headings and list structure.

## Test plan

- Playwright: stub `navigator.share` and assert the payload; with it removed, assert the clipboard fallback;
  `page.emulateMedia({ media: 'print' })` snapshot asserts header/footer hidden and two columns visible; check
  a generated PDF (`page.pdf()`) is at most 2 pages for every recipe.

## Open questions

1. Include a QR code on the printout? Nice for sticking a recipe on the fridge; trivial to drop.
2. Print option "uden billede" to save ink: a checkbox before printing, or always include the small photo?
3. Share text: only title and link, or also the short description?
4. Include "Del indkøbslisten" now, or later (it overlaps with the dropped cross-recipe shopping list idea)?

## Implementation notes / deviations

Decisions on the open questions: QR code **yes** (build-time SVG), photo **always** in print (no "uden billede"),
share text is title + short description + canonical URL, "Del indkøbslisten" **included**.

- **Print approach.** `src/print.css` hides everything but a dedicated print-only sheet (`PrintSheet.svelte`), rendered
  next to the share row from the same recipe data and the same `getPortions()` / `formatAmount` / `renderStepText`,
  so paper shows the current portion count and scaled amounts. The sheet uses fixed black-on-white colours and is
  identical in dark mode (tested by comparing screenshots). Two columns are floats (fragment across pages in every browser).
  Recipes without a photo print without one (the placeholder wireframe is not printed).
- **QR.** `scripts/generate-qr.mjs` is a small self-contained encoder (byte mode, level M, versions 1-10), verified
  by decoding with jsQR. It writes `src/lib/data/qr.generated.ts` (committed) and runs as `prebuild`; run `npm run qr`
  after adding a recipe (a test fails if one is missing).
- **Share.** `Del` calls `navigator.share` directly where available (AbortError ignored); the shopping list then has
  its own small "Del indkøbslisten" link in the row. Without native share, `Del` opens a popover: "Kopiér link"
  (copies only the URL), "Del indkøbslisten" (plain text, scaled), e-mail and sms links. Clipboard failure shows a
  selected text field. Esc closes and returns focus; the copy state is announced via `aria-live`.
- Analytics: `share` / `print` events are sent through `window.gtag` only if it exists (i.e. after consent).
- The print sheet is in the page HTML (hidden on screen), so ingredient and step text appear twice in the DOM.
- Not verified on real printers or in Safari/Firefox print preview; checked with Chromium `page.pdf()` (1 page for every recipe).
