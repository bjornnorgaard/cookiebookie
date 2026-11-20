# 08 · Cook mode

Status: **spec, awaiting answers** · Size: **L** (about 6-10 h) · Depends on: keep-awake (done); needs 05 portion scaler and 06 step timers first

## Summary

A full-screen, distraction-free view for actually cooking: one step at a time in large type, big next/back
buttons usable with wet or floury hands, the current step's timers inline, and the ingredients one swipe away.
It builds on features that already exist (keep-awake, step highlight, tick ripple) and specs 05 and 06.

## Goals

- Readable from an arm's length: 24-32 px body text, high contrast.
- Operable with one thumb or a knuckle: large buttons, swipe, keyboard arrows.
- Screen stays on, no accidental navigation away.
- Reuses the page's data and state, so progress is the same in and out of cook mode.

## Non-goals

- Voice control or reading steps aloud (possible later).
- A separate route or separate content.

## Entry and exit

- Button **"Start madlavning"** (primary) under the facts strip and above the steps; also in the header pill menu.
- Opens as a full-screen overlay (dialog) with a View Transition grow from the button.
- Exit: ✕ (top right, 48 px), Esc, or the browser Back button (state pushed to history as `#cook`, so Back closes
  it instead of leaving the page).
- Keep-awake turns on automatically while open, and returns to the user's previous setting on exit.

## UX

```
Phone, portrait
┌──────────────────────────────────────┐
│ Ristaffel                    ⓘ   ✕   │
│ ●●●○○○○○   Trin 4 af 8               │  ← progress dots (tappable)
│                                      │
│  Nu sker der noget                   │  ← title, display font ~28px
│                                      │
│  Kokosmælken hældes i. IKKE det      │  ← body ~22-24px
│  hele, bare nok til at kyllingen     │
│  har noget at koge i.                │
│                                      │
│  [ ⏱ Start 12 min ]                  │  ← timers for this step (spec 06)
│                                      │
│  ┌──────────────────────────────┐    │
│  │ ← Forrige        Næste →     │    │  ← 64px-high buttons, full width
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
ⓘ = ingredients drawer (swipe up or tap): scaled amounts (spec 05), tick-off list, "Indkøbsliste"

Tablet / desktop landscape: two columns. Left: current step. Right: ingredients (always visible) + timer dock.
```

- **Next** marks the current step as done (using the existing ripple rule: earlier steps are done), moves forward and
  scrolls to top; **Forrige** moves back and un-ticks the later steps, consistent with the page.
- Swipe left/right, `←`/`→`, `Space` also navigate. Gestures ignore horizontal scroll areas.
- Slide transition between steps (direction-aware), instant with reduced motion.
- Last step: "Færdig 🍽" button leads to the existing "Velbekomme!" state, then closes cook mode.
- The next step is shown as a faint one-line preview ("Næste: Tid til kylling") to help planning.
- Ingredient drawer: same list as the page, same checkboxes, same portion count; "relevant to this step" ingredients
  highlighted if steps declare `uses: ['Kylling', 'Karry']` (optional data, open question 3).
- Text size control (A− A+) with three sizes, remembered.
- Light/dark follows the theme toggle (spec 01); dark is the default recommendation for kitchens.

## Behaviour and rules

- State is shared with the page: `completedSteps`, portions, timers, ingredient ticks. Nothing is duplicated.
- Opening mid-recipe starts at the first unfinished step.
- Timers keep running and show in a compact bar at the bottom in every step, with the same alert behaviour.
- A running timer prevents closing by accident: leaving cook mode keeps timers alive (dock on the page).
- Orientation lock is not forced; layout adapts.

## Technical notes

- `CookMode.svelte` using the native `<dialog>` (`showModal()`) for focus trapping, `inert` background and Esc.
- History: `pushState` with `#cook`; `popstate` closes.
- Slide transitions via Svelte `fly`/`fade` or View Transitions between step views.
- Shares `formatRemaining`, `TimerChip` and `scaleAmount` modules from specs 05/06.
- Component code-split (dynamic import) so the normal page does not pay for it: the large majority of visits never
  enter cook mode.

## Accessibility

- `role="dialog" aria-modal="true"` with a label; focus moves to the step heading on open and on each step change
  (announced as "Trin 4 af 8"); focus returns to the opening button on close.
- All controls ≥ 48 px; no gesture-only actions (every swipe has a button/keyboard equivalent).
- Contrast AAA for body text in both themes; no information by colour alone.

## Test plan

- Playwright: open/close (button, Esc, Back), navigate by button, keys and swipe emulation; progress ties to page
  state; timers continue; wake lock requested while open; axe scan in both themes at phone and tablet sizes.
- Manual on a real phone with floury hands (!) before launch.

## Open questions

1. Should **Næste** auto-tick the step (recommended: yes, same ripple rule), or only navigate?
2. Default text size, and is three sizes enough?
3. Do you want to mark which ingredients each step uses (`uses: [...]`) so the drawer can highlight them? More authoring,
   nicer result. Could be done later.
4. Landscape/tablet two-column layout: include in the first version, or phone-first and add later?
5. Should cook mode be offered automatically when a visitor ticks the first step, or only via the button?
