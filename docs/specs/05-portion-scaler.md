# 05 · Portion scaler

Status: **Done** · Size: **M-L** (about 5-8 h, most of it converting ingredient amounts to structured data) · Depends on: nothing (feeds timers/cook mode 08 and print 07)

## Summary

A stepper above the ingredients ("Portioner: − 4 +") rescales every ingredient amount. The base data stays the
source of truth, the structured data keeps the original yield, and the chosen portion count is remembered.

## Goals

- Scale all amounts sensibly in one tap, in Danish units and notation.
- Show amounts that are easy to measure (no "0.37 dl").
- Never change the recipe's own data or the JSON-LD.
- Work offline, with no layout shift, no server round-trip.

## The real work: structured amounts

Today an ingredient is `{ name: "Hakkedetomater", amount: "3 dåser" }`: a free-text string. Scaling needs numbers.
Existing examples that must be handled:

| Today | Structured |
| --- | --- |
| `"3 stk."` | `{ qty: 3, unit: 'stk.' }` |
| `"2 spsk."` | `{ qty: 2, unit: 'spsk.' }` |
| `"500g"` | `{ qty: 500, unit: 'g' }` |
| `"0.5 liter"` | `{ qty: 0.5, unit: 'l' }` |
| `"1-100 stk"` | `{ qty: [1, 100], unit: 'stk' }` (range: scale both ends) |
| `"mindst en pr. pers"` | `{ text: 'mindst en pr. pers', perServing: 1 }` (scales with portions) |
| `""` (Peber og salt) | `{ fixed: true }` (never scales, shown as "efter smag") |

```ts
interface Ingredient {
  name: string;
  amount?: { qty: number | [number, number]; unit?: string } | { text: string; perServing?: number };
  scale?: 'linear' | 'fixed' | 'round-up';  // default linear; fixed for salt, spices; round-up for eggs/cans
  note?: string;
}
```

I will convert all 11 recipes and keep the visible text identical at the recipe's own yield (a test asserts
this), so the migration cannot change anything for visitors.

## UX

In the ingredients card header:

```
┌─────────────────────────────────────────┐
│ Indkøbslisten                             │
│ Portioner  [ − ]  4  [ + ]   (3 8 12)     │   ← stepper + quick presets
│ Sæt kryds ved det, du allerede har   0/11  │
│ ☐ Kylling, 500 g                          │
│ ☐ Creme Fraiche, 0,5 l                    │
└─────────────────────────────────────────┘
After tapping +  (4 → 6):
│ Portioner  [ − ]  6  [ + ]   Original: 4  │
│ ☐ Kylling, 750 g          ← amounts animate (number roll)
```

- Stepper range 1-24; long-press repeats; typed input also allowed.
- Changed amounts highlight briefly (soft flash) so the change is visible.
- A small "Originalt: 4 portioner · Nulstil" appears whenever the count differs.
- The facts strip's "Portioner" and any step text that mentions quantities (see below) update too.

## Rules

- `qty_scaled = qty × (portions / baseYield)`.
- Rounding by unit (examples; final table in the PR):
  - `g`: nearest 5 under 100 g, 10 under 1 kg, then kg with one decimal; `kg`/`l` up to 2 decimals.
  - `dl`: nearest ¼ ("½ dl", "1¼ dl"); `spsk.`/`tsk.`: nearest ½ ("1½ tsk.").
  - `stk.`: nearest ½ for halvable items, whole for eggs/cans (`round-up`).
- Unit promotion: 1500 g → 1,5 kg, 10 dl → 1 l, 3 tsk. → 1 spsk. (Danish kitchen units only).
- Fractions shown with Unicode (½ ¼ ¾) where it reads better than decimals; decimal comma ("0,5").
- `fixed` ingredients (salt, pepper) never change; "efter smag".
- Step text: instructions that quote amounts ("3 dåser") need either token markup (`{{ingredient:tomater}}`) or
  stay unscaled with a one-line note "Mængder i trinene er for 4 portioner". Decision below.
- Persistence: per recipe in `localStorage`, plus an optional `?p=6` URL parameter so a scaled recipe can be linked
  and printed. Canonical URL and JSON-LD stay at the original yield (important for SEO).

## Technical notes

- `scale.ts` pure functions (`scaleAmount`, `formatAmount`, `roundFor(unit)`) with unit tests and a table of cases.
- Svelte store `portions.svelte.ts`; `ShoppingList` reads scaled amounts; checked state is by ingredient name and
  independent of scaling.
- Server-rendered at base yield (good for SEO); client applies stored portion count after hydration with a
  micro-transition to avoid a visible jump.
- Share/print/cook mode all read the same scaled values.

## Accessibility

- Stepper is a `role="spinbutton"`-style group or two labelled buttons plus an output; the count is announced
  politely ("6 portioner"); buttons ≥ 44 px.
- Changes are not colour-only; the flash respects reduced motion.

## Test plan

- Unit tests for the maths and formatting incl. ranges, unit promotion, fixed items and Danish decimal comma.
- Migration test: formatted output at base yield equals the old text for every ingredient.
- Playwright: stepper updates amounts, persists, `?p=` works, JSON-LD unchanged.

## Open questions

1. **Step text amounts:** (a) leave unscaled with a note, (b) mark amounts in step text with tokens so they scale
   too (more authoring work, best result). **Recommendation:** (b) for the existing recipes, since there are few.
2. Allow any number or only presets (2, 4, 6, 8, 12)?
3. Show metric conversions (dl ↔ ml)? **Recommendation:** no.
4. Is it fine to rewrite the ingredient data format across all recipes (output identical, enforced by a test)?
5. Should "per person" ingredients (e.g. bananas) be marked per serving rather than scaled from the total yield?

## Implementation notes / deviations

Decisions from the product owner: (1) step text amounts scale via tokens; (2) any count 1-24 plus presets 2/4/6/8/12; (3) no metric conversion; (4) data format rewritten for all recipes with a base-yield equality test; (5) "per person" ingredients scale per serving.

**Data format.** `Ingredient.amount` is `{ qty, unit?, plural?, display? }` (measured; `qty` may be a `[min, max]` range) or `{ text, perServing? }` (prose). Items with no amount (salt, pepper, olive oil) simply have no `amount`; `scale` is `'linear' | 'fixed' | 'round-up'`; `note` renders as "(kan undværes)".

**Legacy wording (`display`).** The old strings contain spellings the normalised formatter would never produce ("500g", "0.5 liter", "1tsk", "to dåser", "~200g"). To keep the output at the recipe's own yield byte-identical (and JSON-LD unchanged), those 16 amounts carry `display`, used only at base yield; any other count shows normalised output ("750 g", "1,5 l"). `tests/scale.spec.ts` asserts equality against `tests/fixtures/legacy-recipes.json`, captured from `feat/next-wave` before the conversion, for every ingredient, JSON-LD ingredient line and step.

**Step tokens.** `{{Ingredient name}}` renders that ingredient's scaled amount; `{{Ingredient name|prose}}` shows `prose` at base yield and the scaled amount otherwise. Only one existing step quotes an amount (risotto, step 1: "{{Bouillon|en liter}}"). Steps and JSON-LD `HowToStep.text` resolve tokens at base yield.

**Deviations from the draft.**
- Fixed items show no amount, not "efter smag", because the old text was empty and output must stay identical.
- `?p=` is read (and wins over the stored count) but the URL is not rewritten when the stepper changes; no history manipulation.
- "Per person" items keep their sentence and gain a total when scaled: "mindst en pr. pers (6 i alt)".
- Stepper presets: 2, 4, 6, 8, 12 plus the recipe's own yield; the input is a native number field (spinbutton), so typing works too.
- Rounding table (final): g under 100 to 5, otherwise 10, from 1000 shown as kg to 0,05; kg to 0,05 (below 1 kg shown in g); ml under 100 to 5, otherwise 25, from 1000 as l; dl to ¼ (10 dl and up as l); l to 0,05 (below 0,1 l as dl); tsk. and spsk. to ½ (promote only when every end is a whole number of spoonfuls: 3 tsk. = 1 spsk.; under 1 spsk. shown as tsk.); counted items to ½ below 10, whole above; `round-up` always whole numbers upwards. Fractions ¼ ½ ¾ are used except for kg and for l at 1 or more (decimal comma).
- The portions store is a per-page class shared through context (not a module singleton), to avoid state leaking between server requests.

**Reusable API.** `src/lib/scale.ts`: `formatAmount(ingredient, scaling)`, `renderStepText(desc, ingredients, scaling)`, `schemaIngredient(ingredient, base)`, `scaleAmount`, `formatNumber`, `clampPortions`, `Scaling = { base, portions }`. `src/lib/stores/portions.svelte.ts`: `Portions` (`count`, `scaling`, `scaled`, `set`, `step`, `reset`), `setPortions` / `getPortions` context helpers. UI: `PortionStepper.svelte`.
