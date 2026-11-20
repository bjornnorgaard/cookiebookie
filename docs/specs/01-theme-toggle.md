# 01 · Light / dark mode toggle

Status: **spec, awaiting answers** · Size: **S** (about 1.5-2 h) · Depends on: nothing

## Summary

A small "light switch" in the header lets visitors choose light or dark mode instead of only following their device.
The choice is remembered and applied before first paint, so there is no flash of the wrong theme.

## Goals

- One tap to switch, from any page, on phone and desktop.
- Remember the choice per device; default is "follow the device".
- No flash of wrong colours on load (FOUC).
- A tasteful animation that doubles as a showcase.

## Non-goals

- More than two palettes. Only the existing warm light and cocoa dark palettes.
- Syncing the choice between devices.

## UX

Header, right side (the tagline hides below `sm`, so there is room on phones):

```
Desktop
┌────────────────────────────────────────────────────────────────────┐
│ 🍪 Cookie Bookie      [☀ Skærm tændt ✕]  ── Rimelige opskrifter..  (☾) │
└────────────────────────────────────────────────────────────────────┘
                                                                    ^ theme switch

Phone
┌──────────────────────────────┐
│ 🍪 Cookie Bookie        (☾)  │
└──────────────────────────────┘
```

The switch is a 40 px round button (44 px touch target). The icon is a sun in light mode and a moon in dark mode.

States and behaviour:

| State | Icon | Meaning |
| --- | --- | --- |
| System (default) | sun/moon following the device | Follows `prefers-color-scheme`, including live changes |
| Light | sun | Forced light |
| Dark | moon | Forced dark |

- **Tap** toggles between light and dark (an explicit choice is stored).
- **Long-press / right-click, or a small menu** offers "Følg enheden" to return to system mode (see open question 1).
- **Animation:** a circular reveal expanding from the button using the View Transitions API (`clip-path` on
  `::view-transition-new(root)`), and the icon morphs (sun rays rotate and fade into a crescent). With
  `prefers-reduced-motion` the change is instant.

## Behaviour and rules

- Storage: `localStorage["theme"]` = `"light" | "dark"`; absent means system. Failure to read or write storage is silent.
- An inline script in `app.html` (with the SvelteKit CSP nonce) sets `data-mode` and `color-scheme` on `<html>`
  before first paint.
- Update both `<meta name="theme-color">` tags so the phone's browser chrome matches.
- Listen to `matchMedia('(prefers-color-scheme: dark)')` changes while in system mode.

## Technical notes

- Today dark mode comes from `prefers-color-scheme` in three places: Skeleton's `light-dark()` colours, Tailwind
  `dark:` variants (media-based by default), and a few `@media (prefers-color-scheme)` rules in `src/app.css`
  (glow strength). To support a manual choice:
  - set `color-scheme: light | dark | light dark` on `<html>` from `data-mode` (this alone drives every
    `light-dark()` value);
  - declare `@custom-variant dark (&:where([data-mode=dark], [data-mode=dark] *))` for Tailwind, with a media
    fallback for system mode;
  - turn the `@media (prefers-color-scheme)` blocks into `[data-mode]` selectors.
- Component: `ThemeToggle.svelte` plus a small rune store `theme.svelte.ts`, in the same style as `wakeLock.svelte.ts`.

## Accessibility

- `<button aria-label="Skift til mørk tilstand">` (label describes the action and updates), not an unlabeled icon.
- Visible focus ring; 44 px target; contrast of the icon at least 3:1 in both modes.
- The animation never carries meaning on its own.

## Test plan

- Playwright: default follows emulated `colorScheme`; click toggles `data-mode`; choice survives reload; no flash
  (assert `data-mode` is set before DOMContentLoaded).
- axe scan in both modes (see spec 03).

## Open questions

1. Two-state toggle (simple, but no way back to "follow device" except clearing storage) or three-state
   (light / dark / system) via a tiny popover? **Recommendation:** tap toggles; a long-press or tiny popover offers
   "Følg enheden".
2. Should the choice also apply to the 404 page and print view? **Recommendation:** yes for 404; print is always light.
3. Is the circular-reveal animation wanted, or would a simple cross-fade be calmer?
