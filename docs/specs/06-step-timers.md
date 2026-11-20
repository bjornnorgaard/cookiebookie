# 06 · Step timers

Status: **spec, awaiting answers** · Size: **M** (about 4-6 h, plus authoring durations in the recipes) · Depends on: nothing (integrates with keep-awake and cook mode 08)

## Summary

Steps that say "simre i 45-60 minutter" get a one-tap timer. Several timers can run at once; they live in a small
dock that follows the visitor down the page, survive a reload, and alert clearly (sound, vibration, notification,
tab title) when done.

## Goals

- Start a timer for a step in one tap, no typing.
- Run several timers at once (rice and sauce).
- Stay accurate when the tab is in the background or the phone locks (use absolute end times).
- Be unmissable when finished, without being obnoxious.

## Non-goals

- A general-purpose stopwatch or free-form timer UI (a manual "+ Egen timer" is a possible later add-on).
- Voice control.

## Data model

Durations are **authored**, not parsed from prose: prose like "45-60 minutter" is ambiguous.

```ts
interface Step {
  title: string;
  desc: string;
  timers?: { label?: string; minutes: number; maxMinutes?: number }[];
}
// e.g. { label: "Simre", minutes: 45, maxMinutes: 60 }
```

Steps without `timers` look exactly as they do today. I will propose durations for the existing recipes for you to
approve (about a dozen steps).

## UX

### On the step card

```
┌──────────────────────────────────────────────────┐
│ ◯  TRIN 4                                         │
│    Simre, slumre, simmer                          │
│    Lad det hele simre til det ikke er for         │
│    flydende (45-60 minutter).                     │
│    [ ⏱ Start 45 min ]  [ ⏱ 60 min ]               │
└──────────────────────────────────────────────────┘
```

- A range shows two chips (min and max). A single duration shows one.
- Tapping starts the timer, and the chip becomes a live countdown with pause and reset.

### Timer dock

Fixed at the bottom of the screen on recipe pages while at least one timer exists:

```
Phone
┌─────────────────────────────────────────┐
│ ⏱ Simre            38:12   [⏸] [+1] [✕] │
│ ⏱ Ris              11:40   [⏸] [+1] [✕] │
└─────────────────────────────────────────┘   (stacks, max 3 visible, then "+2 mere")
```

- Each row: label (step title + label), remaining time, pause/resume, +1 minute, remove.
- A thin ring/progress line shows elapsed share; colour shifts amber for the last minute.
- Tapping the label scrolls to the step.

### When a timer finishes

- A short, pleasant chime (generated with the Web Audio API, no audio files) repeated twice; stops when dismissed.
- `navigator.vibrate` pattern on supporting phones.
- The row turns green with "Færdig! ✕" and pulses gently; the dock stays until dismissed.
- Browser title shows `⏰ Færdig · Cookie Bookie` while any timer is done.
- If notification permission was granted: a system notification "Simre er færdig" (works when the tab is in the
  background). Permission is requested only on the first timer start, with a one-line explanation, never on load.

## Behaviour and rules

- State per timer: `{ id, recipeSlug, stepIndex, label, endsAt | remainingMs (when paused), done }`.
- Display is computed from `endsAt - Date.now()` on `requestAnimationFrame`/1 s interval, never by decrementing a
  counter, so it stays correct after throttling or sleep.
- Persisted in `localStorage`; restored after reload and on returning to a recipe; timers from other recipes keep
  running and appear in the dock with the recipe name (open question 3).
- Audio needs a user gesture: unlock the audio context on the first timer start.
- Starting a timer **does not** auto-tick the step; ticking stays the user's action.
- Keep-awake (spec in place already): offer to switch it on when the first timer starts, if it is off.
- Reduced motion: no pulsing, static colours.

## Technical notes

- `timers.svelte.ts` rune store + `TimerDock.svelte` in the layout + a `StepTimers.svelte` chip group per step.
- Use a `BroadcastChannel`/`storage` event so two tabs do not both ring.
- A small pure `formatRemaining(ms)` (mm:ss, h:mm:ss) shared with cook mode.

## Accessibility

- Dock is a `role="region" aria-label="Timere"`; remaining time is a `<time>` element; updates are **not**
  announced every second. Only start, 1-minute-left and done use `aria-live`.
- Buttons labelled in text/aria ("Pause Simre", "Læg et minut til Ris").
- Finished state is not colour-only.

## Test plan

- Playwright with fake clock (`page.clock`): start, pause/resume, +1, reload persistence, finish alert (stub
  `Notification`, `AudioContext`), multiple timers, timer from another recipe.
- Unit test for `formatRemaining` and the end-time maths.

## Open questions

1. OK that durations are authored per step (I propose values, you approve)? Alternative: free "Egen timer" input only.
2. For ranges ("45-60 min"), two chips, or one chip for the lower bound with "+15" afterwards?
3. Keep timers visible if the user navigates to another recipe (cooking two dishes), or reset per recipe?
4. Sound on by default? A mute toggle in the dock?
5. Is a system notification wanted at all (it adds a permission prompt)?
