# 06 · Step timers

Status: **Done** · Size: **M** (about 4-6 h, plus authoring durations in the recipes) · Depends on: nothing (integrates with keep-awake and cook mode 08)

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

Shown while at least one timer exists. Responsive layout:

- **Mobile (< 640px):** a strip under the sticky nav (part of the sticky header), so it pushes page content down
  and leaves the bottom free for scrolling.
- **Desktop (sm and up):** a floating card (`position: fixed`, bottom-right, 400px wide, rounded, shadowed) that does
  not affect the header's height. The footer gets extra bottom margin (`sm:mb-56`) while timers exist so the card
  never covers content.

```
Phone
┌─────────────────────────────────────────┐
│ Cookie Bookie                      ☀   │  ← sticky nav
├─────────────────────────────────────────┤
│ ⏱ Simre            38:12   [⏸] [+1] [✕] │  ← timer strip (pushes content)
│ ⏱ Ris              11:40   [⏸] [+1] [✕] │
├─────────────────────────────────────────┤
│ … recipe content …                      │
└─────────────────────────────────────────┘   (stacks, max 3 visible, then "+2 mere")
```

- Each row: label (step title + label), remaining time, pause/resume, +1 minute, remove.
- A thin ring/progress line shows elapsed share; colour shifts amber for the last minute.
- Tapping the label scrolls to the step.

### When a timer finishes

- A short, pleasant chime (generated with the Web Audio API, no audio files) repeated three times; stops when dismissed.
- `navigator.vibrate` pattern on supporting phones.
- The row turns green with "Færdig!" (then "Færdig · for X siden" after a few seconds) and pulses gently; the dock
  stays until dismissed. Absolute `endsAt` is kept so a reload or return after hours still shows how long ago it
  expired. Finished timers older than 24 hours are dropped automatically.
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

## Implementation notes / deviations

Decisions applied: durations authored per step; ranges get two chips; timers persist across recipes and show the recipe
name; sound on by default with a mute switch in the dock; system notification supported, asked once with a one-line
explanation after the first timer starts (never on load).

Files: `src/lib/timerMath.ts` (pure: `formatRemaining`, `formatMinutes`, `remainingAt`, `progressAt`, `timerChoices`),
`src/lib/stores/timers.svelte.ts`, `src/lib/components/StepTimers.svelte`, `TimerDock.svelte` (mounted in the layout).
Tests: `tests/timer-math.spec.ts`, `tests/timers.spec.ts` (Playwright `page.clock`).

Deviations and details:

- The dock shows on every page (not only recipe pages) while a timer exists, so a timer from another recipe stays visible.
- Cross-tab de-duplication uses the `storage` event plus a check-then-mark of `done` in localStorage before ringing (no
  BroadcastChannel); a timer that ended while the page was closed shows as finished without sound, with "for X siden"
  derived from the preserved `endsAt`. Done timers older than a day are pruned on load and on each tick.
- Keep-awake is offered as a one-line yes/no row in the dock on the first timer, once per page load.
- Ranges under 120 minutes are shown in minutes ("60 min"); longer ones as hours ("12 t.").
- The live region (`aria-live="polite"`) announces start, one minute left and done only.
- The dock lifts above the consent card on phones while it is open.

Durations authored (seconds-level ambiguity left out):

| Recipe | Step | Timer |
| --- | --- | --- |
| boller | 9 "Form dejen til en kugle" | Hvile 2-3 min |
| boller | 12 "Dæk med et viskestykke" | Hævning 10-15 min |
| boller | 14 "Bag bollerne" | Bagning 12 min |
| brod | 4 "Hævetid er sovetid" | Hævning 12-24 t. |
| brod | 7 "Bagetid" | Forvarm 30 min |
| brod | 8 "Brænd nu ikke..." | Bagning 30 min |
| brod | 10 "La' det lig'" | Afkøling 60 min |
| lasagne | 4 "Simre, slumre, simmer" | Simre 45-60 min |
| camillas-kikgryde | 1 | Steg 3 min |
| camillas-kikgryde | 2 | Simre 10 min |
| rasmus-klump-pandekager | 2 "Pandetid" | Pandetid 30 min |
| sorens-pastaret | 3 "Ovnen klarer resten" | Ovn 45-60 min (prose also says "ikke mindre end 30") |
| spansk-svinemorbrad | 8 "Nu er svinet klar" | Bagning 30 min |

Left out as ambiguous or not a duration: camillas-kikgryde step 3 ("minimum 10 ... gerne 45-60"), ristaffel step 8
("5-10 min efter forårsløgene"), lasagne "nogle minutter", brod step 3 ("omkring to minutter" of mixing), risotto.
